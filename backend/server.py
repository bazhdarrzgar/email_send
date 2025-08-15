import os
import uuid
import asyncio
import smtplib
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Advanced Scheduled Email App",
    description="Schedule emails with custom settings, templates, and advanced features",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "scheduled_email_db")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
scheduled_emails_collection = db.scheduled_emails
email_settings_collection = db.email_settings
email_templates_collection = db.email_templates

# Default Gmail SMTP configuration
DEFAULT_SMTP_HOST = "smtp.gmail.com"
DEFAULT_SMTP_PORT = 587
DEFAULT_USERNAME = "swyanswartz@gmail.com"
DEFAULT_APP_PASSWORD = "mycg zssj vrhz xebg"
DEFAULT_SENDER_EMAIL = "swyanswartz@gmail.com"

# Pydantic models
class EmailSettings(BaseModel):
    user_id: str = "default"
    smtp_host: str = DEFAULT_SMTP_HOST
    smtp_port: int = DEFAULT_SMTP_PORT
    sender_email: str
    sender_name: str = ""
    app_password: str  # 16 character app password
    is_default: bool = True

class EmailTemplate(BaseModel):
    id: str
    name: str
    subject: str
    message: str
    created_at: datetime
    is_default: bool = False

class ScheduleEmailRequest(BaseModel):
    scheduled_datetime: datetime = Field(..., description="When to send the email")
    recipient_email: str = Field(..., description="Recipient email address")
    recipient_name: str = Field(default="", description="Recipient name")
    subject: str = Field(..., description="Email subject")
    message: str = Field(..., description="Email message/body")
    template_id: Optional[str] = Field(default=None, description="Email template ID")
    priority: str = Field(default="normal", description="Email priority: low, normal, high")

class ScheduledEmailResponse(BaseModel):
    id: str
    scheduled_datetime: datetime
    recipient_email: str
    recipient_name: str
    subject: str
    message: str
    status: str
    priority: str
    created_at: datetime
    sent_at: Optional[datetime] = None

class EmailCheckResult(BaseModel):
    checked_count: int
    sent_count: int
    failed_count: int
    details: List[Dict[str, Any]]

class EmailSettingsRequest(BaseModel):
    sender_email: str
    sender_name: str = ""
    app_password: str
    smtp_host: str = DEFAULT_SMTP_HOST
    smtp_port: int = DEFAULT_SMTP_PORT

class EmailTemplateRequest(BaseModel):
    name: str
    subject: str
    message: str

# Email service class
class EmailService:
    def __init__(self):
        self.default_settings = {
            'smtp_host': DEFAULT_SMTP_HOST,
            'smtp_port': DEFAULT_SMTP_PORT,
            'username': DEFAULT_USERNAME,
            'password': DEFAULT_APP_PASSWORD,
            'sender_email': DEFAULT_SENDER_EMAIL,
            'sender_name': 'Scheduled Email App'
        }

    async def get_email_settings(self, user_id: str = "default") -> dict:
        """Get email settings for user"""
        settings = await email_settings_collection.find_one({"user_id": user_id})
        if settings:
            return {
                'smtp_host': settings.get('smtp_host', self.default_settings['smtp_host']),
                'smtp_port': settings.get('smtp_port', self.default_settings['smtp_port']),
                'username': settings['sender_email'],
                'password': settings['app_password'],
                'sender_email': settings['sender_email'],
                'sender_name': settings.get('sender_name', settings['sender_email'])
            }
        return self.default_settings

    async def send_email(self, recipient: str, recipient_name: str, subject: str, body: str, user_id: str = "default") -> bool:
        """Send email using user's custom settings or default"""
        try:
            settings = await self.get_email_settings(user_id)
            
            # Create message
            msg = MIMEMultipart()
            sender_display = f"{settings['sender_name']} <{settings['sender_email']}>" if settings['sender_name'] else settings['sender_email']
            recipient_display = f"{recipient_name} <{recipient}>" if recipient_name else recipient
            
            msg['From'] = sender_display
            msg['To'] = recipient_display
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            # Send email
            with smtplib.SMTP(settings['smtp_host'], settings['smtp_port']) as server:
                server.starttls()
                server.login(settings['username'], settings['password'])
                server.sendmail(settings['sender_email'], [recipient], msg.as_string())
            
            print(f"Email sent successfully from {settings['sender_email']} to {recipient}")
            return True
            
        except Exception as e:
            print(f"Failed to send email to {recipient}: {str(e)}")
            return False

