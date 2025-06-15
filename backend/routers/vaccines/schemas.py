from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class AdministerVaccineRequest(BaseModel):
    user_id: str
    vaccine_template_id: str
    dose_number: int
    doctor_id: str
    administered_date: date
    notes: Optional[str] = None

class VaccinationRecordResponse(BaseModel):
    id: str
    user_id: str
    vaccine_template_id: str
    dose_number: int
    doctor_id: Optional[str] = None
    administered_date: Optional[date] = None
    due_date: date
    is_administered: bool
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class VaccinationScheduleResponse(BaseModel):
    id: str
    vaccine_template_id: str
    vaccine_name: str
    dose_number: int
    due_date: date
    administered_date: Optional[date] = None
    is_administered: bool
    is_overdue: bool
    disease_prevented: str
    notes: Optional[str] = None

class VaccinationHistoryResponse(BaseModel):
    id: str
    vaccine_name: str
    dose_number: int
    administered_date: date
    doctor_id: str
    disease_prevented: str
    notes: Optional[str] = None
