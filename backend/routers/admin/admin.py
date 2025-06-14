from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete
from sqlalchemy.orm import selectinload, joinedload
from config import get_db, get_supabase_client
from models import UserProfile, WorkerDetails, DoctorDetails, VaccinationDrive, DriveWorkerAssignment, DriveParticipant, AccountType, Users
from routers.auth.auth import get_current_user
from .schemas import (
    CreateWorkerRequest, 
    CreateDoctorRequest, 
    CreateVaccinationDriveRequest,
    UpdateVaccinationDriveRequest,
    WorkerResponse, 
    DoctorResponse, 
    VaccinationDriveResponse,
    WorkerListResponse,
    DoctorListResponse,
    VaccinationDriveListResponse,
    DocumentUploadResponse
)
from .helpers import upload_worker_document, upload_doctor_document, create_drive_participants, notify_assigned_workers, notify_drive_participants
from typing import Optional, List
from datetime import datetime
import logging
import uuid

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/admin", tags=["Admin"])

security = HTTPBearer()
supabase = get_supabase_client()


async def get_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    """Get current admin user and verify admin privileges"""
    current_user = await get_current_user(credentials, db)
    
    if current_user["profile"].account_type != AccountType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    return current_user

# Document Upload Routes
@router.post("/upload/worker-document", response_model=DocumentUploadResponse)
async def upload_worker_document_route(
    file: UploadFile = File(...),
    worker_id: str = Query(..., description="ID of the worker to upload document for"),
    current_admin=Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload worker government ID document"""
    try:
        # Check if worker exists
        stmt = select(WorkerDetails).where(WorkerDetails.id == worker_id)
        result = await db.execute(stmt)
        worker = result.scalar_one_or_none()
        
        if not worker:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Worker not found"
            )
        
        upload_result = await upload_worker_document(file, "government_id")
        
        # Update the worker's government_id_url in the database
        worker.government_id_url = upload_result["file_url"]
        await db.commit()
        
        return DocumentUploadResponse(**upload_result)
        
    except Exception as e:
        logger.error(f"Worker document upload failed: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document upload failed"
        )

@router.post("/upload/doctor-document", response_model=DocumentUploadResponse)
async def upload_doctor_document_route(
    file: UploadFile = File(...),
    doctor_id: str = Query(..., description="ID of the doctor to upload document for"),
    current_admin=Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload doctor medical council registration certificate"""
    try:
        # Check if doctor exists
        stmt = select(DoctorDetails).where(DoctorDetails.id == doctor_id)
        result = await db.execute(stmt)
        doctor = result.scalar_one_or_none()
        
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )
        
        upload_result = await upload_doctor_document(file, "medical_council_registration")
        
        # Update the doctor's medical_council_registration_url in the database
        doctor.medical_council_registration_url = upload_result["file_url"]
        await db.commit()
        
        return DocumentUploadResponse(**upload_result)
        
    except Exception as e:
        logger.error(f"Doctor document upload failed: {str(e)}")        
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document upload failed"
        )

# Worker Management Routes
@router.post("/workers", response_model=WorkerResponse, status_code=status.HTTP_201_CREATED)
async def create_worker(
    worker_data: CreateWorkerRequest,
    db: AsyncSession = Depends(get_db),
    current_admin=Depends(get_admin_user)
):
    """Create a new healthcare worker"""
    try:
        # Check if username already exists
        existing_user = await db.execute(
            select(UserProfile).where(UserProfile.username == worker_data.username)
        )
        if existing_user.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Create Supabase user
        auth_response = supabase.auth.sign_up({
            "email": worker_data.email,
            "password": worker_data.password,
            "options": {
                "data": {
                    "username": worker_data.username,
                    "first_name": worker_data.first_name,
                    "last_name": worker_data.last_name
                }
            }
        })
        
        if auth_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user account"
            )
        
        # Create user profile
        new_user_profile = UserProfile(
            user_id=auth_response.user.id,
            username=worker_data.username,
            first_name=worker_data.first_name,
            last_name=worker_data.last_name,
            account_type=AccountType.WORKER
        )
        
        db.add(new_user_profile)
        await db.flush()  # Get the user profile ID
          # Create worker details
        worker_details = WorkerDetails(
            user_id=auth_response.user.id,
            city_name=worker_data.city_name,
            specialization=worker_data.specialization,
            experience_years=worker_data.experience_years
        )
        
        db.add(worker_details)
        await db.commit()
        await db.refresh(worker_details)
        
        return WorkerResponse(
            id=str(worker_details.id),
            user_id=str(worker_details.user_id),
            city_name=worker_details.city_name,
            government_id_url=worker_details.government_id_url,
            specialization=worker_details.specialization,
            experience_years=worker_details.experience_years,
            is_active=worker_details.is_active,
            created_at=worker_details.created_at,
            username=new_user_profile.username,
            first_name=new_user_profile.first_name,
            last_name=new_user_profile.last_name,
            email=worker_data.email
        )
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Worker creation failed: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Worker creation failed"
        )

