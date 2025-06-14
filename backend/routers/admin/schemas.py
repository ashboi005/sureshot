from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from models import AccountType

# Worker schemas
class CreateWorkerRequest(BaseModel):
    email: EmailStr
    password: str
    username: str
    first_name: str
    last_name: str
    city_name: str
    specialization: Optional[str] = None
    experience_years: Optional[int] = None

class WorkerResponse(BaseModel):
    id: str
    user_id: str
    city_name: str
    government_id_url: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    is_active: bool
    created_at: datetime
    
    # User profile info
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None

# Doctor schemas
class CreateDoctorRequest(BaseModel):
    email: EmailStr
    password: str
    username: str
    first_name: str
    last_name: str
    specialization: Optional[str] = None
    hospital_affiliation: Optional[str] = None
    experience_years: Optional[int] = None

class DoctorResponse(BaseModel):
    id: str
    user_id: str
    medical_council_registration_url: Optional[str] = None
    specialization: Optional[str] = None
    hospital_affiliation: Optional[str] = None
    experience_years: Optional[int] = None
    is_active: bool
    created_at: datetime
    
    # User profile info
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None

# Vaccination Drive schemas
class CreateVaccinationDriveRequest(BaseModel):
    vaccination_name: str
    start_date: datetime
    end_date: datetime
    vaccination_city: str
    description: Optional[str] = None
    assigned_worker_ids: Optional[List[str]] = []

class VaccinationDriveResponse(BaseModel):
    id: str
    vaccination_name: str
    start_date: datetime
    end_date: datetime
    vaccination_city: str
    description: Optional[str] = None
    is_active: bool
    created_by: str
    created_at: datetime
    updated_at: datetime
    assigned_workers: List[WorkerResponse] = []

class UpdateVaccinationDriveRequest(BaseModel):
    vaccination_name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    vaccination_city: Optional[str] = None
    description: Optional[str] = None
    assigned_worker_ids: Optional[List[str]] = None
    is_active: Optional[bool] = None

# List responses
class WorkerListResponse(BaseModel):
    workers: List[WorkerResponse]
    total: int

class DoctorListResponse(BaseModel):
    doctors: List[DoctorResponse]
    total: int

class VaccinationDriveListResponse(BaseModel):
    drives: List[VaccinationDriveResponse]
    total: int

class DocumentUploadResponse(BaseModel):
    """Response schema for document upload"""
    file_url: str
    file_name: str
    file_size: int
    content_type: str
    upload_path: str

class DocumentUploadError(BaseModel):
    """Error response for document upload"""
    error: str
    message: str
