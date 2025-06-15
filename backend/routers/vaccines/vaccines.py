from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import date, datetime, timedelta
import uuid
import logging

from config import get_db
from models import VaccineTemplate, VaccinationRecord, UserProfile, DoctorPatientRelationship, DoctorDetails, VaccinationReminder, ReminderType
from routers.auth.auth import get_current_user
from .helpers import send_vaccination_confirmation
from .schemas import (
    VaccinationRecordResponse, 
    AdministerVaccineRequest,
    VaccinationScheduleResponse,
    VaccinationHistoryResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/vaccination", tags=["vaccination"])

@router.post("/administer")
async def administer_vaccine(
    request: AdministerVaccineRequest,
    db: AsyncSession = Depends(get_db)
):
    """Administer a vaccine to a baby"""
    
    logger.info(f"Administer vaccine request received:")
    logger.info(f"  - user_id: '{request.user_id}'")
    logger.info(f"  - vaccine_template_id: '{request.vaccine_template_id}'")
    logger.info(f"  - dose_number: {request.dose_number}")
    logger.info(f"  - doctor_id: '{request.doctor_id}'")
    logger.info(f"  - administered_date: {request.administered_date}")
    logger.info(f"  - notes: '{request.notes}'")
    
    # Verify the vaccination record exists
    stmt = select(VaccinationRecord).where(
        VaccinationRecord.user_id == uuid.UUID(request.user_id),
        VaccinationRecord.vaccine_template_id == uuid.UUID(request.vaccine_template_id),
        VaccinationRecord.dose_number == request.dose_number
    )
    result = await db.execute(stmt)
    vaccination_record = result.scalar_one_or_none()
    
    if not vaccination_record:
        # Debug: Check what vaccination records exist for this user
        debug_stmt = select(VaccinationRecord).where(VaccinationRecord.user_id == uuid.UUID(request.user_id))
        debug_result = await db.execute(debug_stmt)
        all_user_records = debug_result.scalars().all()
        
        logger.error(f"Vaccination record not found. User has {len(all_user_records)} vaccination records:")
        for record in all_user_records:
            logger.error(f"  - vaccine_template_id: {record.vaccine_template_id}, dose_number: {record.dose_number}, due_date: {record.due_date}")
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vaccination record not found for user_id: {request.user_id}, vaccine_template_id: {request.vaccine_template_id}, dose_number: {request.dose_number}"
        )
    
    if vaccination_record.is_administered:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vaccine already administered"
        )
      # Update vaccination record
    logger.info(f"Doctor ID received: '{request.doctor_id}' (type: {type(request.doctor_id)})")
    try:
        doctor_uuid = uuid.UUID(request.doctor_id)
        vaccination_record.doctor_id = doctor_uuid
    except ValueError as e:
        logger.error(f"Failed to parse doctor_id '{request.doctor_id}' as UUID: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid doctor_id format: {request.doctor_id}"
        )
    
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
            vaccine_template_id=str(record.vaccine_template_id),
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

