import asyncio
from datetime import datetime, date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from sqlalchemy.orm import selectinload
from config import get_db
from models import VaccinationReminder, VaccinationRecord, Users, UserProfile, ReminderType
from utils.smtp import smtp_service
from utils.twilio import twilio_service
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Configuration constants
REMINDER_DAYS = {
    ReminderType.THIRTY_DAYS: 30,
    ReminderType.FIFTEEN_DAYS: 15,
    ReminderType.SEVEN_DAYS: 7,
    ReminderType.ONE_DAY: 1
}

BATCH_SIZE = 20  # Process 20 reminders at a time
DELAY_BETWEEN_SENDS = 0.5  # Half second delay between sends
DELAY_BETWEEN_BATCHES = 1.0  # 1 second delay between batches

# Reminder message templates
REMINDER_TEMPLATES = {
    ReminderType.THIRTY_DAYS: {
        'email_subject': 'Vaccination Reminder - 30 Days Notice',
        'urgency': 'upcoming',
        'sms_prefix': 'Reminder:'
    },
    ReminderType.FIFTEEN_DAYS: {
        'email_subject': 'Important: Vaccination Due in 15 Days',
        'urgency': 'important',
        'sms_prefix': 'Important:'
    },
    ReminderType.SEVEN_DAYS: {
        'email_subject': 'Urgent: Vaccination Due This Week',
        'urgency': 'urgent',
        'sms_prefix': 'URGENT:'
    },
    ReminderType.ONE_DAY: {
        'email_subject': 'Tomorrow: Vaccination Appointment Due',
        'urgency': 'critical',
        'sms_prefix': 'TOMORROW:'
    }
}


async def send_vaccination_reminders() -> Dict[str, int]:
    """
    Main reminder job - finds and sends vaccination reminders
    
    Returns:
        Dict with counts of reminders sent by type
    """
    logger.info(f"🔔 Starting vaccination reminder job at {datetime.now()}")
    
    results = {
        "30_days": 0,
        "15_days": 0,
        "7_days": 0,
        "1_day": 0,
        "total": 0
    }
    
    try:
        async with get_db() as db:
            today = date.today()
            
            for reminder_type, days_before in REMINDER_DAYS.items():
                target_due_date = today + timedelta(days=days_before)
                
                # Find pending reminders for this date and type
                pending_reminders = await get_pending_reminders(db, target_due_date, reminder_type)
                
                logger.info(f"📅 Found {len(pending_reminders)} {reminder_type.value} reminders for {target_due_date}")
                
                if pending_reminders:
                    sent_count = await send_reminder_batch_list(db, pending_reminders, reminder_type)
                    results[reminder_type.value.replace('_days', '_days')] = sent_count
                    results["total"] += sent_count
                    
                    # Small delay between reminder types
                    await asyncio.sleep(DELAY_BETWEEN_BATCHES)
            
            logger.info(f"✅ Vaccination reminder job completed. Total sent: {results['total']}")
            
    except Exception as e:
        logger.error(f"❌ Error in vaccination reminder job: {str(e)}")
        
    return results


async def get_pending_reminders(
    db: AsyncSession, 
    target_due_date: date, 
    reminder_type: ReminderType
) -> List[VaccinationReminder]:
    """
    Find vaccination reminders that should be sent for a specific date and type
    
    Args:
        db: Database session
        target_due_date: The date vaccinations are due
        reminder_type: Type of reminder (30_days, 15_days, etc.)
        
    Returns:
        List of VaccinationReminder objects ready to be sent
    """
    try:
        # Query for reminders that need to be sent
        query = (
            select(VaccinationReminder)
            .join(VaccinationRecord)
            .join(Users)
            .options(
                selectinload(VaccinationReminder.vaccination_record),
                selectinload(VaccinationReminder.user)
            )
            .where(
                and_(
                    # Not sent yet
                    VaccinationReminder.email_sent == False,
                    VaccinationReminder.sms_sent == False,
                    # Correct reminder type
                    VaccinationReminder.reminder_type == reminder_type,
                    # Due date matches
                    VaccinationRecord.due_date >= target_due_date,
                    VaccinationRecord.due_date < target_due_date + timedelta(days=1),
                    # Vaccination not completed yet
                    VaccinationRecord.is_administered == False
                )
            )
            .order_by(VaccinationReminder.created_at)
        )
        
        result = await db.execute(query)
        reminders = result.scalars().all()
        
        return list(reminders)
        
    except Exception as e:
        logger.error(f"Error getting pending reminders: {str(e)}")
        return []


