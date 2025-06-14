from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from config import get_db
from models import WorkerDetails, VaccinationDrive, DriveWorkerAssignment, DriveParticipant, AccountType
from routers.auth.auth import get_current_user
from routers.admin.schemas import VaccinationDriveResponse, WorkerResponse, VaccinationDriveListResponse, DocumentUploadResponse
from .schemas import DriveParticipantResponse, DriveParticipantListResponse, AdministerDriveVaccineRequest, AdministerDriveVaccineResponse
from .helpers import upload_worker_profile_document
from typing import Optional
import logging
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/workers", tags=["Workers"])

security = HTTPBearer()

async def get_worker_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    """Get current worker user and verify worker privileges"""
    current_user = await get_current_user(credentials, db)
    
    if current_user["profile"].account_type != AccountType.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Worker privileges required"
        )
    
    return current_user

@router.get("/my-drives", response_model=VaccinationDriveListResponse)
async def get_my_vaccination_drives(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    current_worker=Depends(get_worker_user)
):
    """Get vaccination drives assigned to the current worker"""
    try:
        # Get worker details
        worker_result = await db.execute(
            select(WorkerDetails).where(WorkerDetails.user_id == current_worker["supabase_user"].id)
        )
        worker = worker_result.scalar_one_or_none()
        
        if not worker:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Worker profile not found"
            )
        
        # Get drive assignments for this worker
        assignments_query = select(DriveWorkerAssignment).where(
            DriveWorkerAssignment.worker_id == worker.id
        )
        
        assignments_result = await db.execute(assignments_query)
        assignments = assignments_result.scalars().all()
        
        if not assignments:
            return VaccinationDriveListResponse(drives=[], total=0)
        
        # Get drive IDs
        drive_ids = [assignment.drive_id for assignment in assignments]
        
        # Query drives
        drives_query = select(VaccinationDrive).where(
            VaccinationDrive.id.in_(drive_ids)
        )
        
        if active_only:
            drives_query = drives_query.where(VaccinationDrive.is_active == True)
        
        # Get total count
        total_result = await db.execute(drives_query)
        total = len(total_result.scalars().all())
        
        # Get paginated results
        drives_query = drives_query.offset(skip).limit(limit).order_by(VaccinationDrive.start_date.desc())
        drives_result = await db.execute(drives_query)
        drives = drives_result.scalars().all()
        
        drive_responses = []
        for drive in drives:            # For worker view, we don't need to load all assigned workers
            # to keep the response light
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
                assigned_workers=[]  # Empty for worker view to keep response light
            ))
        
        return VaccinationDriveListResponse(drives=drive_responses, total=total)
        
    except Exception as e:
        logger.error(f"Failed to get worker's vaccination drives: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve vaccination drives"
        )

@router.get("/profile")
async def get_worker_profile(
    db: AsyncSession = Depends(get_db),
    current_worker=Depends(get_worker_user)
):
    """Get current worker's profile details"""
    try:
        # Get worker details
        worker_result = await db.execute(
            select(WorkerDetails).where(WorkerDetails.user_id == current_worker["supabase_user"].id)
        )
        worker = worker_result.scalar_one_or_none()
        
        if not worker:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Worker profile not found"
            )
        
        return WorkerResponse(
            id=str(worker.id),
            user_id=str(worker.user_id),
            city_name=worker.city_name,
            certificate_number=worker.certificate_number,
            government_id=worker.government_id,
            certificate_photo_url=worker.certificate_photo_url,
            specialization=worker.specialization,
            experience_years=worker.experience_years,
            is_active=worker.is_active,
            created_at=worker.created_at,
            username=current_worker["profile"].username,
            first_name=current_worker["profile"].first_name,
            last_name=current_worker["profile"].last_name
        )
        
    except Exception as e:
        logger.error(f"Failed to get worker profile: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve worker profile"
        )