@router.get("/workers", response_model=WorkerListResponse)
async def get_workers(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    city: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),    current_admin=Depends(get_admin_user)
):
    """Get all workers with optional city filter"""
    try:
        query = select(WorkerDetails).options(
            joinedload(WorkerDetails.user).joinedload(Users.user_profile)
        )
        
        if city:
            query = query.where(WorkerDetails.city_name.ilike(f"%{city}%"))
        
        # Get total count
        count_query = select(WorkerDetails)
        if city:
            count_query = count_query.where(WorkerDetails.city_name.ilike(f"%{city}%"))
        
        total_result = await db.execute(count_query)
        total = len(total_result.scalars().all())
        
        # Get paginated results
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        workers = result.scalars().all()
        
        worker_responses = []
        for worker in workers:            # Get user profile
            profile_result = await db.execute(
                select(UserProfile).where(UserProfile.user_id == worker.user_id)
            )
            profile = profile_result.scalar_one_or_none()
            
            worker_responses.append(WorkerResponse(
                id=str(worker.id),
                user_id=str(worker.user_id),
                city_name=worker.city_name,
                government_id_url=worker.government_id_url,
                specialization=worker.specialization,
                experience_years=worker.experience_years,
                is_active=worker.is_active,
                created_at=worker.created_at,
                username=profile.username if profile else None,
                first_name=profile.first_name if profile else None,
                last_name=profile.last_name if profile else None
            ))
        
        return WorkerListResponse(workers=worker_responses, total=total)
        
    except Exception as e:
        logger.error(f"Failed to get workers: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve workers"
        )

# Doctor Management Routes
@router.post("/doctors", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
async def create_doctor(
    doctor_data: CreateDoctorRequest,
    db: AsyncSession = Depends(get_db),
    current_admin=Depends(get_admin_user)
):
    """Create a new doctor"""
    try:
        # Check if username already exists
        existing_user = await db.execute(
            select(UserProfile).where(UserProfile.username == doctor_data.username)
        )
        if existing_user.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Create Supabase user
        auth_response = supabase.auth.sign_up({
            "email": doctor_data.email,
            "password": doctor_data.password,
            "options": {
                "data": {
                    "username": doctor_data.username,
                    "first_name": doctor_data.first_name,
                    "last_name": doctor_data.last_name
                }
            }
        })
        
        if auth_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user account"
            )
        
        # Create user profile
        new_user_profile = UserProfile(
            user_id=auth_response.user.id,
            username=doctor_data.username,
            first_name=doctor_data.first_name,
            last_name=doctor_data.last_name,
            account_type=AccountType.DOCTOR
        )
        
        db.add(new_user_profile)
        await db.flush()
        
        # Create doctor details
        doctor_details = DoctorDetails(
            user_id=auth_response.user.id,
            medical_license_number=doctor_data.medical_license_number,
            medical_council_registration=doctor_data.medical_council_registration,
            license_photo_url=doctor_data.license_photo_url,
            specialization=doctor_data.specialization,
            hospital_affiliation=doctor_data.hospital_affiliation,
            experience_years=doctor_data.experience_years
        )
        
        db.add(doctor_details)
        await db.commit()
        await db.refresh(doctor_details)
        
        return DoctorResponse(
            id=str(doctor_details.id),
            user_id=str(doctor_details.user_id),
            medical_license_number=doctor_details.medical_license_number,
            medical_council_registration=doctor_details.medical_council_registration,
            license_photo_url=doctor_details.license_photo_url,
            specialization=doctor_details.specialization,
            hospital_affiliation=doctor_details.hospital_affiliation,
            experience_years=doctor_details.experience_years,
            is_active=doctor_details.is_active,
            created_at=doctor_details.created_at,
            username=new_user_profile.username,
            first_name=new_user_profile.first_name,
            last_name=new_user_profile.last_name,
            email=doctor_data.email
        )
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Doctor creation failed: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Doctor creation failed"
        )

