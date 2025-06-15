from fastapi import HTTPException, status, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from config import get_supabase_storage
from models import UserProfile, VaccinationDrive, DriveParticipant, Users
from utils.smtp import smtp_service
from utils.twilio import twilio_service
import uuid
import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)

ALLOWED_DOCUMENT_TYPES = [
    "image/jpeg", "image/jpg", "image/png", "image/webp",
    "application/pdf", 
    "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

async def upload_worker_profile_document(file: UploadFile, document_type: str, worker_user_id: str) -> dict:
    """
    Upload worker profile documents to Supabase storage
    
    Args:
        file: The uploaded file
        document_type: Type of document (certificate, government_id, etc.)
        worker_user_id: ID of the worker uploading the document
    
    Returns:
        dict: Contains file_url, file_name, file_size, content_type, upload_path
    """
    try:
        # Validate file type
        if file.content_type not in ALLOWED_DOCUMENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type {file.content_type} not allowed. Allowed types: {', '.join(ALLOWED_DOCUMENT_TYPES)}"
            )
        
        # Check file size
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Reset file pointer
        await file.seek(0)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Create upload path: workers/user_id/document_type/filename
        upload_path = f"workers/{worker_user_id}/{document_type}/{unique_filename}"
        
        # Upload to Supabase storage
        storage = get_supabase_storage()
        bucket_name = os.getenv("SUPABASE_STORAGE_BUCKET", "documents")
        
        # Upload the file
        result = storage.from_(bucket_name).upload(
            path=upload_path,
            file=file_content,
            file_options={
                "content-type": file.content_type,
                "cache-control": "3600"
            }
        )
        
        if hasattr(result, 'error') and result.error:
            logger.error(f"Supabase upload error: {result.error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload file to storage"
            )
        
        # Get public URL
        public_url_result = storage.from_(bucket_name).get_public_url(upload_path)
        
        return {
            "file_url": public_url_result,
            "file_name": file.filename,
            "file_size": len(file_content),
            "content_type": file.content_type,
            "upload_path": upload_path
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document upload failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document upload failed"
        )

async def send_drive_vaccination_confirmation(
    db: AsyncSession, 
    participant: DriveParticipant,
    vaccination_drive: VaccinationDrive,
    worker_name: str = "Healthcare Worker"
) -> bool:
    """
    Send vaccination confirmation email and SMS to the user after vaccination in a drive
    
    Args:
        db: Database session
        participant: The drive participant who was vaccinated
        vaccination_drive: The vaccination drive details
        worker_name: Name of the worker who administered the vaccine
        
    Returns:
        bool: True if notifications sent successfully, False otherwise
    """
    try:
        # Get user's email from auth.users table
        user_result = await db.execute(
            select(Users).where(Users.id == participant.user_id)
        )
        user = user_result.scalar_one_or_none()
        
        if not user:
            logger.warning(f"User not found for participant {participant.id}")
            return False
        
        # Extract information
        baby_name = participant.baby_name or "your child"
        parent_name = participant.parent_name or "Parent"
        vaccination_name = vaccination_drive.vaccination_name
        vaccination_date = participant.vaccination_date.strftime("%B %d, %Y")
        drive_location = vaccination_drive.vaccination_city
        
        email_sent = False
        sms_sent = False
        
        # Send Email Notification
        if user.email:
            email_subject = f"Vaccination Drive Completed - {baby_name} - SureShot"
            
            email_html = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #28a745;">SureShot - Vaccination Drive Completed ✓</h2>
                        
                        <p>Dear {parent_name},</p>
                        
                        <p>Great news! <strong>{baby_name}</strong> has successfully received their vaccination during our community vaccination drive:</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
                            <h3 style="margin: 0 0 10px 0; color: #28a745;">{vaccination_name}</h3>
                            <p style="margin: 5px 0;"><strong>Date:</strong> {vaccination_date}</p>
                            <p style="margin: 5px 0;"><strong>Location:</strong> {drive_location}</p>
                            <p style="margin: 5px 0;"><strong>Administered by:</strong> {worker_name}</p>
                            {f'<p style="margin: 5px 0;"><strong>Notes:</strong> {participant.notes}</p>' if participant.notes else ''}
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
                        
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h4 style="margin: 0 0 10px 0; color: #856404;">Thank You for Participating!</h4>
                            <p style="margin: 0;">Thank you for participating in our community vaccination drive. Your commitment to keeping {baby_name} protected helps keep our entire community healthy.</p>
                        </div>
                        
                        <p>This vaccination has been recorded in {baby_name}'s vaccination history. You can view the complete vaccination record anytime through your SureShot account.</p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #666;">
                            This is an automated message from SureShot. Please do not reply to this email.
                            <br>For questions, please contact your healthcare provider or the vaccination drive organizers.
                        </p>
                    </div>
                </body>
            </html>
            """
            
            email_sent = smtp_service.send_html_email(user.email, email_subject, email_html)
            if email_sent:
                logger.info(f"Drive vaccination confirmation email sent to {user.email} for participant {participant.id}")
            else:
                logger.error(f"Failed to send drive vaccination confirmation email to {user.email} for participant {participant.id}")
        
        # Send SMS Notification
        if participant.parent_mobile:
            sms_message = (
                f"Great news {parent_name}! {baby_name} has successfully received "
                f"{vaccination_name} vaccination on {vaccination_date} during the community "
                f"vaccination drive in {drive_location}. Administered by {worker_name}. "
                f"Monitor for mild side effects and keep them comfortable. Thank you for participating! - SureShot"
            )
            
            sms_sent = twilio_service.send_sms(participant.parent_mobile, sms_message)
            if sms_sent:
                logger.info(f"Drive vaccination confirmation SMS sent to {participant.parent_mobile} for participant {participant.id}")
            else:
                logger.error(f"Failed to send drive vaccination confirmation SMS to {participant.parent_mobile} for participant {participant.id}")
        
        # Return True if at least one notification was sent successfully
        success = email_sent or sms_sent
        if success:
            logger.info(f"Drive vaccination confirmation notifications sent for participant {participant.id}")
        else:
            logger.warning(f"No drive vaccination confirmation notifications sent for participant {participant.id}")
            
        return success
        
    except Exception as e:
        logger.error(f"Error sending drive vaccination confirmation for participant {participant.id}: {str(e)}")
        return False
