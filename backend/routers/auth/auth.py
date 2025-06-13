from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from config import get_db, get_supabase_client
from models import UserProfile, AccountType
import logging
from .schemas import (
    UserRegister, 
    UserLogin, 
    AuthResponse, 
    UserResponse,
    TokenResponse,
    AccountTypeResponse,
    ForgotPasswordRequest,
    VerifyResetTokenRequest,
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
        
        try:
            new_user_profile = UserProfile(
                user_id=supabase_user_id,  
                username=user_data.username,
                first_name=user_data.first_name,
                last_name=user_data.last_name
            )
            
            db.add(new_user_profile)
            await db.commit()
            await db.refresh(new_user_profile)
            logger.info(f"Successfully created user profile for user {supabase_user_id}")
            
        except Exception as profile_error:
            logger.error(f"Failed to create user profile for user {supabase_user_id}: {str(profile_error)}")
            await db.rollback()
            # Try to delete the auth user if profile creation fails
            try:
                supabase.auth.admin.delete_user(supabase_user_id)
                logger.info(f"Cleaned up auth user {supabase_user_id} after profile creation failure")
            except Exception as cleanup_error:
                logger.error(f"Failed to cleanup auth user: {str(cleanup_error)}")
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Registration failed: {str(profile_error)}"
            )
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
            account_type=new_user_profile.account_type,
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
        
        # Convert Supabase user ID to UUID for proper comparison
        try:
            from uuid import UUID
            supabase_user_id = UUID(str(auth_response.user.id))
        except (ValueError, TypeError) as e:
            logger.error(f"Invalid user ID from Supabase: {auth_response.user.id}, error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid user ID format"
            )
        
        result = await db.execute(
            select(UserProfile).where(UserProfile.user_id == supabase_user_id)
        )
        user_profile = result.scalar_one_or_none()
        
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Handle account_type safely
        account_type = getattr(user_profile, 'account_type', AccountType.USER)
        if not isinstance(account_type, AccountType):
            logger.warning(f"Invalid account_type value: {account_type} of type {type(account_type)}, defaulting to USER")
            account_type = AccountType.USER
        
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
            account_type=account_type,
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
            redirect_url = "http://localhost:3000/auth/login"
        elif ENVIRONMENT == "dev":
            redirect_url = "http://localhost:8000/verify-reset-token"
        else:
            redirect_url = "http://localhost:8000/verify-reset-token"

        response = supabase.auth.reset_password_email(
            request_data.email,
            options={"redirect_to": redirect_url}
        )
        
        return {"message": "If an account with that email exists, a password reset link has been sent."}
        
    except Exception as e:
        logger.error(f"Password reset email failed: {str(e)}")
        return {"message": "If an account with that email exists, a password reset link has been sent."}
    
@router.post("/verify-reset-token")
async def verify_reset_token(
    token_data: VerifyResetTokenRequest
):
    try:
        response = supabase.auth.set_session(
            access_token=token_data.access_token,
            refresh_token=token_data.refresh_token
        )
        
        if not response.session:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset tokens"
            )
        
        
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
        
        # Parse Supabase error messages for more specific feedback
        error_message = str(e).lower()
        
        if "new password should be different from the old password" in error_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from your current password."
            )
        elif "password should be at least" in error_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password does not meet minimum requirements."
            )
        elif "session" in error_message and ("not exist" in error_message or "invalid" in error_message):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset tokens. Please request a new password reset."
            )
        else:
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

@router.get("/account-type", response_model=AccountTypeResponse)
async def get_account_type(
    current_user = Depends(get_current_user)
):
    """Get the account type of the current user"""
    try:
        user_profile = current_user["profile"]
        account_type = getattr(user_profile, 'account_type', AccountType.USER)
        
        if not isinstance(account_type, AccountType):
            logger.warning(f"Invalid account_type value: {account_type} of type {type(account_type)}, defaulting to USER")
            account_type = AccountType.USER
        
        return AccountTypeResponse(account_type=account_type)
        
    except Exception as e:
        logger.error(f"Get account type failed: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get account type"
        )