@router.get("/doctors", response_model=DoctorListResponse)
async def get_doctors(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_admin=Depends(get_admin_user)
):
    """Get all doctors"""
    try:
        # Get total count
        total_result = await db.execute(select(DoctorDetails))
        total = len(total_result.scalars().all())
        
        # Get paginated results
        query = select(DoctorDetails).offset(skip).limit(limit)
        result = await db.execute(query)
        doctors = result.scalars().all()
        
        doctor_responses = []
        for doctor in doctors:
            # Get user profile
            profile_result = await db.execute(
                select(UserProfile).where(UserProfile.user_id == doctor.user_id)
            )
            profile = profile_result.scalar_one_or_none()
            
            doctor_responses.append(DoctorResponse(
                id=str(doctor.id),
                user_id=str(doctor.user_id),
                medical_license_number=doctor.medical_license_number,
                medical_council_registration=doctor.medical_council_registration,
                license_photo_url=doctor.license_photo_url,
                specialization=doctor.specialization,
                hospital_affiliation=doctor.hospital_affiliation,
                experience_years=doctor.experience_years,
                is_active=doctor.is_active,
                created_at=doctor.created_at,
                username=profile.username if profile else None,
                first_name=profile.first_name if profile else None,
                last_name=profile.last_name if profile else None
            ))
        
        return DoctorListResponse(doctors=doctor_responses, total=total)
        
    except Exception as e:
        logger.error(f"Failed to get doctors: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve doctors"
        )

# Vaccination Drive Management Routes
@router.post("/vaccination-drives", response_model=VaccinationDriveResponse, status_code=status.HTTP_201_CREATED)
async def create_vaccination_drive(
    drive_data: CreateVaccinationDriveRequest,
    db: AsyncSession = Depends(get_db),
    current_admin=Depends(get_admin_user)
):
    """Create a new vaccination drive"""
    try:
        # Validate dates
        if drive_data.end_date <= drive_data.start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End date must be after start date"
            )
          # Create vaccination drive
        vaccination_drive = VaccinationDrive(
            vaccination_name=drive_data.vaccination_name,
            start_date=drive_data.start_date,
            end_date=drive_data.end_date,
            vaccination_city=drive_data.vaccination_city,
            description=drive_data.description,
            created_by=current_admin["supabase_user"].id
        )
        
        db.add(vaccination_drive)
        await db.flush()  # Get the drive ID
        
        # Assign workers if provided
        assigned_workers = []
        if drive_data.assigned_worker_ids:
            for worker_id_str in drive_data.assigned_worker_ids:
                try:
                    worker_id = uuid.UUID(worker_id_str)
                    
                    # Verify worker exists
                    worker_result = await db.execute(
                        select(WorkerDetails).where(WorkerDetails.id == worker_id)
                    )
                    worker = worker_result.scalar_one_or_none()
                    
                    if not worker:
                        logger.warning(f"Worker {worker_id} not found, skipping assignment")
                        continue
                      # Create assignment
                    assignment = DriveWorkerAssignment(
                        drive_id=vaccination_drive.id,
                        worker_id=worker_id
                    )
                    db.add(assignment)
                    assigned_workers.append(worker)
                    
                except ValueError:
                    logger.warning(f"Invalid worker ID format: {worker_id_str}")
                    continue
        
        await db.commit()
        await db.refresh(vaccination_drive)
        
        # Auto-create drive participants for all users in the same city
        await create_drive_participants(db, vaccination_drive)
        
        # Send notifications to assigned workers
        if assigned_workers:
            await notify_assigned_workers(db, vaccination_drive, assigned_workers)
        
        # Send notifications to participants
        await notify_drive_participants(db, vaccination_drive)
        
        # Prepare worker responses
        worker_responses = []
        for worker in assigned_workers:
            profile_result = await db.execute(
                select(UserProfile).where(UserProfile.user_id == worker.user_id)
            )
            profile = profile_result.scalar_one_or_none()
            
            worker_responses.append(WorkerResponse(
                id=str(worker.id),
                user_id=str(worker.user_id),
                city_name=worker.city_name,
                government_id_url=worker.government_id_url,
                specialization=worker.specialization,
                experience_years=worker.experience_years,
                is_active=worker.is_active,
                created_at=worker.created_at,
                username=profile.username if profile else None,
                first_name=profile.first_name if profile else None,
                last_name=profile.last_name if profile else None            ))
        
        return VaccinationDriveResponse(
            id=str(vaccination_drive.id),
            vaccination_name=vaccination_drive.vaccination_name,
            start_date=vaccination_drive.start_date,
            end_date=vaccination_drive.end_date,
            vaccination_city=vaccination_drive.vaccination_city,
            description=vaccination_drive.description,
            is_active=vaccination_drive.is_active,
            created_by=str(vaccination_drive.created_by),
            created_at=vaccination_drive.created_at,
            updated_at=vaccination_drive.updated_at,
            assigned_workers=worker_responses
        )
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Vaccination drive creation failed: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Vaccination drive creation failed"
        )