async def generate_vaccination_schedule_for_user(db: AsyncSession, user_id: uuid.UUID, birth_date: date) -> int:
    """
    Generate vaccination records for a user based on their baby's birth date
    
    Args:
        db: Database session
        user_id: User ID to create records for
        birth_date: Baby's birth date
        
    Returns:
        Number of vaccination records created
    """
    try:
        # Get all vaccine templates
        templates_result = await db.execute(select(VaccineTemplate))
        templates = templates_result.scalars().all()
        
        if not templates:
            logger.warning("No vaccine templates found in database")
            return 0
        
        # Check which vaccination records already exist for this user
        existing_query = select(VaccinationRecord).where(VaccinationRecord.user_id == user_id)
        existing_result = await db.execute(existing_query)
        existing_records = existing_result.scalars().all()
        
        # Create a set of existing (template_id, dose_number) combinations
        existing_combinations = {(record.vaccine_template_id, record.dose_number) for record in existing_records}
        
        # Create vaccination records for each template and dose
        vaccination_records = []
        vaccination_to_template = {}  # Map vaccination records to their templates
        
        for template in templates:
            for dose_number in range(1, template.total_doses + 1):
                # Skip if this combination already exists
                if (template.id, dose_number) in existing_combinations:
                    continue
                    
                # Calculate due date based on baby's birth date
                days_offset = template.recommended_age_days + ((dose_number - 1) * template.dose_interval_days)
                due_date = birth_date + timedelta(days=days_offset)
                
                vaccination_record = VaccinationRecord(
                    user_id=user_id,
                    vaccine_template_id=template.id,
                    dose_number=dose_number,
                    due_date=due_date,
                    is_administered=False,
                    notes=f"Auto-generated vaccination schedule"
                )
                
                vaccination_records.append(vaccination_record)
                vaccination_to_template[vaccination_record] = template
        
        # Add all new records to database
        if vaccination_records:
            db.add_all(vaccination_records)
            await db.flush()  # Flush to get IDs for reminder creation
            
            # Create reminder records for each vaccination record
            reminder_records = []
            for vaccination_record in vaccination_records:
                template = vaccination_to_template[vaccination_record]
                
                for reminder_type in ReminderType:
                    reminder = VaccinationReminder(
                        vaccination_record_id=vaccination_record.id,
                        user_id=vaccination_record.user_id,
                        vaccine_name=f"{template.vaccine_name} (Dose {vaccination_record.dose_number})",
                        due_date=vaccination_record.due_date,
                        reminder_type=reminder_type
                    )
                    reminder_records.append(reminder)
            
            # Add all reminder records
            db.add_all(reminder_records)
            await db.flush()  # Flush reminder records but don't commit yet
            
        logger.info(f"Created {len(vaccination_records)} new vaccination records and {len(reminder_records) if vaccination_records else 0} reminder records for user {user_id}")
        return len(vaccination_records)
        
    except Exception as e:
        logger.error(f"Error creating vaccination records for user {user_id}: {str(e)}")
        raise e

@router.post("/generate-schedule")
async def generate_vaccination_schedule(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate vaccination schedule for current user if not already exists"""
    try:
        profile = current_user["profile"]
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found. Please create a profile first."
            )
        
        if not profile.baby_date_of_birth:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Baby's date of birth is required to generate vaccination schedule"
            )
        
        # Generate vaccination records
        created_count = await generate_vaccination_schedule_for_user(
            db, 
            profile.user_id, 
            profile.baby_date_of_birth
        )
        
        await db.commit()
        
        return {
            "message": f"Successfully generated vaccination schedule",
            "records_created": created_count,
            "baby_name": profile.baby_name,
            "birth_date": profile.baby_date_of_birth.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error generating vaccination schedule: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate vaccination schedule"
        )

@router.get("/check-schedule-status")
async def check_vaccination_schedule_status(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Check if current user has vaccination schedule and reminder records"""
    try:
        profile = current_user["profile"]
        
        if not profile:
            return {
                "message": "No user profile found",
                "has_profile": False,
                "has_vaccination_records": False,
                "has_reminder_records": False
            }
        
        # Check vaccination records
        vaccination_query = select(VaccinationRecord).where(
            VaccinationRecord.user_id == profile.user_id
        )
        vaccination_result = await db.execute(vaccination_query)
        vaccination_records = vaccination_result.scalars().all()
        
        # Check reminder records
        reminder_query = select(VaccinationReminder).where(
            VaccinationReminder.user_id == profile.user_id
        )
        reminder_result = await db.execute(reminder_query)
        reminder_records = reminder_result.scalars().all()
        
        return {
            "message": "Vaccination schedule status",
            "user_info": {
                "baby_name": profile.baby_name,
                "birth_date": profile.baby_date_of_birth.isoformat() if profile.baby_date_of_birth else None
            },
            "has_profile": True,
            "has_vaccination_records": len(vaccination_records) > 0,
            "vaccination_records_count": len(vaccination_records),
            "has_reminder_records": len(reminder_records) > 0,
            "reminder_records_count": len(reminder_records),
            "next_steps": [
                "✅ Profile created" if profile else "❌ Create profile first",
                f"✅ {len(vaccination_records)} vaccination records found" if vaccination_records else "❌ Generate vaccination schedule",
                f"✅ {len(reminder_records)} reminder records found" if reminder_records else "❌ Reminder records missing"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error checking vaccination schedule status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check vaccination schedule status"
        )
