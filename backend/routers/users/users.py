from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from config import get_db, get_supabase_client
from models import UserProfile, VaccineTemplate, VaccinationRecord, VaccinationDrive, DriveParticipant
from routers.auth.auth import get_current_user
from .schemas import (
    UserProfileUpdate,
    UserProfileResponse,
    CreateUserProfileRequest,
    ProfileImageUpload
)
from routers.admin.schemas import VaccinationDriveResponse
from .helpers import user_helpers
from typing import Optional
import logging
from datetime import datetime, timedelta
import uuid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])

async def create_vaccination_records_for_baby(db: AsyncSession, user_id: uuid.UUID, baby_birth_date: datetime.date):
    """
    Automatically create vaccination records for a new baby based on vaccine templates
    """
    try:
        # Get all vaccine templates
        templates_result = await db.execute(select(VaccineTemplate))
        templates = templates_result.scalars().all()
        
        if not templates:
            logger.warning("No vaccine templates found in database")
            return 0
        
        # Create vaccination records for each template and dose
        vaccination_records = []
        
        for template in templates:
            for dose_number in range(1, template.total_doses + 1):
                # Calculate due date based on baby's birth date
                days_offset = template.recommended_age_days + ((dose_number - 1) * template.dose_interval_days)
                due_date = baby_birth_date + timedelta(days=days_offset)
                
                vaccination_record = VaccinationRecord(
                    user_id=user_id,
                    vaccine_template_id=template.id,
                    dose_number=dose_number,
                    due_date=due_date,
                    is_administered=False
                )
                
                vaccination_records.append(vaccination_record)
        
        # Add all records to database
        db.add_all(vaccination_records)
        await db.flush()  # Flush to get IDs but don't commit yet
        
        logger.info(f"Created {len(vaccination_records)} vaccination records for baby {user_id}")
        return len(vaccination_records)
        
    except Exception as e:
        logger.error(f"Error creating vaccination records: {str(e)}")
        raise e

@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    current_user = Depends(get_current_user)
):
    """Get current user's profile information"""
    profile = current_user["profile"]
    supabase_user = current_user["supabase_user"]
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Please create a profile first."
        )
    
    return UserProfileResponse(
        id=str(profile.id),
        user_id=str(profile.user_id),
        email=supabase_user.email,
        baby_name=profile.baby_name,
        baby_date_of_birth=profile.baby_date_of_birth,
        parent_name=profile.parent_name,
        parent_mobile=profile.parent_mobile,
        parent_email=profile.parent_email,
        gender=profile.gender,
        blood_group=profile.blood_group,
        address=profile.address,
        city=profile.city,
        state=profile.state,
        pin_code=profile.pin_code,
        avatar_url=profile.avatar_url,
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )

