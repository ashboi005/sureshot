from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
import uuid

from config import get_db
from models import DoctorPatientRelationship, UserProfile, DoctorDetails
from routers.auth.auth import get_current_user
from .schemas import PatientResponse, DoctorIdResponse

router = APIRouter(prefix="/doctors", tags=["doctors"])

@router.get("/get-doctor-id/{user_id}", response_model=DoctorIdResponse)
async def get_doctor_id_by_user_id(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get doctor_id for a given user_id"""
    try:
        # Convert string to UUID
        user_uuid = uuid.UUID(user_id)
        
        # Query doctor details by user_id
        stmt = select(DoctorDetails).where(DoctorDetails.user_id == user_uuid)
        result = await db.execute(stmt)
        doctor = result.scalar_one_or_none()
        
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Doctor profile not found for user_id: {user_id}"
            )
        
        return {
            "user_id": str(doctor.user_id),
            "doctor_id": str(doctor.id),
            "specialization": doctor.specialization,
            "hospital_affiliation": doctor.hospital_affiliation
        }
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user_id format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving doctor information: {str(e)}"
        )

@router.get("/my-patients", response_model=List[PatientResponse])
async def get_my_patients(
    db: AsyncSession = Depends(get_db), 
    current_user=Depends(get_current_user)
):
    """Get all patients linked to the current doctor"""
    
    # First get the doctor record for current user
    doctor_stmt = select(DoctorDetails).where(DoctorDetails.user_id == current_user["supabase_user"].id)
    doctor_result = await db.execute(doctor_stmt)
    doctor = doctor_result.scalar_one_or_none()
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )
    
    # Get all patients linked to this doctor
    stmt = select(DoctorPatientRelationship, UserProfile).join(
        UserProfile, DoctorPatientRelationship.user_id == UserProfile.user_id
    ).where(
        DoctorPatientRelationship.doctor_id == doctor.id
    ).order_by(UserProfile.baby_name)
    
    result = await db.execute(stmt)
    relationships = result.all()
    
    patients = []
    for relationship, profile in relationships:
        patients.append(PatientResponse(
            user_id=str(profile.user_id),
            baby_name=profile.baby_name,
            baby_date_of_birth=profile.baby_date_of_birth.date() if isinstance(profile.baby_date_of_birth, datetime) else profile.baby_date_of_birth,
            parent_name=profile.parent_name,
            parent_mobile=profile.parent_mobile,
            parent_email=profile.parent_email,
            gender=profile.gender,
            blood_group=profile.blood_group,
            address=profile.address,
            city=profile.city,
            state=profile.state,
            pin_code=profile.pin_code,
            first_interaction_date=relationship.first_interaction_date.date() if isinstance(relationship.first_interaction_date, datetime) else relationship.first_interaction_date
        ))
    
    return patients
