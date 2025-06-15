from fastapi import HTTPException, status, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from config import get_supabase_storage
from models import UserProfile, DriveParticipant, VaccinationDrive, Users
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

async def upload_worker_document(file: UploadFile, document_type: str) -> dict:
    """
    Upload worker documents (certificates, government IDs) to Supabase storage
    
    Args:
        file: The uploaded file
        document_type: Type of document (certificate, government_id, etc.)
    
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
        
        # Create upload path: workers/document_type/filename
        upload_path = f"workers/{document_type}/{unique_filename}"
        
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

async def upload_doctor_document(file: UploadFile, document_type: str) -> dict:
    """
    Upload doctor documents (medical licenses, certificates) to Supabase storage
    
    Args:
        file: The uploaded file
        document_type: Type of document (medical_license, certificate, etc.)
    
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
        
        # Create upload path: doctors/document_type/filename
        upload_path = f"doctors/{document_type}/{unique_filename}"
        
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

async def create_drive_participants(db: AsyncSession, vaccination_drive: VaccinationDrive):
    """
    Auto-create drive participants for all users in the vaccination drive's city
    """
    try:
        # Get all users in the same city as the vaccination drive
        users_in_city_query = select(UserProfile).where(
            UserProfile.city == vaccination_drive.vaccination_city
        )
        
        users_result = await db.execute(users_in_city_query)
        users_in_city = users_result.scalars().all()
        
        # Create participant records for each user
        participants_created = 0
        for user_profile in users_in_city:
            # Check if participant already exists (in case of re-run)
            existing_participant = await db.execute(
                select(DriveParticipant).where(
                    and_(
                        DriveParticipant.vaccination_drive_id == vaccination_drive.id,
                        DriveParticipant.user_id == user_profile.user_id
                    )
                )
            )
            
            if existing_participant.scalar_one_or_none():
                continue  # Skip if already exists
            
            # Create new participant record
            participant = DriveParticipant(
                vaccination_drive_id=vaccination_drive.id,
                user_id=user_profile.user_id,
                baby_name=user_profile.baby_name,
                parent_name=user_profile.parent_name,
                parent_mobile=user_profile.parent_mobile,
                address=f"{user_profile.address}, {user_profile.city}, {user_profile.state} - {user_profile.pin_code}",
                is_vaccinated=False
            )
            
            db.add(participant)
            participants_created += 1
        
        if participants_created > 0:
            await db.commit()
            logger.info(f"Created {participants_created} drive participants for drive {vaccination_drive.id}")
        else:
            logger.info(f"No new participants created for drive {vaccination_drive.id}")
            
    except Exception as e:
        logger.error(f"Error creating drive participants: {str(e)}")
        await db.rollback()
        # Don't raise the exception - participant creation is supplementary

async def notify_assigned_workers(db: AsyncSession, vaccination_drive: VaccinationDrive, assigned_workers: list):
    """
    Send email and SMS notifications to workers assigned to a vaccination drive
    """
    for worker in assigned_workers:
        try:
            # Get worker's profile for contact information
            profile_result = await db.execute(
                select(UserProfile).where(UserProfile.user_id == worker.user_id)
            )
            profile = profile_result.scalar_one_or_none()
            
            # Get user's email from auth.users table
            user_result = await db.execute(
                select(Users).where(Users.id == worker.user_id)
            )
            user = user_result.scalar_one_or_none()
            
            if not user:
                logger.warning(f"User not found for worker {worker.id}")
                continue
                
            worker_name = profile.first_name if profile and profile.first_name else "Worker"
            
            # Format dates for display
            start_date = vaccination_drive.start_date.strftime("%B %d, %Y at %I:%M %p")
            end_date = vaccination_drive.end_date.strftime("%B %d, %Y at %I:%M %p")
            
            # Send Email Notification
            if user.email:
                email_subject = f"Assignment: {vaccination_drive.vaccination_name} - SureShot"
                
                email_html = f"""
                <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #2c5aa0;">SureShot - Drive Assignment Notification</h2>
                            
                            <p>Dear {worker_name},</p>
                            
                            <p>You have been assigned to a new vaccination drive:</p>
                            
                            <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #2c5aa0; margin: 20px 0;">
                                <h3 style="margin: 0 0 10px 0; color: #2c5aa0;">{vaccination_drive.vaccination_name}</h3>
                                <p style="margin: 5px 0;"><strong>Location:</strong> {vaccination_drive.vaccination_city}</p>
                                <p style="margin: 5px 0;"><strong>Start Date:</strong> {start_date}</p>
                                <p style="margin: 5px 0;"><strong>End Date:</strong> {end_date}</p>
                                {f'<p style="margin: 5px 0;"><strong>Description:</strong> {vaccination_drive.description}</p>' if vaccination_drive.description else ''}
                            </div>
                            
                            <p>Please ensure you are available during the scheduled time and prepared to provide vaccination services to the community.</p>
                            
                            <p>If you have any questions or concerns about this assignment, please contact the administration team.</p>
                            
                            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                            
                            <p style="font-size: 12px; color: #666;">
                                This is an automated message from SureShot. Please do not reply to this email.
                            </p>
                        </div>
                    </body>
                </html>
                """
                
                smtp_service.send_html_email(user.email, email_subject, email_html)
                logger.info(f"Assignment email sent to worker {worker.id} at {user.email}")
            
            # Send SMS Notification (use parent_mobile as contact number)
            contact_number = None
            if profile and profile.parent_mobile:
                contact_number = profile.parent_mobile
            
            if contact_number:
                sms_message = (
                    f"Hi {worker_name}, you've been assigned to vaccination drive "
                    f"'{vaccination_drive.vaccination_name}' in {vaccination_drive.vaccination_city} "
                    f"starting {start_date}. Please be prepared for your duties. - SureShot"
                )
                
                twilio_service.send_sms(contact_number, sms_message)
                logger.info(f"Assignment SMS sent to worker {worker.id} at {contact_number}")
                
        except Exception as e:
            logger.error(f"Error sending notification to worker {worker.id}: {str(e)}")
            # Continue with other workers even if one fails

