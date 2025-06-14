from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

class DoctorIdResponse(BaseModel):
    user_id: str
    doctor_id: str
    specialization: Optional[str] = None
    hospital_affiliation: Optional[str] = None
    
    class Config:
        from_attributes = True

class PatientResponse(BaseModel):
    user_id: str
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
    first_interaction_date: date
    
    class Config:
        from_attributes = True
