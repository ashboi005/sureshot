from twilio.rest import Client
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class TwilioSMSService:
    """Twilio SMS service for sending text messages"""
    
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.phone_number = os.getenv("TWILIO_PHONE_NUMBER")
        
        if not all([self.account_sid, self.auth_token, self.phone_number]):
            logger.warning("Twilio credentials not configured. SMS service will not work.")
            self.client = None
        else:
            self.client = Client(self.account_sid, self.auth_token)
    
    def send_sms(self, to_number: str, message: str) -> bool:
        """
        Send SMS using Twilio
        
        Args:
            to_number: Recipient phone number (with country code, e.g., +91xxxxxxxxxx)
            message: SMS message content
            
        Returns:
            bool: True if SMS sent successfully, False otherwise
        """
        try:
            if not self.client:
                logger.error("Twilio client not configured")
                return False
            
            # Ensure the phone number has proper format
            if not to_number.startswith('+'):
                logger.error(f"Phone number {to_number} must include country code (e.g., +91xxxxxxxxxx)")
                return False
            
            # Send SMS
            message_obj = self.client.messages.create(
                body=message,
                from_=self.phone_number,
                to=to_number
            )
            
            logger.info(f"SMS sent successfully to {to_number}. Message SID: {message_obj.sid}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send SMS to {to_number}: {str(e)}")
            return False
    
    def send_vaccination_reminder_sms(
        self, 
        to_number: str, 
        baby_name: str, 
        vaccination_name: str, 
        due_date: str,
        parent_name: str = "Parent"
    ) -> bool:
        """
        Send vaccination reminder SMS
        
        Args:
            to_number: Parent's phone number
            baby_name: Name of the baby
            vaccination_name: Name of the vaccination
            due_date: Due date for vaccination
            parent_name: Name of the parent
            
        Returns:
            bool: True if SMS sent successfully, False otherwise
        """
        message = (
            f"Hi {parent_name}, this is a reminder that {baby_name} is due for "
            f"{vaccination_name} vaccination on {due_date}. Please schedule an appointment "
            f"with your healthcare provider. - VaxTrack"
        )
        
        return self.send_sms(to_number, message)
    
    def send_vaccination_confirmation_sms(
        self, 
        to_number: str, 
        baby_name: str, 
        vaccination_name: str, 
        vaccination_date: str,
        parent_name: str = "Parent"
    ) -> bool:
        """
        Send vaccination confirmation SMS
        
        Args:
            to_number: Parent's phone number
            baby_name: Name of the baby
            vaccination_name: Name of the vaccination
            vaccination_date: Date when vaccination was administered
            parent_name: Name of the parent
            
        Returns:
            bool: True if SMS sent successfully, False otherwise
        """
        message = (
            f"Hi {parent_name}, {baby_name} has successfully received "
            f"{vaccination_name} vaccination on {vaccination_date}. "
            f"Thank you for keeping your child's vaccinations up to date! - VaxTrack"
        )
        
        return self.send_sms(to_number, message)
    
    def send_drive_notification_sms(
        self, 
        to_number: str, 
        baby_name: str, 
        drive_name: str, 
        drive_date: str,
        drive_location: str,
        parent_name: str = "Parent"
    ) -> bool:
        """
        Send vaccination drive notification SMS
        
        Args:
            to_number: Parent's phone number
            baby_name: Name of the baby
            drive_name: Name of the vaccination drive
            drive_date: Date of the vaccination drive
            drive_location: Location of the vaccination drive
            parent_name: Name of the parent
            
        Returns:
            bool: True if SMS sent successfully, False otherwise
        """
        message = (
            f"Hi {parent_name}, there's a vaccination drive '{drive_name}' "
            f"scheduled for {drive_date} in {drive_location}. "
            f"This could be beneficial for {baby_name}. - VaxTrack"
        )
        
        return self.send_sms(to_number, message)

# Create a global instance
twilio_service = TwilioSMSService()

def send_sms(to_number: str, message: str) -> bool:
    """
    Convenience function to send SMS
    
    Args:
        to_number: Recipient phone number (with country code)
        message: SMS message content
        
    Returns:
        bool: True if SMS sent successfully, False otherwise
    """
    return twilio_service.send_sms(to_number, message)

def send_vaccination_reminder_sms(
    to_number: str, 
    baby_name: str, 
    vaccination_name: str, 
    due_date: str,
    parent_name: str = "Parent"
) -> bool:
    """
    Convenience function to send vaccination reminder SMS
    
    Args:
        to_number: Parent's phone number
        baby_name: Name of the baby
        vaccination_name: Name of the vaccination
        due_date: Due date for vaccination
        parent_name: Name of the parent
        
    Returns:
        bool: True if SMS sent successfully, False otherwise
    """
    return twilio_service.send_vaccination_reminder_sms(
        to_number, baby_name, vaccination_name, due_date, parent_name
    )