# Initialize email service
email_service = EmailService()

@app.get("/")
async def root():
    return {"message": "Advanced Scheduled Email App is running", "version": "2.0.0"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "advanced-scheduled-email-api", "version": "2.0.0"}

# Email Settings Endpoints
@app.post("/api/email-settings")
async def save_email_settings(settings: EmailSettingsRequest):
    """Save or update email settings"""
    try:
        settings_doc = {
            "user_id": "default",
            "sender_email": settings.sender_email,
            "sender_name": settings.sender_name,
            "app_password": settings.app_password,
            "smtp_host": settings.smtp_host,
            "smtp_port": settings.smtp_port,
            "updated_at": datetime.now(timezone.utc),
            "is_default": True
        }
        
        await email_settings_collection.replace_one(
            {"user_id": "default"}, 
            settings_doc, 
            upsert=True
        )
        
        return {"message": "Email settings saved successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save email settings: {str(e)}")

@app.get("/api/email-settings")
async def get_email_settings():
    """Get current email settings"""
    try:
        settings = await email_settings_collection.find_one({"user_id": "default"})
        if settings:
            # Don't expose the password in the response
            return {
                "sender_email": settings["sender_email"],
                "sender_name": settings.get("sender_name", ""),
                "smtp_host": settings.get("smtp_host", DEFAULT_SMTP_HOST),
                "smtp_port": settings.get("smtp_port", DEFAULT_SMTP_PORT),
                "has_password": bool(settings.get("app_password"))
            }
        return {
            "sender_email": DEFAULT_SENDER_EMAIL,
            "sender_name": "",
            "smtp_host": DEFAULT_SMTP_HOST,
            "smtp_port": DEFAULT_SMTP_PORT,
            "has_password": True
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get email settings: {str(e)}")

# Email Templates Endpoints
@app.post("/api/email-templates")
async def create_email_template(template: EmailTemplateRequest):
    """Create a new email template"""
    try:
        template_doc = {
            "id": str(uuid.uuid4()),
            "name": template.name,
            "subject": template.subject,
            "message": template.message,
            "created_at": datetime.now(timezone.utc),
            "is_default": False
        }
        
        await email_templates_collection.insert_one(template_doc)
        return EmailTemplate(**template_doc)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create template: {str(e)}")

@app.get("/api/email-templates", response_model=List[EmailTemplate])
async def get_email_templates():
    """Get all email templates"""
    try:
        cursor = email_templates_collection.find({}).sort("created_at", -1)
        templates = await cursor.to_list(length=None)
        return [EmailTemplate(**template) for template in templates]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get templates: {str(e)}")

@app.delete("/api/email-templates/{template_id}")
async def delete_email_template(template_id: str):
    """Delete an email template"""
    try:
        result = await email_templates_collection.delete_one({"id": template_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Template not found")
        return {"message": "Template deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete template: {str(e)}")

# Enhanced Email Scheduling
@app.post("/api/schedule-email", response_model=ScheduledEmailResponse)
async def schedule_email(request: ScheduleEmailRequest):
    """Schedule a new email with custom settings"""
    try:
        # If template_id is provided, get template data
        if request.template_id:
            template = await email_templates_collection.find_one({"id": request.template_id})
            if template:
                request.subject = template["subject"]
                request.message = template["message"]
        
        # Create scheduled email document
        scheduled_email = {
            "id": str(uuid.uuid4()),
            "scheduled_datetime": request.scheduled_datetime,
            "recipient_email": request.recipient_email,
            "recipient_name": request.recipient_name,
            "subject": request.subject,
            "message": request.message,
            "priority": request.priority,
            "status": "pending",
            "created_at": datetime.now(timezone.utc),
            "sent_at": None
        }
        
        # Insert into database
        await scheduled_emails_collection.insert_one(scheduled_email)
        
        return ScheduledEmailResponse(**scheduled_email)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to schedule email: {str(e)}")

@app.get("/api/scheduled-emails", response_model=List[ScheduledEmailResponse])
async def get_scheduled_emails():
    """Get all scheduled emails"""
    try:
        cursor = scheduled_emails_collection.find({}).sort("scheduled_datetime", 1)
        scheduled_emails = await cursor.to_list(length=None)
        
        return [ScheduledEmailResponse(**email) for email in scheduled_emails]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch scheduled emails: {str(e)}")

@app.post("/api/check-send-emails", response_model=EmailCheckResult)
async def check_and_send_emails():
    """Check for due emails and send them"""
    try:
        current_time = datetime.now(timezone.utc)
        
        # Find pending emails that are due, sorted by priority
        cursor = scheduled_emails_collection.find({
            "status": "pending",
            "scheduled_datetime": {"$lte": current_time}
        }).sort([("priority", -1), ("scheduled_datetime", 1)])
        
        due_emails = await cursor.to_list(length=None)
        
        sent_count = 0
        failed_count = 0
        details = []
        
        for email_doc in due_emails:
            try:
                # Attempt to send email
                success = await email_service.send_email(
                    recipient=email_doc["recipient_email"],
                    recipient_name=email_doc.get("recipient_name", ""),
                    subject=email_doc["subject"],
                    body=email_doc["message"]
                )
                
                if success:
                    # Update status to sent
                    await scheduled_emails_collection.update_one(
                        {"id": email_doc["id"]},
                        {
                            "$set": {
                                "status": "sent",
                                "sent_at": datetime.now(timezone.utc)
                            }
                        }
                    )
                    sent_count += 1
                    details.append({
                        "id": email_doc["id"],
                        "status": "sent",
                        "recipient": email_doc["recipient_email"],
                        "scheduled_datetime": email_doc["scheduled_datetime"].isoformat()
                    })
                else:
                    # Update status to failed
                    await scheduled_emails_collection.update_one(
                        {"id": email_doc["id"]},
                        {"$set": {"status": "failed"}}
                    )
                    failed_count += 1
                    details.append({
                        "id": email_doc["id"],
                        "status": "failed",
                        "recipient": email_doc["recipient_email"],
                        "scheduled_datetime": email_doc["scheduled_datetime"].isoformat()
                    })
                    
            except Exception as e:
                failed_count += 1
                details.append({
                    "id": email_doc["id"],
                    "status": "failed",
                    "error": str(e),
                    "recipient": email_doc["recipient_email"],
                    "scheduled_datetime": email_doc["scheduled_datetime"].isoformat()
                })
        
        return EmailCheckResult(
            checked_count=len(due_emails),
            sent_count=sent_count,
            failed_count=failed_count,
            details=details
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check and send emails: {str(e)}")

@app.post("/api/test-email")
async def test_email():
    """Test email sending with current settings"""
    try:
        settings = await email_service.get_email_settings()
        
        # Test sending an email immediately
        success = await email_service.send_email(
            recipient="soyansoon9@gmail.com",
            recipient_name="Test User",
            subject="Test Email - Advanced Scheduled Email App",
            body="This is a test email from your Advanced Scheduled Email App with custom settings support!"
        )
        
        if success:
            return {
                "success": True,
                "message": "Test email sent successfully!",
                "details": {
                    "from": settings['sender_email'],
                    "to": "soyansoon9@gmail.com",
                    "subject": "Test Email - Advanced Scheduled Email App"
                }
            }
        else:
            return {
                "success": False,
                "message": "Failed to send test email",
                "error": "SMTP authentication or connection failed"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send test email: {str(e)}")

@app.delete("/api/scheduled-emails/{email_id}")
async def cancel_scheduled_email(email_id: str):
    """Cancel a scheduled email (only if status is pending)"""
    try:
        result = await scheduled_emails_collection.delete_one({
            "id": email_id,
            "status": "pending"
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Scheduled email not found or already processed")
        
        return {"message": "Scheduled email cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cancel scheduled email: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)