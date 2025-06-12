from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from config import get_db, get_supabase_client
from models import UserProfile
from .schemas import (
    UserRegister, 
    UserLogin, 
    AuthResponse, 
    UserResponse,
    TokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from .helpers import auth_helpers
from typing import Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/auth", tags=["Authentication"])

security = HTTPBearer()
supabase = get_supabase_client()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    """Get current user from JWT token"""
    token = credentials.credentials
    
    supabase_user = auth_helpers.verify_token(token)  
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == supabase_user.id)
    )
    user_profile = result.scalar_one_or_none()
    
    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    return {
        "supabase_user": supabase_user,
        "profile": user_profile
    }

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    try:
        existing_user = await db.execute(
            select(UserProfile).where(UserProfile.username == user_data.username)
        )
        if existing_user.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )      
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "username": user_data.username,
                    "first_name": user_data.first_name,
                    "last_name": user_data.last_name
                }
            }
        })
        
        if auth_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user account"
            )       
        supabase_user_id = auth_response.user.id
        new_user_profile = UserProfile(
            user_id=supabase_user_id,  
            username=user_data.username,
            first_name=user_data.first_name,
            last_name=user_data.last_name
        )
        
        db.add(new_user_profile)
        await db.commit()
        await db.refresh(new_user_profile)
        
        user_response = UserResponse(
            id=str(new_user_profile.id),
            user_id=str(new_user_profile.user_id),
            username=new_user_profile.username,
            first_name=new_user_profile.first_name,
            last_name=new_user_profile.last_name,
            display_name=new_user_profile.display_name,
            bio=new_user_profile.bio,
            avatar_url=new_user_profile.avatar_url,
            date_of_birth=new_user_profile.date_of_birth,
            timezone=new_user_profile.timezone,
            language=new_user_profile.language,
            preferences=new_user_profile.preferences,
            created_at=new_user_profile.created_at,
            updated_at=new_user_profile.updated_at
        )
        
        if auth_response.session is None:
            return AuthResponse(
                access_token="",  
                refresh_token="",  
                user=user_response,
                message="User created successfully. Please check your email to verify your account before logging in."
            )
        
        return AuthResponse(
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token,
            user=user_response
        )
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Registration failed: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=AuthResponse)
async def login(
    user_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if auth_response.user is None or auth_response.session is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )     
        result = await db.execute(
            select(UserProfile).where(UserProfile.user_id == auth_response.user.id)
        )
        user_profile = result.scalar_one_or_none()
        
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        user_response = UserResponse(
            id=str(user_profile.id),
            user_id=str(user_profile.user_id),
            username=user_profile.username,
            first_name=user_profile.first_name,
            last_name=user_profile.last_name,
            display_name=user_profile.display_name,
            bio=user_profile.bio,
            avatar_url=user_profile.avatar_url,
            date_of_birth=user_profile.date_of_birth,
            timezone=user_profile.timezone,
            language=user_profile.language,
            preferences=user_profile.preferences,            
            created_at=user_profile.created_at,
            updated_at=user_profile.updated_at
        )

        return AuthResponse(
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token,
            user=user_response
        )
        
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str
):
    try:
        session = await auth_helpers.refresh_token(refresh_token)
        
        return TokenResponse(
            access_token=session.access_token
        )
        
    except Exception as e:
        logger.error(f"Token refresh failed: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed"
        )

@router.post("/forgot-password")
async def forgot_password(
    request_data: ForgotPasswordRequest
):
    try:
        from config import ENVIRONMENT
        
        if ENVIRONMENT == "prod":
            redirect_url = "https://yourdomain.com/reset-password"
        elif ENVIRONMENT == "dev":
            redirect_url = "http://localhost:3000/reset-password"
        else:
            redirect_url = "http://localhost:3000/reset-password"
        
        response = supabase.auth.reset_password_email(
            request_data.email,
            options={"redirect_to": redirect_url}
        )
        
        return {"message": "If an account with that email exists, a password reset link has been sent."}
        
    except Exception as e:
        logger.error(f"Password reset email failed: {str(e)}")
        return {"message": "If an account with that email exists, a password reset link has been sent."}
    
@router.get("/verify-reset-token")
async def verify_reset_token(
    access_token: str,
    refresh_token: str
):
    try:
        response = supabase.auth.set_session(
            access_token=access_token,
            refresh_token=refresh_token
        )
        
        if not response.session:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset tokens"
            )
        
        supabase.auth.sign_out()
        
        return {
            "message": "Reset tokens are valid",
            "email": response.user.email if response.user else None
        }
        
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset tokens"
        )

@router.post("/reset-password")
async def reset_password(
    reset_data: ResetPasswordRequest
):
    try:
        session_data = {
            "access_token": reset_data.access_token,
            "refresh_token": reset_data.refresh_token
        }
        
        response = supabase.auth.set_session(
            access_token=reset_data.access_token,
            refresh_token=reset_data.refresh_token
        )
        
        if not response.session:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset tokens"
            )
        
        update_response = supabase.auth.update_user({
            "password": reset_data.new_password
        })
        
        if update_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update password"
            )
        
        supabase.auth.sign_out()
        
        return {"message": "Password reset successfully. You can now log in with your new password."}
        
    except Exception as e:
        logger.error(f"Password reset failed: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset failed. Please try requesting a new reset link."
        )

@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        token = credentials.credentials
        supabase.auth.sign_out()
        
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        logger.error(f"Logout failed: {str(e)}")
        return {"message": "Logout completed"}  

