from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date

class CreateUserProfileRequest(BaseModel):
    username: str
    baby_name: str
    baby_date_of_birth: date
    parent_name: str
    parent_mobile: str
    parent_email: EmailStr
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: str
    city: str
    state: str
    pin_code: str

class UserProfileUpdate(BaseModel):
    baby_name: Optional[str] = None
    baby_date_of_birth: Optional[date] = None
    parent_name: Optional[str] = None
    parent_mobile: Optional[str] = None
    parent_email: Optional[EmailStr] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None

class ProfileImageUpload(BaseModel):
    """Response schema for profile image upload"""
    avatar_url: str
    message: str

class UserProfileResponse(BaseModel):
    id: str
    user_id: str
    email: str
    username: str
    baby_name: Optional[str] = None
    baby_date_of_birth: Optional[date] = None
    parent_name: Optional[str] = None
    parent_mobile: Optional[str] = None
    parent_email: Optional[EmailStr] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserProfilePublic(BaseModel):
    """Public profile information (without email and sensitive details)"""
    id: str
    user_id: str
    baby_name: Optional[str] = None
    baby_date_of_birth: Optional[date] = None
    parent_name: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
