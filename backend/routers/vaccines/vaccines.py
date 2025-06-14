from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import date, datetime, timedelta
import uuid

from config import get_db
from models import VaccineTemplate, VaccinationRecord, UserProfile, DoctorPatientRelationship, DoctorDetails
from routers.auth.auth import get_current_user
from .helpers import send_vaccination_confirmation
from .schemas import (
    VaccinationRecordResponse, 
    AdministerVaccineRequest,
    VaccinationScheduleResponse,
    VaccinationHistoryResponse
)

router = APIRouter(prefix="/vaccination", tags=["vaccination"])

@router.post("/administer")
async def administer_vaccine(
    request: AdministerVaccineRequest,
    db: AsyncSession = Depends(get_db)
):
    """Administer a vaccine to a baby"""
    
    # Verify the vaccination record exists
    stmt = select(VaccinationRecord).where(
        VaccinationRecord.user_id == uuid.UUID(request.user_id),
        VaccinationRecord.vaccine_template_id == uuid.UUID(request.vaccine_template_id),
        VaccinationRecord.dose_number == request.dose_number
    )
    result = await db.execute(stmt)
    vaccination_record = result.scalar_one_or_none()
    
    if not vaccination_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vaccination record not found"
        )
    
    if vaccination_record.is_administered:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vaccine already administered"
        )
    
    # Update vaccination record
    vaccination_record.doctor_id = uuid.UUID(request.doctor_id)
    vaccination_record.administered_date = request.administered_date
    vaccination_record.is_administered = True
    vaccination_record.notes = request.notes
    vaccination_record.updated_at = datetime.utcnow()
    
    # Check if doctor-patient relationship exists, if not create it
    relationship_stmt = select(DoctorPatientRelationship).where(
        DoctorPatientRelationship.user_id == uuid.UUID(request.user_id),
        DoctorPatientRelationship.doctor_id == uuid.UUID(request.doctor_id)
    )
    relationship_result = await db.execute(relationship_stmt)
    existing_relationship = relationship_result.scalar_one_or_none()
    if not existing_relationship:
        new_relationship = DoctorPatientRelationship(
            user_id=uuid.UUID(request.user_id),
            doctor_id=uuid.UUID(request.doctor_id),
            first_interaction_date=request.administered_date
        )
        db.add(new_relationship)
    
    await db.commit()
    await db.refresh(vaccination_record)
    
    # Get vaccine template for notification details
    vaccine_template_stmt = select(VaccineTemplate).where(
        VaccineTemplate.id == vaccination_record.vaccine_template_id
    )
    template_result = await db.execute(vaccine_template_stmt)
    vaccine_template = template_result.scalar_one_or_none()
    
    # Send vaccination confirmation notifications
    if vaccine_template:
        await send_vaccination_confirmation(
            db=db,
            user_id=str(vaccination_record.user_id),
            vaccination_record=vaccination_record,
            vaccine_template=vaccine_template
        )
    
    return {"message": "Vaccine administered successfully", "record_id": str(vaccination_record.id)}

@router.get("/schedule/{user_id}", response_model=List[VaccinationScheduleResponse])
async def get_vaccination_schedule(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get complete vaccination schedule for a baby"""
    
    stmt = select(VaccinationRecord, VaccineTemplate).join(
        VaccineTemplate, VaccinationRecord.vaccine_template_id == VaccineTemplate.id
    ).where(
        VaccinationRecord.user_id == uuid.UUID(user_id)
    ).order_by(VaccinationRecord.due_date, VaccinationRecord.dose_number)
    
    result = await db.execute(stmt)
    records = result.all()
    
    schedule = []
    for record, template in records:
        schedule.append(VaccinationScheduleResponse(
            id=str(record.id),
            vaccine_name=template.vaccine_name,
            dose_number=record.dose_number,
            due_date=record.due_date.date() if isinstance(record.due_date, datetime) else record.due_date,
            administered_date=record.administered_date.date() if record.administered_date and isinstance(record.administered_date, datetime) else record.administered_date,
            is_administered=record.is_administered,
            is_overdue=record.due_date.date() < date.today() and not record.is_administered if isinstance(record.due_date, datetime) else record.due_date < date.today() and not record.is_administered,
            disease_prevented=template.disease_prevented,
            notes=record.notes
        ))
    
    return schedule

@router.get("/history/{user_id}", response_model=List[VaccinationHistoryResponse])
async def get_vaccination_history(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get vaccination history for a baby (only administered vaccines)"""
    
    stmt = select(VaccinationRecord, VaccineTemplate).join(
        VaccineTemplate, VaccinationRecord.vaccine_template_id == VaccineTemplate.id
    ).where(
        VaccinationRecord.user_id == uuid.UUID(user_id),
        VaccinationRecord.is_administered == True
    ).order_by(VaccinationRecord.administered_date.desc())
    
    result = await db.execute(stmt)
    records = result.all()
    
    history = []
    for record, template in records:
        history.append(VaccinationHistoryResponse(
            id=str(record.id),
            vaccine_name=template.vaccine_name,
            dose_number=record.dose_number,
            administered_date=record.administered_date.date() if isinstance(record.administered_date, datetime) else record.administered_date,
            doctor_id=str(record.doctor_id),
            disease_prevented=template.disease_prevented,
            notes=record.notes
        ))
    
    return history

@router.get("/due/{user_id}", response_model=List[VaccinationScheduleResponse])
async def get_due_vaccinations(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get pending/overdue vaccinations for a baby"""
    
    stmt = select(VaccinationRecord, VaccineTemplate).join(
        VaccineTemplate, VaccinationRecord.vaccine_template_id == VaccineTemplate.id
    ).where(
        VaccinationRecord.user_id == uuid.UUID(user_id),
        VaccinationRecord.is_administered == False
    ).order_by(VaccinationRecord.due_date)
    
    result = await db.execute(stmt)
    records = result.all()
    
    due_vaccines = []
    for record, template in records:
        due_vaccines.append(VaccinationScheduleResponse(
            id=str(record.id),
            vaccine_name=template.vaccine_name,
            dose_number=record.dose_number,
            due_date=record.due_date.date() if isinstance(record.due_date, datetime) else record.due_date,
            administered_date=None,
            is_administered=record.is_administered,
            is_overdue=record.due_date.date() < date.today() if isinstance(record.due_date, datetime) else record.due_date < date.today(),
            disease_prevented=template.disease_prevented,
            notes=record.notes
        ))
    
    return due_vaccines
