from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from models import AccountType


# Request schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Response schemas
class UserResponse(BaseModel):
    id: str  
    user_id: str 
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    date_of_birth: Optional[datetime] = None    
    timezone: Optional[str] = None
    language: Optional[str] = None
    account_type: Optional[AccountType] = None
    preferences: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        use_enum_values = True # This can be left as is or removed if no other enums are used

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
    message: Optional[str] = None 

class TokenResponse(BaseModel):
    access_token: str

class AccountTypeResponse(BaseModel):
    account_type: AccountType
    
    class Config:
        use_enum_values = True

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyResetTokenRequest(BaseModel):
    access_token: str
    refresh_token: str

class ResetPasswordRequest(BaseModel):
    new_password: str
    access_token: str
    refresh_token: str