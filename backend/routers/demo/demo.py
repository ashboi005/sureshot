from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, date, timedelta
from config import get_db
from models import VaccinationRecord, VaccineTemplate, ReminderType
from .helpers import send_demo_vaccination_reminders, create_demo_vaccination_data
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/demo", tags=["Demo"])


@router.post("/create-test-data")
async def create_demo_test_data(db: AsyncSession = Depends(get_db)):
    """
    Create demo vaccination data for hackathon demonstration
    Creates vaccination records that will trigger reminders
    """
    try:
        result = await create_demo_vaccination_data(db)
        return {
            "message": "✅ Demo test data created successfully!",
            "data": result,
            "next_step": "Call POST /demo/trigger-reminders to see the notification system in action!"
        }
    except Exception as e:
        logger.error(f"Error creating demo test data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create demo test data: {str(e)}")


@router.post("/trigger-reminders")
async def trigger_demo_reminders(db: AsyncSession = Depends(get_db)):
    """
    Trigger vaccination reminders for demo purposes
    Sends reminders to hardcoded email/phone for hackathon demonstration
    """
    try:
        result = await send_demo_vaccination_reminders(db)
        
        return {
            "message": "🚀 Demo reminders triggered successfully!",
            "timestamp": datetime.now().isoformat(),
            "demo_target": {
                "email": "ashwathsoni005@gmail.com",
                "phone": "+917009023965"
            },
            "summary": {
                "30_day_reminders_sent": result.get("30_days", 0),
                "15_day_reminders_sent": result.get("15_days", 0),
                "7_day_reminders_sent": result.get("7_days", 0),
                "1_day_reminders_sent": result.get("1_day", 0),
                "total_reminders_sent": result.get("total", 0)
            },
            "status": "Check your email and SMS!" if result.get("total", 0) > 0 else "No pending reminders found"
        }
        
    except Exception as e:
        logger.error(f"Error triggering demo reminders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to trigger demo reminders: {str(e)}")


@router.get("/status")
async def get_demo_status(db: AsyncSession = Depends(get_db)):
    """
    Get the current status of demo vaccination records
    Shows what demo data exists and what reminders are pending
    """
    try:
        today = date.today()
        
        # Find demo vaccination records (we'll mark them with a specific note)
        demo_records_query = select(VaccinationRecord).where(
            VaccinationRecord.notes.like("%DEMO%")
        )
        result = await db.execute(demo_records_query)
        demo_records = result.scalars().all()
        
        status_data = []
        for record in demo_records:
            days_until_due = (record.due_date.date() - today).days if record.due_date else None
            
            status_data.append({
                "id": str(record.id),
                "vaccine_name": record.vaccine_template.name if record.vaccine_template else "Unknown",
                "due_date": record.due_date.date().isoformat() if record.due_date else None,
                "days_until_due": days_until_due,
                "is_administered": record.is_administered,
                "notes": record.notes
            })
        
        return {
            "message": "Demo status retrieved successfully",
            "demo_records": status_data,
            "total_demo_records": len(status_data),
            "instructions": {
                "create_data": "POST /demo/create-test-data - Creates vaccination records",
                "send_reminders": "POST /demo/trigger-reminders - Sends email/SMS reminders",
                "demo_contacts": {
                    "email": "ashwathsoni005@gmail.com",
                    "phone": "+917009023965"
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting demo status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get demo status: {str(e)}")


@router.delete("/cleanup")
async def cleanup_demo_data(db: AsyncSession = Depends(get_db)):
    """
    Clean up all demo vaccination records
    Useful for resetting the demo state
    """
    try:
        # Delete demo vaccination records
        demo_records_query = select(VaccinationRecord).where(
            VaccinationRecord.notes.like("%DEMO%")
        )
        result = await db.execute(demo_records_query)
        demo_records = result.scalars().all()
        
        deleted_count = 0
        for record in demo_records:
            await db.delete(record)
            deleted_count += 1
        
        await db.commit()
        
        return {
            "message": f"✅ Demo cleanup completed! Deleted {deleted_count} demo records",
            "deleted_records": deleted_count,
            "status": "Demo environment reset - ready for new demo data"
        }
        
    except Exception as e:
        logger.error(f"Error cleaning up demo data: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to cleanup demo data: {str(e)}")