async def send_reminder_batch_list(
    db: AsyncSession, 
    reminders: List[VaccinationReminder], 
    reminder_type: ReminderType
) -> int:
    """
    Send a list of reminders in batches
    
    Args:
        db: Database session
        reminders: List of reminders to send
        reminder_type: Type of reminder
        
    Returns:
        Number of reminders sent successfully
    """
    sent_count = 0
    
    # Process in batches
    for i in range(0, len(reminders), BATCH_SIZE):
        batch = reminders[i:i + BATCH_SIZE]
        
        logger.info(f"📤 Processing batch {i//BATCH_SIZE + 1} with {len(batch)} reminders")
        
        for reminder in batch:
            try:
                success = await send_single_reminder(db, reminder, reminder_type)
                if success:
                    sent_count += 1
                    
            except Exception as e:
                logger.error(f"Failed to send reminder {reminder.id}: {str(e)}")
                
            # Rate limiting delay
            await asyncio.sleep(DELAY_BETWEEN_SENDS)
        
        # Delay between batches
        if i + BATCH_SIZE < len(reminders):
            await asyncio.sleep(DELAY_BETWEEN_BATCHES)
    
    logger.info(f"📊 Batch processing complete: {sent_count}/{len(reminders)} reminders sent")
    return sent_count


async def send_single_reminder(
    db: AsyncSession, 
    reminder: VaccinationReminder, 
    reminder_type: ReminderType
) -> bool:
    """
    Send a single vaccination reminder via email and SMS
    
    Args:
        db: Database session
        reminder: The reminder to send
        reminder_type: Type of reminder
        
    Returns:
        True if at least one notification was sent successfully
    """
    try:
        # Get user profile for parent info
        user_profile_query = select(UserProfile).where(UserProfile.user_id == reminder.user_id)
        user_profile_result = await db.execute(user_profile_query)
        user_profile = user_profile_result.scalar_one_or_none()
        
        if not user_profile:
            logger.warning(f"User profile not found for reminder {reminder.id}")
            return False
        
        # Extract information
        baby_name = user_profile.first_name or "your child"
        parent_name = user_profile.guardian_name or "Parent"
        vaccine_name = reminder.vaccine_name
        due_date = reminder.due_date.strftime("%B %d, %Y")
        days_remaining = REMINDER_DAYS[reminder_type]
        
        email_sent = False
        sms_sent = False
        
        # Send Email
        if reminder.user.email:
            email_sent = await send_reminder_email(
                reminder.user.email, 
                baby_name, 
                parent_name, 
                vaccine_name, 
                due_date, 
                days_remaining, 
                reminder_type
            )
        
        # Send SMS
        if user_profile.mobile:
            sms_sent = await send_reminder_sms(
                user_profile.mobile, 
                baby_name, 
                parent_name, 
                vaccine_name, 
                due_date, 
                days_remaining, 
                reminder_type
            )
        
        # Update reminder status
        if email_sent or sms_sent:
            await update_reminder_status(db, reminder, email_sent, sms_sent)
            logger.info(f"✅ Reminder sent for {baby_name} - {vaccine_name} (Email: {email_sent}, SMS: {sms_sent})")
            return True
        else:
            logger.warning(f"⚠️ No notifications sent for reminder {reminder.id}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending reminder {reminder.id}: {str(e)}")
        return False