@router.get("/drive-participants/{drive_id}", response_model=DriveParticipantListResponse)
async def get_drive_participants(
    drive_id: str,
    db: AsyncSession = Depends(get_db),
    current_worker=Depends(get_worker_user)
):
    """
    Get all participants for a vaccination drive - for house-to-house vaccination
    """
    try:
        drive_uuid = uuid.UUID(drive_id)
        
        # Verify worker is assigned to this drive
        assignment_check = await db.execute(
            select(DriveWorkerAssignment).where(
                and_(
                    DriveWorkerAssignment.drive_id == drive_uuid,
                    DriveWorkerAssignment.worker_id == current_worker["worker_details"].id
                )
            )
        )
        
        if not assignment_check.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not assigned to this vaccination drive"
            )
        
        # Get drive details
        drive_result = await db.execute(
            select(VaccinationDrive).where(VaccinationDrive.id == drive_uuid)
        )
        drive = drive_result.scalar_one_or_none()
        
        if not drive:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vaccination drive not found"
            )
        
        # Get all participants for this drive
        participants_result = await db.execute(
            select(DriveParticipant).where(
                DriveParticipant.vaccination_drive_id == drive_uuid
            ).order_by(DriveParticipant.is_vaccinated, DriveParticipant.baby_name)
        )
        participants = participants_result.scalars().all()
        
        participant_responses = []
        for participant in participants:
            participant_responses.append(DriveParticipantResponse(
                id=str(participant.id),
                user_id=str(participant.user_id),
                baby_name=participant.baby_name,
                parent_name=participant.parent_name,
                parent_mobile=participant.parent_mobile,
                address=participant.address,
                is_vaccinated=participant.is_vaccinated,
                vaccination_date=participant.vaccination_date,
                worker_id=str(participant.worker_id) if participant.worker_id else None,
                notes=participant.notes,
                created_at=participant.created_at,
                updated_at=participant.updated_at
            ))
        
        return DriveParticipantListResponse(
            participants=participant_responses,
            total=len(participant_responses),
            drive_name=drive.vaccination_name,
            drive_city=drive.vaccination_city
        )
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid drive ID format"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching drive participants: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch drive participants"
        )


@router.post("/administer-drive-vaccine/{drive_id}", response_model=AdministerDriveVaccineResponse)
async def administer_drive_vaccine(
    drive_id: str,
    request: AdministerDriveVaccineRequest,
    db: AsyncSession = Depends(get_db),
    current_worker=Depends(get_worker_user)
):
    """
    Mark a participant as vaccinated in a vaccination drive
    """
    try:
        drive_uuid = uuid.UUID(drive_id)
        user_uuid = uuid.UUID(request.user_id)
        
        # Verify worker is assigned to this drive
        assignment_check = await db.execute(
            select(DriveWorkerAssignment).where(
                and_(
                    DriveWorkerAssignment.drive_id == drive_uuid,
                    DriveWorkerAssignment.worker_id == current_worker["worker_details"].id
                )
            )
        )
        
        if not assignment_check.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not assigned to this vaccination drive"
            )
        
        # Get the participant record
        participant_result = await db.execute(
            select(DriveParticipant).where(
                and_(
                    DriveParticipant.vaccination_drive_id == drive_uuid,
                    DriveParticipant.user_id == user_uuid
                )
            )
        )
        participant = participant_result.scalar_one_or_none()
        
        if not participant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Participant not found in this vaccination drive"
            )
        
        if participant.is_vaccinated:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Participant has already been vaccinated"
            )
        
        # Update participant record
        participant.is_vaccinated = True
        participant.vaccination_date = request.vaccination_date
        participant.worker_id = current_worker["worker_details"].id
        participant.notes = request.notes
        participant.updated_at = datetime.utcnow()
        
        await db.commit()
        
        return AdministerDriveVaccineResponse(
            id=str(participant.id),
            user_id=str(participant.user_id),
            baby_name=participant.baby_name,
            is_vaccinated=participant.is_vaccinated,
            vaccination_date=participant.vaccination_date,
            worker_id=str(participant.worker_id),
            notes=participant.notes
        )
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error administering drive vaccine: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to administer vaccine"
        )