async def notify_drive_participants(db: AsyncSession, vaccination_drive: VaccinationDrive):
    """
    Send email and SMS notifications to all participants in a vaccination drive
    """
    try:
        # Get all participants for this drive
        participants_result = await db.execute(
            select(DriveParticipant).where(
                DriveParticipant.vaccination_drive_id == vaccination_drive.id
            )
        )
        participants = participants_result.scalars().all()
        
        # Format dates for display
        start_date = vaccination_drive.start_date.strftime("%B %d, %Y")
        end_date = vaccination_drive.end_date.strftime("%B %d, %Y")
        
        for participant in participants:
            try:
                # Get user's email from auth.users table
                user_result = await db.execute(
                    select(Users).where(Users.id == participant.user_id)
                )
                user = user_result.scalar_one_or_none()
                
                if not user:
                    logger.warning(f"User not found for participant {participant.id}")
                    continue
                
                parent_name = participant.parent_name or "Parent"
                baby_name = participant.baby_name or "your child"
                
                # Send Email Notification
                if user.email:
                    email_subject = f"New Vaccination Drive in {vaccination_drive.vaccination_city} - SureShot"
                    
                    email_html = f"""
                    <html>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                                <h2 style="color: #2c5aa0;">SureShot - New Vaccination Drive</h2>
                                
                                <p>Dear {parent_name},</p>
                                
                                <p>A new vaccination drive has started in your city that may benefit {baby_name}:</p>
                                
                                <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #2c5aa0; margin: 20px 0;">
                                    <h3 style="margin: 0 0 10px 0; color: #2c5aa0;">{vaccination_drive.vaccination_name}</h3>
                                    <p style="margin: 5px 0;"><strong>Location:</strong> {vaccination_drive.vaccination_city}</p>
                                    <p style="margin: 5px 0;"><strong>Duration:</strong> {start_date} to {end_date}</p>
                                    {f'<p style="margin: 5px 0;"><strong>Description:</strong> {vaccination_drive.description}</p>' if vaccination_drive.description else ''}
                                </div>
                                
                                <p>This vaccination drive is available in your area and you have been automatically enrolled as a participant. Healthcare workers will be available to provide vaccinations during the drive period.</p>
                                
                                <p>Please ensure {baby_name} is available during the drive dates if vaccination is needed.</p>
                                
                                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                                
                                <p style="font-size: 12px; color: #666;">
                                    This is an automated message from SureShot. Please do not reply to this email.
                                </p>
                            </div>
                        </body>
                    </html>
                    """
                    
                    smtp_service.send_html_email(user.email, email_subject, email_html)
                    logger.info(f"Drive notification email sent to participant {participant.id} at {user.email}")
                
                # Send SMS Notification
                if participant.parent_mobile:
                    sms_message = (
                        f"Hi {parent_name}, a new vaccination drive '{vaccination_drive.vaccination_name}' "
                        f"has started in {vaccination_drive.vaccination_city} from {start_date} to {end_date}. "
                        f"This could benefit {baby_name}. You've been enrolled as a participant. - SureShot"
                    )
                    
                    twilio_service.send_sms(participant.parent_mobile, sms_message)
                    logger.info(f"Drive notification SMS sent to participant {participant.id} at {participant.parent_mobile}")
                    
            except Exception as e:
                logger.error(f"Error sending notification to participant {participant.id}: {str(e)}")
                # Continue with other participants even if one fails
                
    except Exception as e:
        logger.error(f"Error notifying drive participants: {str(e)}")
        # Don't raise exception - notifications are supplementary