async def send_reminder_email(
    email: str, 
    baby_name: str, 
    parent_name: str, 
    vaccine_name: str, 
    due_date: str, 
    days_remaining: int, 
    reminder_type: ReminderType
) -> bool:
    """Send vaccination reminder email"""
    try:
        template = REMINDER_TEMPLATES[reminder_type]
        subject = f"{template['email_subject']} - {baby_name}"
        
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
                    <h2 style="color: {urgency_color};">VaxTrack - Vaccination Reminder</h2>
                    
                    <p>Dear {parent_name},</p>
                    
                    <p>This is a reminder that <strong>{baby_name}</strong> has an upcoming vaccination:</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid {urgency_color}; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0; color: {urgency_color};">{vaccine_name}</h3>
                        <p style="margin: 5px 0;"><strong>Due Date:</strong> {due_date}</p>
                        <p style="margin: 5px 0;"><strong>Days Remaining:</strong> {days_remaining} days</p>
                    </div>
                    
                    <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #0066cc;">Action Required:</h4>
                        <p style="margin: 0;">Please schedule an appointment with your healthcare provider to ensure {baby_name} receives this vaccination on time.</p>
                    </div>
                    
                    <p>Keeping vaccinations up to date is crucial for {baby_name}'s health and protection against preventable diseases.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #666;">
                        This is an automated reminder from VaxTrack. Please do not reply to this email.
                        <br>For questions, please contact your healthcare provider.
                    </p>
                </div>
            </body>
        </html>
        """
        
        return smtp_service.send_html_email(email, subject, html_content)
        
    except Exception as e:
        logger.error(f"Error sending reminder email to {email}: {str(e)}")
        return False


async def send_reminder_sms(
    phone: str, 
    baby_name: str, 
    parent_name: str, 
    vaccine_name: str, 
    due_date: str, 
    days_remaining: int, 
    reminder_type: ReminderType
) -> bool:
    """Send vaccination reminder SMS"""
    try:
        template = REMINDER_TEMPLATES[reminder_type]
        
        message = (
            f"{template['sms_prefix']} {baby_name} needs {vaccine_name} vaccination "
            f"in {days_remaining} day{'s' if days_remaining != 1 else ''} ({due_date}). "
            f"Please schedule appointment. -VaxTrack"
        )
        
        return twilio_service.send_sms(phone, message)
        
    except Exception as e:
        logger.error(f"Error sending reminder SMS to {phone}: {str(e)}")
        return False


async def update_reminder_status(
    db: AsyncSession, 
    reminder: VaccinationReminder, 
    email_sent: bool, 
    sms_sent: bool
) -> None:
    """Update the reminder status in database"""
    try:
        now = datetime.utcnow()
        
        if email_sent:
            reminder.email_sent = True
            reminder.email_sent_at = now
            
        if sms_sent:
            reminder.sms_sent = True
            reminder.sms_sent_at = now
            
        reminder.updated_at = now
        
        await db.commit()
        
    except Exception as e:
        logger.error(f"Error updating reminder status for {reminder.id}: {str(e)}")
        await db.rollback()


async def create_reminders_for_vaccination_record(
    db: AsyncSession, 
    vaccination_record: VaccinationRecord
) -> List[VaccinationReminder]:
    """
    Create all reminder records for a vaccination record
    
    Args:
        db: Database session
        vaccination_record: The vaccination record to create reminders for
        
    Returns:
        List of created VaccinationReminder objects
    """
    try:
        created_reminders = []
        
        for reminder_type in ReminderType:
            # Check if reminder already exists
            existing_reminder_query = select(VaccinationReminder).where(
                and_(
                    VaccinationReminder.vaccination_record_id == vaccination_record.id,
                    VaccinationReminder.reminder_type == reminder_type
                )
            )
            existing_result = await db.execute(existing_reminder_query)
            existing_reminder = existing_result.scalar_one_or_none()
            
            if not existing_reminder:
                # Create new reminder
                reminder = VaccinationReminder(
                    vaccination_record_id=vaccination_record.id,
                    user_id=vaccination_record.user_id,
                    vaccine_name=vaccination_record.vaccine_template.name if vaccination_record.vaccine_template else "Vaccination",
                    due_date=vaccination_record.due_date,
                    reminder_type=reminder_type
                )
                
                db.add(reminder)
                created_reminders.append(reminder)
        
        await db.commit()
        logger.info(f"✅ Created {len(created_reminders)} reminders for vaccination record {vaccination_record.id}")
        
        return created_reminders
        
    except Exception as e:
        logger.error(f"Error creating reminders for vaccination record {vaccination_record.id}: {str(e)}")
        await db.rollback()
        return []
