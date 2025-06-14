import asyncio
from datetime import datetime, date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from models import VaccinationRecord, VaccineTemplate, ReminderType        
from utils.smtp import smtp_service
from utils.twilio import twilio_service
import uuid
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Hardcoded demo contacts for hackathon
DEMO_EMAIL = "ashwathsoni005@gmail.com"
DEMO_PHONE = "+917009023965"

# Demo reminder templates
DEMO_REMINDER_TEMPLATES = {
    "30_days": {
        'email_subject': 'Vaccination Reminder - 30 Days Notice',
        'urgency': 'upcoming',
        'sms_prefix': 'Reminder:'
    },
    "15_days": {
        'email_subject': 'Important: Vaccination Due in 15 Days',
        'urgency': 'important',
        'sms_prefix': 'Important:'
    },
    "7_days": {
        'email_subject': 'Urgent: Vaccination Due This Week',
        'urgency': 'urgent',
        'sms_prefix': 'URGENT:'
    },
    "1_day": {
        'email_subject': 'Tomorrow: Vaccination Appointment Due',
        'urgency': 'critical',
        'sms_prefix': 'TOMORROW:'
    }
}


async def create_demo_vaccination_data(db: AsyncSession) -> List[Dict[str, Any]]:
    """
    Create demo vaccination records for testing reminders
    
    Args:
        db: Database session
        
    Returns:
        List of created demo vaccination records
    """
    try:
        today = date.today()
        
        # Get a vaccine template
        vaccine_template_query = select(VaccineTemplate).limit(1)
        template_result = await db.execute(vaccine_template_query)
        vaccine_template = template_result.scalar_one_or_none()
        
        if not vaccine_template:
            raise Exception("No vaccine templates found. Please populate vaccine templates first.")
          # Create demo vaccination records with different due dates
        demo_scenarios = [
            {"days_from_now": 30, "baby_name": "Demo Baby 1"},
            {"days_from_now": 15, "baby_name": "Demo Baby 2"}, 
            {"days_from_now": 7, "baby_name": "Demo Baby 3"},
            {"days_from_now": 1, "baby_name": "Demo Baby 4"}
        ]
        
        # Get the specific user with our demo email
        from models import Users
        demo_user_query = select(Users).where(Users.email == DEMO_EMAIL)
        user_result = await db.execute(demo_user_query)
        demo_user = user_result.scalar_one_or_none()
        
        if not demo_user:
            raise Exception(f"User with email {DEMO_EMAIL} not found. Please create a user account with this email first.")
        demo_user_id = demo_user.id
        logger.info(f"🎯 Using existing user {DEMO_EMAIL} for demo vaccination records")
        
        # Clean up any existing demo records for this user first
        existing_demo_query = select(VaccinationRecord).where(
            and_(
                VaccinationRecord.user_id == demo_user_id,
                VaccinationRecord.notes.like("%DEMO%")
            )
        )
        existing_result = await db.execute(existing_demo_query)
        existing_demo_records = existing_result.scalars().all()
        
        if existing_demo_records:
            logger.info(f"🧹 Cleaning up {len(existing_demo_records)} existing demo records")
            for record in existing_demo_records:
                await db.delete(record)
            await db.flush()  # Ensure deletions are committed before creating new records
        created_records = []
        
        for index, scenario in enumerate(demo_scenarios, 1):  # Start from 1 for dose numbers
            due_date = today + timedelta(days=scenario["days_from_now"])
            
            # Create vaccination record with DEMO marker in notes
            # Use different dose numbers to avoid unique constraint violation
            vaccination_record = VaccinationRecord(
                id=uuid.uuid4(),
                user_id=demo_user_id,  # Use existing or created user ID
                vaccine_template_id=vaccine_template.id,
                dose_number=index,  # Use different dose numbers (1, 2, 3, 4)
                due_date=due_date,
                is_administered=False,
                notes=f"DEMO: {scenario['baby_name']} - Due in {scenario['days_from_now']} days (Dose {index})"
            )
            db.add(vaccination_record)
            
            created_records.append({
                "baby_name": scenario["baby_name"],
                "vaccine_name": f"{vaccine_template.vaccine_name} (Dose {index})",  # Include dose number
                "due_date": due_date.isoformat(),
                "days_from_now": scenario["days_from_now"],
                "record_id": str(vaccination_record.id)
            })
        
        await db.commit()
        
        logger.info(f"✅ Created {len(created_records)} demo vaccination records")
        return created_records
        
    except Exception as e:
        logger.error(f"Error creating demo vaccination data: {str(e)}")
        await db.rollback()
        raise