@router.post("/profile", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_user_profile(
    profile_data: CreateUserProfileRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create user profile for baby vaccination tracking"""
    try:
        supabase_user = current_user["supabase_user"]
        
        # Check if profile already exists
        result = await db.execute(
            select(UserProfile).where(UserProfile.user_id == supabase_user.id)
        )
        existing_profile = result.scalar_one_or_none()
        
        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User profile already exists"
            )
          # Create new profile
        new_profile = UserProfile(
            user_id=supabase_user.id,
            username=profile_data.username,
            baby_name=profile_data.baby_name,
            baby_date_of_birth=profile_data.baby_date_of_birth,
            parent_name=profile_data.parent_name,
            parent_mobile=profile_data.parent_mobile,
            parent_email=profile_data.parent_email,
            gender=profile_data.gender,
            blood_group=profile_data.blood_group,
            address=profile_data.address,
            city=profile_data.city,
            state=profile_data.state,
            pin_code=profile_data.pin_code        )
        
        db.add(new_profile)
        await db.flush()  # Flush to get the profile ID
        
        # Automatically create vaccination records for the baby
        try:
            vaccination_count = await create_vaccination_records_for_baby(
                db, new_profile.user_id, profile_data.baby_date_of_birth
            )
            logger.info(f"Created {vaccination_count} vaccination records for baby {new_profile.baby_name}")
        except Exception as vaccine_error:
            logger.error(f"Failed to create vaccination records: {str(vaccine_error)}")
            # Don't fail the profile creation if vaccination records fail
        
        await db.commit()
        await db.refresh(new_profile)
          # Update display_name in auth table to baby's name
        try:
            supabase = get_supabase_client()
            supabase.auth.admin.update_user_by_id(
                str(supabase_user.id),
                {"user_metadata": {"display_name": profile_data.baby_name}}
            )
        except Exception as e:
            logger.warning(f"Failed to update display name in auth table: {str(e)}")
        
        return UserProfileResponse(
            id=str(new_profile.id),
            user_id=str(new_profile.user_id),
            email=supabase_user.email,
            username=new_profile.username,
            baby_name=new_profile.baby_name,
            baby_date_of_birth=new_profile.baby_date_of_birth,
            parent_name=new_profile.parent_name,
            parent_mobile=new_profile.parent_mobile,
            parent_email=new_profile.parent_email,
            gender=new_profile.gender,
            blood_group=new_profile.blood_group,
            address=new_profile.address,
            city=new_profile.city,
            state=new_profile.state,
            pin_code=new_profile.pin_code,
            avatar_url=new_profile.avatar_url,
            created_at=new_profile.created_at,
            updated_at=new_profile.updated_at
        )
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Profile creation failed: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile creation failed"
        )

@router.put("/me", response_model=UserProfileResponse)
async def update_current_user_profile(
    profile_update: UserProfileUpdate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user's profile information"""
    try:
        profile = current_user["profile"]
        supabase_user = current_user["supabase_user"]
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        update_data = profile_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(profile, field, value)
        
        profile.updated_at = datetime.utcnow()
        
        # If baby name is updated, update display_name in auth table
        if profile_update.baby_name:
            try:
                supabase = get_supabase_client()
                supabase.auth.admin.update_user_by_id(
                    str(supabase_user.id),
                    {"user_metadata": {"display_name": profile_update.baby_name}}
                )
            except Exception as e:
                logger.warning(f"Failed to update display name in auth table: {str(e)}")
        
        await db.commit()
        await db.refresh(profile)
        
        return UserProfileResponse(
            id=str(profile.id),
            user_id=str(profile.user_id),
            email=supabase_user.email,
            baby_name=profile.baby_name,
            baby_date_of_birth=profile.baby_date_of_birth,
            parent_name=profile.parent_name,
            parent_mobile=profile.parent_mobile,
            parent_email=profile.parent_email,
            gender=profile.gender,
            blood_group=profile.blood_group,
            address=profile.address,
            city=profile.city,
            state=profile.state,
            pin_code=profile.pin_code,
            avatar_url=profile.avatar_url,
            created_at=profile.created_at,
            updated_at=profile.updated_at
        )
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Profile update failed: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed"
        )

@router.post("/me/profile-image", response_model=ProfileImageUpload)
async def upload_profile_image(
    file: UploadFile = File(..., description="Profile image file (JPEG, PNG, GIF, or WebP, max 5MB)"),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a new profile image
    
    Accepts image files in the following formats:
    - JPEG (.jpg, .jpeg)
    - PNG (.png) 
    - GIF (.gif)
    - WebP (.webp)
    
    Maximum file size: 5MB
    """
    try:
        profile = current_user["profile"]
        
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No file uploaded"
            )
        
        if profile.avatar_url:
            await user_helpers.delete_profile_image(profile.avatar_url)
        
        image_url = await user_helpers.upload_profile_image(str(profile.id), file)
        
        profile.avatar_url = image_url
        profile.updated_at = datetime.utcnow()
        await db.commit()
        
        return ProfileImageUpload(
            avatar_url=image_url,
            message="Profile image uploaded successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading profile image: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload profile image"
        )

@router.delete("/me/profile-image")
async def delete_profile_image(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete current user's profile image"""
    try:
        profile = current_user["profile"]
        
        if not profile.avatar_url:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No profile image found"
            )
        
        deleted = await user_helpers.delete_profile_image(profile.avatar_url)

        profile.avatar_url = None
        profile.updated_at = datetime.utcnow()
        
        await db.commit()
        
        return {
            "message": "Profile image deleted successfully",
            "storage_deleted": deleted
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting profile image: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete profile image"
        )


@router.get("/active-drives")
async def get_active_vaccination_drives(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get active vaccination drives in user's city where they haven't participated yet
    """
    try:
        # Get user data from current_user
        supabase_user = current_user["supabase_user"]
        profile = current_user["profile"]
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Get active drives in user's city
        current_time = datetime.utcnow()
        active_drives_query = select(VaccinationDrive).where(
            and_(
                VaccinationDrive.vaccination_city == profile.city,
                VaccinationDrive.end_date > current_time,
                VaccinationDrive.is_active == True
            )
        )
        
        drives_result = await db.execute(active_drives_query)
        active_drives = drives_result.scalars().all()
        
        # Filter out drives where user has already participated
        available_drives = []
        for drive in active_drives:            # Check if user has already participated in this drive
            participant_check = await db.execute(
                select(DriveParticipant).where(
                    and_(
                        DriveParticipant.vaccination_drive_id == drive.id,
                        DriveParticipant.user_id == supabase_user.id
                    )
                )
            )
            existing_participant = participant_check.scalar_one_or_none()
            
            # If user hasn't participated or hasn't been vaccinated yet, include the drive
            if not existing_participant or not existing_participant.is_vaccinated:
                available_drives.append(VaccinationDriveResponse(
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
                    assigned_workers=[]
                ))
        
        return {
            "drives": available_drives,
            "total": len(available_drives),
            "user_city": profile.city
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching active drives: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch active vaccination drives"
        )
