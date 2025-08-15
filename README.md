# 📧 Advanced Email Scheduler

A powerful, modern web application for scheduling emails with advanced features like custom email configuration, templates, priority levels, and dark/light mode support.

![Email Scheduler](https://img.shields.io/badge/Status-Production%20Ready-green)
![Version](https://img.shields.io/badge/Version-2.0.1-blue)
![Tech Stack](https://img.shields.io/badge/Tech-React%2019%20%7C%20FastAPI%20%7C%20MongoDB-orange)

## 🌟 Features

### 📱 **Modern User Interface**
- **🌙 Dark/Light Mode Toggle** - Beautiful theme switching with smooth transitions and optimized visibility
- **📑 Tabbed Navigation** - Organized interface with Schedule, Send & Manage, and All Emails tabs
- **🎨 Glass-morphism Design** - Modern UI with backdrop blur effects and gradient backgrounds
- **📱 Responsive Design** - Works seamlessly across desktop, tablet, and mobile devices
- **✨ Enhanced Text Selection** - Optimized text selection colors for better readability in both themes
- **🎯 Improved Logo Visibility** - High-contrast logo design that stands out in both light and dark modes

### ⚙️ **Custom Email Configuration**
- **📧 Personal Gmail Integration** - Use your own Gmail account for sending emails
- **🔑 16-Character App Password Support** - Secure authentication with Gmail App Passwords
- **👤 Custom Sender Identity** - Set your display name and email address
- **🔧 SMTP Configuration** - Advanced settings for different email providers
- **💾 Settings Persistence** - Your configuration is saved securely in the database

### 📝 **Email Templates System**
- **📋 Template Library** - Create and manage reusable email templates
- **⚡ Quick Apply** - One-click template application to new emails
- **🗂️ Template Management** - Create, edit, view, and delete templates
- **🎯 Smart Organization** - Organized template storage with creation dates
- **🔄 Reliable Loading** - Enhanced template loading with fallback mechanisms

### 🎯 **Enhanced Email Scheduling**
- **👥 Custom Recipients** - Set both email address and display name
- **⭐ Priority Levels** - Low, Normal, and High priority email handling
- **📅 Advanced Scheduling** - Precise date and time selection
- **✅ Form Validation** - Comprehensive input validation and error handling
- **🔄 Status Tracking** - Real-time status updates (Pending, Sent, Failed)

### 🚀 **Advanced Features**
- **📊 Priority Queue** - High priority emails are sent first
- **📈 Email Analytics** - Track sent, failed, and pending emails
- **🔄 Bulk Operations** - Send multiple due emails at once
- **🧪 Test Functionality** - Send test emails to verify your configuration
- **⚡ Real-time Updates** - Live status updates and notifications
- **🛠️ Supervisor Integration** - Automated service management for reliable operation

## 🛠️ Tech Stack

### **Frontend**
- **React 19** - Modern React with hooks and context
- **Tailwind CSS** - Utility-first CSS framework with enhanced dark mode support
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Beautiful, customizable icons
- **date-fns** - Modern JavaScript date utility library
- **CRACO** - Create React App Configuration Override for advanced customization

### **Backend**
- **FastAPI** - High-performance Python web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Motor** - Async MongoDB driver for Python
- **Pydantic** - Data validation using Python type annotations
- **SMTP** - Email sending via Gmail SMTP servers
- **Supervisor** - Process management for reliable service operation

### **Infrastructure**
- **Docker/Container Ready** - Optimized for containerized deployment
- **Environment Configuration** - Secure environment variable management
- **CORS Support** - Cross-origin resource sharing properly configured

## 📋 Prerequisites

- **Node.js** (v16 or higher) with **Yarn** package manager
- **Python** (v3.8 or higher)
- **MongoDB** (local or cloud instance)
- **Gmail Account** with App Password enabled (for email sending)

## 🚀 Quick Start

### 1. **Clone the Repository**
```bash
git clone https://github.com/bazhdarrzgar/email_send.git
cd email_send
```

### 2. **Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Environment file already configured
# MONGO_URL="mongodb://localhost:27017"
# DB_NAME="test_database"
```

### 3. **Frontend Setup**
```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies using Yarn
yarn install

# Environment file already configured
# REACT_APP_BACKEND_URL=http://localhost:8001
```

### 4. **Start the Application with Supervisor**
```bash
# Start all services (recommended)
sudo supervisorctl restart all

# Check service status
sudo supervisorctl status

# Individual service management
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

### 5. **Manual Start (Alternative)**
```bash
# Start MongoDB (if running locally)
mongod

# Start Backend (in backend directory)
python server.py

# Start Frontend (in frontend directory)
yarn start
```

**Application URLs:**
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8001`
- **API Documentation**: `http://localhost:8001/docs`

## 📧 Gmail Setup Guide

To use your own Gmail account for sending emails:

### 1. **Enable 2-Step Verification**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled

### 2. **Generate App Password**
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" as the app
3. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

### 3. **Configure in Application**
1. Click "Email Settings" in the application
2. Enter your Gmail address
3. Enter your display name (optional)
4. Paste the 16-character App Password
5. Save settings
6. Use "Send Test Email" to verify your configuration

## 🎨 User Interface Highlights

### **Enhanced Visual Design**
- **Optimized Logo**: High-contrast logo with proper visibility in both light and dark themes
- **Better Text Selection**: Improved text selection colors for enhanced readability
- **Smooth Transitions**: Seamless theme switching with visual feedback
- **Glass-morphism Cards**: Modern card design with backdrop blur effects
- **Responsive Layout**: Mobile-first design that works on all screen sizes

### **Accessibility Features**
- **High Contrast**: Optimized color schemes for better accessibility
- **Keyboard Navigation**: Full keyboard accessibility support
- **Screen Reader Friendly**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order

## 🔧 API Documentation

### **Health Check**
#### `GET /api/health`
Check API service health
```json
{
  "status": "healthy", 
  "service": "advanced-scheduled-email-api", 
  "version": "2.0.0"
}
```

### **Email Settings Endpoints**

#### `POST /api/email-settings`
Save or update email configuration
```json
{
  "sender_email": "your.email@gmail.com",
  "sender_name": "Your Name",
  "app_password": "xxxx xxxx xxxx xxxx",
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587
}
```

#### `GET /api/email-settings`
Retrieve current email settings
```json
{
  "sender_email": "your.email@gmail.com",
  "sender_name": "Your Name",
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "has_password": true
}
```

### **Email Templates Endpoints**

#### `POST /api/email-templates`
Create a new email template
```json
{
  "name": "Welcome Email",
  "subject": "Welcome to our service!",
  "message": "Thank you for joining us..."
}
```

#### `GET /api/email-templates`
Get all email templates (includes 6 pre-loaded templates)
```json
[
  {
    "id": "template-uuid",
    "name": "Welcome Email",
    "subject": "Welcome to our service!",
    "message": "Thank you for joining us...",
    "created_at": "2025-08-15T07:45:01Z",
    "is_default": true
  }
]
```

#### `DELETE /api/email-templates/{template_id}`
Delete a specific template

#### `POST /api/email-templates/initialize-defaults`
Initialize default email templates

### **Enhanced Email Scheduling**

#### `POST /api/schedule-email`
Schedule a new email with advanced options
```json
{
  "scheduled_datetime": "2025-08-15T20:00:00Z",
  "recipient_email": "recipient@example.com",
  "recipient_name": "Recipient Name",
  "subject": "Email Subject",
  "message": "Email content...",
  "priority": "high",
  "template_id": "optional-template-uuid"
}
```

#### `GET /api/scheduled-emails`
Get all scheduled emails with enhanced data
```json
[
  {
    "id": "email-uuid",
    "scheduled_datetime": "2025-08-15T20:00:00Z",
    "recipient_email": "recipient@example.com",
    "recipient_name": "Recipient Name",
    "subject": "Email Subject",
    "message": "Email content...",
    "status": "pending",
    "priority": "high",
    "created_at": "2025-08-15T07:45:01Z",
    "sent_at": null
  }
]
```

#### `DELETE /api/scheduled-emails/{email_id}`
Cancel a scheduled email (only if status is pending)

### **Email Operations**

#### `POST /api/check-send-emails`
Check and send due emails (prioritized by high > normal > low)
```json
{
  "checked_count": 5,
  "sent_count": 3,
  "failed_count": 2,
  "details": [...]
}
```

#### `POST /api/test-email`
Send a test email with current settings
```json
{
  "success": true,
  "message": "Test email sent successfully!",
  "details": {
    "from": "your.email@gmail.com",
    "to": "test@example.com",
    "subject": "Test Email"
  }
}
```

## 🎨 Usage Guide

### **1. Initial Setup**
1. **Configure Email Settings**: Click "Email Settings" and enter your Gmail credentials
2. **Test Configuration**: Use "Send Test Email" to verify your setup
3. **Create Templates**: Set up commonly used email templates

### **2. Scheduling Emails**
1. **Navigate to Schedule Tab**: Use the tabbed interface
2. **Fill Email Details**: Enter recipient, subject, and message
3. **Set Priority**: Choose Low, Normal, or High priority
4. **Select Date & Time**: Use the calendar and time picker
5. **Apply Template** (optional): Use saved templates for quick setup
6. **Schedule**: Click "Schedule Email" to save

### **3. Managing Emails**
1. **Send & Manage Tab**: Manually trigger sending of due emails
2. **All Emails Tab**: View, filter, and manage all scheduled emails
3. **Cancel Pending**: Remove emails that haven't been sent yet
4. **Track Status**: Monitor sent, failed, and pending emails

### **4. Templates**
1. **Create Template**: Click "Templates" → "New Template"
2. **Apply Template**: Select template when scheduling emails
3. **Manage Templates**: Edit, delete, or organize your templates

## 🌙 Dark Mode

The application features a beautiful dark/light mode toggle:
- **Automatic Detection**: Respects system theme preference
- **Manual Toggle**: Click the theme toggle button in the header
- **Smooth Transitions**: Seamless switching between themes
- **Persistent Setting**: Theme preference is saved locally

## 🔒 Security Features

- **Secure Password Storage**: App passwords are encrypted in the database
- **Input Validation**: Comprehensive form validation and sanitization
- **CORS Protection**: Proper cross-origin resource sharing configuration
- **Error Handling**: Secure error messages without sensitive information exposure
- **App Password Authentication**: Uses Gmail App Passwords instead of account passwords

## 📊 Database Schema

### **Collections**

#### `scheduled_emails`
```javascript
{
  _id: ObjectId,
  id: String (UUID),
  scheduled_datetime: Date,
  recipient_email: String,
  recipient_name: String,
  subject: String,
  message: String,
  priority: String, // 'low', 'normal', 'high'
  status: String,   // 'pending', 'sent', 'failed'
  created_at: Date,
  sent_at: Date
}
```

#### `email_settings`
```javascript
{
  _id: ObjectId,
  user_id: String,
  sender_email: String,
  sender_name: String,
  app_password: String, // Encrypted
  smtp_host: String,
  smtp_port: Number,
  updated_at: Date,
  is_default: Boolean
}
```

#### `email_templates`
```javascript
{
  _id: ObjectId,
  id: String (UUID),
  name: String,
  subject: String,
  message: String,
  created_at: Date,
  is_default: Boolean
}
```

## 🚀 Deployment

### **Environment Variables**

#### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=scheduled_email_db
CORS_ORIGINS=*
```

#### Frontend (.env)
```env
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

### **Production Deployment**
1. **Build Frontend**: `yarn build`
2. **Configure Database**: Set up MongoDB Atlas or local MongoDB
3. **Deploy Backend**: Deploy FastAPI application
4. **Deploy Frontend**: Serve built React application
5. **Configure CORS**: Update CORS_ORIGINS for production domains

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/advanced-email-scheduler/issues) page
2. Create a new issue with detailed information
3. Include error logs and system information

## 🎯 Roadmap

- [ ] **Email Scheduling Automation** - Cron job for automatic email sending
- [ ] **Email Analytics Dashboard** - Detailed statistics and reporting  
- [ ] **Multiple Email Providers** - Support for Outlook, Yahoo, and custom SMTP
- [ ] **Email Tracking** - Read receipts and click tracking
- [ ] **Bulk Email Import** - CSV import for mass email scheduling
- [ ] **API Rate Limiting** - Enhanced security and usage controls
- [ ] **Multi-user Support** - User accounts and authentication
- [ ] **Email Attachments** - File attachment support
- [ ] **Rich Text Editor** - HTML email composition
- [ ] **Webhook Integration** - External service notifications

---

**Made with ❤️ by [Your Name]**

*Star ⭐ this repository if you find it helpful!*