async def send_demo_vaccination_reminders(db: AsyncSession) -> Dict[str, int]:
    """
    Send vaccination reminders for demo purposes
    Always sends to hardcoded email and phone number
    
    For demo purposes, this will send reminders for ALL existing demo records
    regardless of their exact due dates to showcase the notification system.
    
    Args:
        db: Database session
        
    Returns:
        Dict with counts of reminders sent by type
    """
    try:
        results = {
            "30_days": 0,
            "15_days": 0,
            "7_days": 0,
            "1_day": 0,
            "total": 0
        }
          # For demo purposes, get ALL demo records and send appropriate reminders
        all_demo_query = select(VaccinationRecord).options(
            selectinload(VaccinationRecord.vaccine_template)
        ).where(
            and_(
                VaccinationRecord.notes.like("%DEMO%"),
                VaccinationRecord.is_administered == False
            )
        )
        
        result = await db.execute(all_demo_query)
        all_demo_records = result.scalars().all()
        
        logger.info(f"🎭 Demo reminder mode: Found {len(all_demo_records)} demo records to process")
        if not all_demo_records:
            logger.warning("⚠️ No demo records found. Please create demo data first.")
            return results
        
        # Calculate days until due for each record and categorize
        today = date.today()
        
        for record in all_demo_records:
            # Convert datetime to date for proper comparison
            record_due_date = record.due_date.date() if isinstance(record.due_date, datetime) else record.due_date
            days_until_due = (record_due_date - today).days
            
            # Determine which reminder category this falls into
            reminder_key = None
            if days_until_due >= 28:  # Close to 30 days
                reminder_key = "30_days"
                days_before = 30
            elif days_until_due >= 13:  # Close to 15 days  
                reminder_key = "15_days"
                days_before = 15
            elif days_until_due >= 5:  # Close to 7 days
                reminder_key = "7_days"
                days_before = 7
            elif days_until_due >= 0:  # Close to 1 day or overdue
                reminder_key = "1_day"
                days_before = max(1, days_until_due)
            else:
                # Overdue - still send as 1 day reminder
                reminder_key = "1_day"
                days_before = 1
            baby_name = record.notes.split(" - ")[0].replace("DEMO: ", "") if " - " in record.notes else "Demo Baby"
            vaccine_name = record.vaccine_template.vaccine_name if record.vaccine_template else "Vaccination"
            due_date_str = record_due_date.strftime("%B %d, %Y")
            
            logger.info(f"� Processing demo record: {baby_name}, Due: {record.due_date}, Days until due: {days_until_due}, Category: {reminder_key}")
            
            # Send email and SMS
            email_sent = await send_demo_reminder_email(
                baby_name, vaccine_name, due_date_str, days_before, reminder_key
            )
            
            sms_sent = await send_demo_reminder_sms(
                baby_name, vaccine_name, due_date_str, days_before, reminder_key
            )
            
            if email_sent or sms_sent:
                results[reminder_key] += 1
                results["total"] += 1
                logger.info(f"✅ Demo reminder sent for {baby_name} - {vaccine_name} ({reminder_key})")
            else:
                logger.error(f"❌ Failed to send demo reminder for {baby_name}")
        logger.info(f"🎯 Demo reminders summary: {results}")
        return results
        
    except Exception as e:
        logger.error(f"Error sending demo vaccination reminders: {str(e)}")
        return {"30_days": 0, "15_days": 0, "7_days": 0, "1_day": 0, "total": 0}


async def send_demo_reminder_email(
    baby_name: str, 
    vaccine_name: str, 
    due_date: str, 
    days_remaining: int, 
    reminder_key: str
) -> bool:
    """Send demo vaccination reminder email to hardcoded address"""
    try:
        template = DEMO_REMINDER_TEMPLATES[reminder_key]
        subject = f"{template['email_subject']} - {baby_name} (DEMO)"
        
        # Determine urgency styling
        urgency_colors = {
            'upcoming': '#2c5aa0',
            'important': '#fd7e14', 
            'urgent': '#dc3545',
            'critical': '#dc3545'
        }
        
        urgency_color = urgency_colors.get(template['urgency'], '#2c5aa0')
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: {urgency_color};">🎭 VaxTrack - Vaccination Reminder</h2>
                    
                    <p>Dear Parent,</p>
                    
                    <p>This is a reminder that <strong>{baby_name}</strong> has an upcoming vaccination:</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid {urgency_color}; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0; color: {urgency_color};">{vaccine_name}</h3>
                        <p style="margin: 5px 0;"><strong>Due Date:</strong> {due_date}</p>
                        <p style="margin: 5px 0;"><strong>Days Remaining:</strong> {days_remaining} days</p>
                    </div>
                    
                    <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #0066cc;">VaxTrack Features:</h4>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li>Automated vaccination reminders (30, 15, 7, 1 days before)</li>
                            <li>Email and SMS notifications</li>
                            <li>Complete vaccination tracking</li>
                            <li>Vaccination drive management</li>
                            <li>Healthcare worker coordination</li>
                        </ul>
                    </div>
                    
                    <p>Thank you!</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #666;">
                        <br>Developed by Team VaxTrack for automated vaccination management.
                    </p>
                </div>
            </body>
        </html>
        """
        
        success = smtp_service.send_html_email(DEMO_EMAIL, subject, html_content)
        if success:
            logger.info(f"📧 Demo email sent to {DEMO_EMAIL} for {baby_name}")
        else:
            logger.error(f"❌ Failed to send demo email for {baby_name}")
        
        return success
        
    except Exception as e:
        logger.error(f"Error sending demo reminder email: {str(e)}")
        return False


async def send_demo_reminder_sms(
    baby_name: str, 
    vaccine_name: str, 
    due_date: str, 
    days_remaining: int, 
    reminder_key: str
) -> bool:
    """Send demo vaccination reminder SMS to hardcoded phone number"""
    try:
        template = DEMO_REMINDER_TEMPLATES[reminder_key]
        
        message = (
            f"🎭 VaxTrack DEMO: {template['sms_prefix']} {baby_name} needs {vaccine_name} vaccination "
            f"in {days_remaining} day{'s' if days_remaining != 1 else ''} ({due_date}). "
            f"This is a hackathon demo showing our automated reminder system! -VaxTrack"
        )
        
        success = twilio_service.send_sms(DEMO_PHONE, message)
        if success:
            logger.info(f"📱 Demo SMS sent to {DEMO_PHONE} for {baby_name}")
        else:
            logger.error(f"❌ Failed to send demo SMS for {baby_name}")
        
        return success
        
    except Exception as e:
        logger.error(f"Error sending demo reminder SMS: {str(e)}")
        return False
