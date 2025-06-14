import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

class SMTPEmailService:
    """SMTP Email service using Gmail"""
    
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")  # Your Gmail address
        self.smtp_password = os.getenv("SMTP_PASSWORD")  # App password or Gmail password
        self.sender_email = os.getenv("SENDER_EMAIL", self.smtp_username)
        self.sender_name = os.getenv("SENDER_NAME", "VaxTrack")
        
        if not self.smtp_username or not self.smtp_password:
            logger.warning("SMTP credentials not configured. Email service will not work.")
    
    def send_email(
        self, 
        to_email: str, 
        subject: str, 
        message: str, 
        is_html: bool = False,
        cc_emails: Optional[List[str]] = None,
        bcc_emails: Optional[List[str]] = None,
        attachments: Optional[List[str]] = None
    ) -> bool:
        """
        Send email using SMTP
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            message: Email body content
            is_html: Whether the message is HTML formatted
            cc_emails: List of CC email addresses
            bcc_emails: List of BCC email addresses
            attachments: List of file paths to attach
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            if not self.smtp_username or not self.smtp_password:
                logger.error("SMTP credentials not configured")
                return False
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = f"{self.sender_name} <{self.sender_email}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            if cc_emails:
                msg['Cc'] = ', '.join(cc_emails)
            
            # Add body to email
            if is_html:
                msg.attach(MIMEText(message, 'html'))
            else:
                msg.attach(MIMEText(message, 'plain'))
            
            # Add attachments if any
            if attachments:
                for file_path in attachments:
                    if os.path.isfile(file_path):
                        with open(file_path, "rb") as attachment:
                            part = MIMEBase('application', 'octet-stream')
                            part.set_payload(attachment.read())
                            encoders.encode_base64(part)
                            part.add_header(
                                'Content-Disposition',
                                f'attachment; filename= {os.path.basename(file_path)}'
                            )
                            msg.attach(part)
            
            # Create SMTP session
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()  # Secure the connection
            server.login(self.smtp_username, self.smtp_password)
            
            # Send email
            recipients = [to_email]
            if cc_emails:
                recipients.extend(cc_emails)
            if bcc_emails:
                recipients.extend(bcc_emails)
            
            text = msg.as_string()
            server.sendmail(self.sender_email, recipients, text)
            server.quit()
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_html_email(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str,
        cc_emails: Optional[List[str]] = None,
        bcc_emails: Optional[List[str]] = None
    ) -> bool:
        """
        Send HTML formatted email
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML formatted email body
            cc_emails: List of CC email addresses
            bcc_emails: List of BCC email addresses
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        return self.send_email(
            to_email=to_email,
            subject=subject,
            message=html_content,
            is_html=True,
            cc_emails=cc_emails,
            bcc_emails=bcc_emails
        )
    
    def send_vaccination_reminder(
        self, 
        to_email: str, 
        baby_name: str, 
        vaccination_name: str, 
        due_date: str,
        parent_name: str = "Parent"
    ) -> bool:
        """
        Send vaccination reminder email
        
        Args:
            to_email: Parent's email address
            baby_name: Name of the baby
            vaccination_name: Name of the vaccination
            due_date: Due date for vaccination
            parent_name: Name of the parent
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        subject = f"Vaccination Reminder for {baby_name}"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c5aa0;">VaxTrack - Vaccination Reminder</h2>
                    
                    <p>Dear {parent_name},</p>
                    
                    <p>This is a friendly reminder that <strong>{baby_name}</strong> is due for the following vaccination:</p>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #2c5aa0; margin: 20px 0;">
                        <h3 style="margin: 0; color: #2c5aa0;">{vaccination_name}</h3>
                        <p style="margin: 5px 0;"><strong>Due Date:</strong> {due_date}</p>
                    </div>
                    
                    <p>Please schedule an appointment with your healthcare provider to ensure {baby_name} receives this important vaccination on time.</p>
                    
                    <p>If you have any questions or concerns, please don't hesitate to contact your healthcare provider.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #666;">
                        This is an automated message from VaxTrack. Please do not reply to this email.
                    </p>
                </div>
            </body>
        </html>
        """
        
        return self.send_html_email(to_email, subject, html_content)

# Create a global instance
smtp_service = SMTPEmailService()

def send_email(to_email: str, subject: str, message: str, is_html: bool = False) -> bool:
    """
    Convenience function to send email
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        message: Email body content
        is_html: Whether the message is HTML formatted
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    return smtp_service.send_email(to_email, subject, message, is_html)

def send_html_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Convenience function to send HTML email
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML formatted email body
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    return smtp_service.send_html_email(to_email, subject, html_content)
