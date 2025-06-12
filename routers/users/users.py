from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from config import get_db
from models import UserProfile
from routers.auth.auth import get_current_user
from .schemas import (
    UserProfileUpdate,
    UserProfileResponse,
    ProfileImageUpload
)
from .helpers import user_helpers
from typing import Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])

security = HTTPBearer()

@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    current_user = Depends(get_current_user)
):
    """Get current user's profile information"""
    profile = current_user["profile"]
    supabase_user = current_user["supabase_user"]
    
    return UserProfileResponse(
        id=str(profile.id),
        user_id=str(profile.user_id),
        username=profile.username,
        email=supabase_user.email,  
        first_name=profile.first_name,
        last_name=profile.last_name,
        display_name=profile.display_name,
        bio=profile.bio,
        avatar_url=profile.avatar_url,
        custom_font=profile.custom_font,
        custom_colors=profile.custom_colors,
        date_of_birth=profile.date_of_birth,
        timezone=profile.timezone,
        language=profile.language,
        preferences=profile.preferences,
        created_at=profile.created_at,
        updated_at=profile.updated_at
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
        
        if profile_update.username and profile_update.username != profile.username:
            result = await db.execute(
                select(UserProfile).where(
                    and_(
                        UserProfile.username == profile_update.username,
                        UserProfile.id != profile.id
                    )
                )
            )
            existing_user = result.scalar_one_or_none()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        update_data = profile_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(profile, field, value)
        

        profile.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(profile)
        
        return UserProfileResponse(
            id=str(profile.id),
            user_id=str(profile.user_id),
            username=profile.username,
            email=supabase_user.email,  
            first_name=profile.first_name,
            last_name=profile.last_name,
            display_name=profile.display_name,
            bio=profile.bio,
            avatar_url=profile.avatar_url,
            date_of_birth=profile.date_of_birth,
            timezone=profile.timezone,
            language=profile.language,
            preferences=profile.preferences,
            created_at=profile.created_at,
            updated_at=profile.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
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
            detail="Failed to delete profile image"        )
