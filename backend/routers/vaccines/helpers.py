from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import UserProfile, VaccinationRecord, VaccineTemplate, Users
from utils.smtp import smtp_service
from utils.twilio import twilio_service
import logging
from typing import Optional

logger = logging.getLogger(__name__)

async def send_vaccination_confirmation(
    db: AsyncSession, 
    user_id: str, 
    vaccination_record: VaccinationRecord,
    vaccine_template: VaccineTemplate
) -> bool:
    """
    Send vaccination confirmation email and SMS to the user after vaccination
    
    Args:
        db: Database session
        user_id: User ID (baby's parent/guardian)
        vaccination_record: The vaccination record that was administered
        vaccine_template: The vaccine template containing vaccine details
        
    Returns:
        bool: True if notifications sent successfully, False otherwise
    """
    try:
        # Get user profile for baby and parent information
        profile_result = await db.execute(
            select(UserProfile).where(UserProfile.user_id == user_id)
        )
        profile = profile_result.scalar_one_or_none()
        
        # Get user's email from auth.users table
        user_result = await db.execute(
            select(Users).where(Users.id == user_id)
        )
        user = user_result.scalar_one_or_none()
        
        if not user or not profile:
            logger.warning(f"User or profile not found for user_id {user_id}")
            return False
        
        # Extract information
        baby_name = profile.baby_name or "your child"
        parent_name = profile.parent_name or "Parent"
        vaccination_name = vaccine_template.vaccine_name
        vaccination_date = vaccination_record.administered_date.strftime("%B %d, %Y")
        dose_info = f"Dose {vaccination_record.dose_number}" if vaccination_record.dose_number > 1 else ""
        
        email_sent = False
        sms_sent = False
        
        # Send Email Notification
        if user.email:
            email_subject = f"Vaccination Completed - {baby_name} - SureShot"
            
            email_html = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #28a745;">SureShot - Vaccination Completed ✓</h2>
                        
                        <p>Dear {parent_name},</p>
                        
                        <p>Great news! <strong>{baby_name}</strong> has successfully received their vaccination:</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
                            <h3 style="margin: 0 0 10px 0; color: #28a745;">{vaccination_name} {dose_info}</h3>
                            <p style="margin: 5px 0;"><strong>Date Administered:</strong> {vaccination_date}</p>
                            {f'<p style="margin: 5px 0;"><strong>Notes:</strong> {vaccination_record.notes}</p>' if vaccination_record.notes else ''}
                        </div>
                        
                        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h4 style="margin: 0 0 10px 0; color: #0066cc;">Important Post-Vaccination Information:</h4>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>Monitor {baby_name} for any mild side effects like low-grade fever or soreness at injection site</li>
                                <li>These are normal and usually resolve within 24-48 hours</li>
                                <li>Keep {baby_name} hydrated and comfortable</li>
                                <li>Contact your healthcare provider if you notice any severe reactions</li>
                            </ul>
                        </div>
                        
                        <p>This vaccination has been recorded in {baby_name}'s vaccination history. You can view the complete vaccination record anytime through your SureShot account.</p>
                        
                        <p>Thank you for keeping {baby_name}'s vaccinations up to date and protecting their health!</p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #666;">
                            This is an automated message from SureShot. Please do not reply to this email.
                            <br>For questions, please contact your healthcare provider.
                        </p>
                    </div>
                </body>
            </html>
            """
            
            email_sent = smtp_service.send_html_email(user.email, email_subject, email_html)
            if email_sent:
                logger.info(f"Vaccination confirmation email sent to {user.email} for user {user_id}")
            else:
                logger.error(f"Failed to send vaccination confirmation email to {user.email} for user {user_id}")
        
        # Send SMS Notification
        if profile.parent_mobile:
            sms_message = (
                f"Great news {parent_name}! {baby_name} has successfully received "
                f"{vaccination_name} {dose_info} vaccination on {vaccination_date}. "
                f"Monitor for mild side effects and keep them comfortable. "
                f"Thank you for keeping their vaccinations up to date! - SureShot"
            )
            
            sms_sent = twilio_service.send_sms(profile.parent_mobile, sms_message)
            if sms_sent:
                logger.info(f"Vaccination confirmation SMS sent to {profile.parent_mobile} for user {user_id}")
            else:
                logger.error(f"Failed to send vaccination confirmation SMS to {profile.parent_mobile} for user {user_id}")
        
        # Return True if at least one notification was sent successfully
        success = email_sent or sms_sent
        if success:
            logger.info(f"Vaccination confirmation notifications sent for user {user_id}")
        else:
            logger.warning(f"No vaccination confirmation notifications sent for user {user_id}")
            
        return success
        
    except Exception as e:
        logger.error(f"Error sending vaccination confirmation for user {user_id}: {str(e)}")
        return False

async def send_next_dose_reminder(
    db: AsyncSession, 
    user_id: str, 
    next_vaccination_record: VaccinationRecord,
    vaccine_template: VaccineTemplate
) -> bool:
    """
    Send reminder for the next dose if applicable
    
    Args:
        db: Database session
        user_id: User ID (baby's parent/guardian)
        next_vaccination_record: The next vaccination record due
        vaccine_template: The vaccine template containing vaccine details
        
    Returns:
        bool: True if reminder sent successfully, False otherwise
    """
    try:
        # Get user profile for baby and parent information
        profile_result = await db.execute(
            select(UserProfile).where(UserProfile.user_id == user_id)
        )
        profile = profile_result.scalar_one_or_none()
        
        # Get user's email from auth.users table
        user_result = await db.execute(
            select(Users).where(Users.id == user_id)
        )
        user = user_result.scalar_one_or_none()
        
        if not user or not profile or not next_vaccination_record.due_date:
            return False
        
        # Extract information
        baby_name = profile.baby_name or "your child"
        parent_name = profile.parent_name or "Parent"
        vaccination_name = vaccine_template.vaccine_name
        due_date = next_vaccination_record.due_date.strftime("%B %d, %Y")
        dose_info = f"Dose {next_vaccination_record.dose_number}"
        
        # Send email reminder using the existing vaccination reminder function
        if user.email:
            smtp_service.send_vaccination_reminder(
                to_email=user.email,
                baby_name=baby_name,
                vaccination_name=f"{vaccination_name} {dose_info}",
                due_date=due_date,
                parent_name=parent_name
            )
        
        # Send SMS reminder
        if profile.parent_mobile:
            twilio_service.send_vaccination_reminder_sms(
                to_number=profile.parent_mobile,
                baby_name=baby_name,
                vaccination_name=f"{vaccination_name} {dose_info}",
                due_date=due_date,
                parent_name=parent_name
            )
        
        logger.info(f"Next dose reminder sent for user {user_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending next dose reminder for user {user_id}: {str(e)}")
        return False
