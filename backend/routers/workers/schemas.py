"""
Schemas for vaccination drive participants
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class WorkerIdResponse(BaseModel):
    """Response schema for worker ID mapping"""
    user_id: str
    worker_id: str
    city_name: str
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    is_active: bool
    
    class Config:
        from_attributes = True


class DriveParticipantResponse(BaseModel):
    """Response schema for drive participant"""
    id: str
    user_id: str
    baby_name: Optional[str] = None
    parent_name: Optional[str] = None
    parent_mobile: Optional[str] = None
    address: Optional[str] = None
    is_vaccinated: bool
    vaccination_date: Optional[datetime] = None
    worker_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DriveParticipantListResponse(BaseModel):
    """Response schema for list of drive participants"""
    participants: List[DriveParticipantResponse]
    total: int
    drive_name: str
    drive_city: str


class AdministerDriveVaccineRequest(BaseModel):
    """Request schema for administering vaccine in a drive"""
    user_id: str
    vaccination_date: datetime
    notes: Optional[str] = None


class AdministerDriveVaccineResponse(BaseModel):
    """Response schema for administered vaccine in a drive"""
    id: str
    user_id: str
    baby_name: Optional[str] = None
    is_vaccinated: bool
    vaccination_date: datetime
    worker_id: str
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True