@router.get("/vaccination-drives", response_model=VaccinationDriveListResponse)
async def get_vaccination_drives(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    city: Optional[str] = Query(None),
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    current_admin=Depends(get_admin_user)
):
    """Get all vaccination drives with optional filters"""
    try:
        query = select(VaccinationDrive)
        
        if city:
            query = query.where(VaccinationDrive.vaccination_city.ilike(f"%{city}%"))
        
        if active_only:
            query = query.where(VaccinationDrive.is_active == True)
        
        # Get total count
        count_result = await db.execute(query)
        total = len(count_result.scalars().all())
        
        # Get paginated results
        query = query.offset(skip).limit(limit).order_by(VaccinationDrive.created_at.desc())
        result = await db.execute(query)
        drives = result.scalars().all()
        
        drive_responses = []
        for drive in drives:
            # Get assigned workers
            assignments_result = await db.execute(
                select(DriveWorkerAssignment).where(DriveWorkerAssignment.drive_id == drive.id)
            )
            assignments = assignments_result.scalars().all()
            
            worker_responses = []
            for assignment in assignments:
                worker_result = await db.execute(
                    select(WorkerDetails).where(WorkerDetails.id == assignment.worker_id)
                )
                worker = worker_result.scalar_one_or_none()
                if worker:
                    profile_result = await db.execute(
                        select(UserProfile).where(UserProfile.user_id == worker.user_id)
                    )
                    profile = profile_result.scalar_one_or_none()
                    
                    worker_responses.append(WorkerResponse(
                        id=str(worker.id),
                        user_id=str(worker.user_id),
                        city_name=worker.city_name,
                        government_id_url=worker.government_id_url,
                        specialization=worker.specialization,
                        experience_years=worker.experience_years,
                        is_active=worker.is_active,
                        created_at=worker.created_at,
                        username=profile.username if profile else None,
                        first_name=profile.first_name if profile else None,
                        last_name=profile.last_name if profile else None                    ))
            
            drive_responses.append(VaccinationDriveResponse(
                id=str(drive.id),
                vaccination_name=drive.vaccination_name,
                start_date=drive.start_date,
                end_date=drive.end_date,
                vaccination_city=drive.vaccination_city,
                description=drive.description,
                is_active=drive.is_active,
                created_by=str(drive.created_by),
                created_at=drive.created_at,
                updated_at=drive.updated_at,
                assigned_workers=worker_responses
            ))
        
        return VaccinationDriveListResponse(drives=drive_responses, total=total)
        
    except Exception as e:
        logger.error(f"Failed to get vaccination drives: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve vaccination drives"
        )
