import React, { useState, useEffect } from 'react';
import { Calendar } from './components/ui/calendar';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Textarea } from './components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { 
  CalendarIcon, 
  Clock, 
  Mail, 
  RefreshCw, 
  Trash2, 
  Plus, 
  CheckCircle, 
  User, 
  MessageSquare,
  Zap,
  Star,
  AlertTriangle,
  Send,
  FileText
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { format } from 'date-fns';
import { ThemeToggle } from './components/ui/theme-toggle';
import { EmailSettings } from './components/EmailSettings';
import { EmailTemplates } from './components/EmailTemplates';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

console.log('API_BASE_URL in App:', API_BASE_URL);

function App() {
  // Form state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // App state
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('schedule');

  // Fetch scheduled emails on component mount
  useEffect(() => {
    fetchScheduledEmails();
  }, []);

  const fetchScheduledEmails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scheduled-emails`);
      if (response.ok) {
        const data = await response.json();
        setScheduledEmails(data);
      }
    } catch (error) {
      console.error('Failed to fetch scheduled emails:', error);
    }
  };

  const scheduleEmail = async () => {
    if (!selectedDate || !recipientEmail || !emailSubject || !emailMessage) {
      setMessage('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':');
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const requestBody = {
        scheduled_datetime: scheduledDateTime.toISOString(),
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        subject: emailSubject,
        message: emailMessage,
        priority: priority,
        template_id: selectedTemplate?.id || null
      };

      const response = await fetch(`${API_BASE_URL}/api/schedule-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        setMessage('✅ Email scheduled successfully!');
        fetchScheduledEmails();
        // Reset form
        setSelectedDate(new Date());
        setSelectedTime('12:00');
        setRecipientEmail('');
        setRecipientName('');
        setEmailSubject('');
        setEmailMessage('');
        setPriority('normal');
        setSelectedTemplate(null);
        setTimeout(() => setMessage(''), 5000);
      } else {
        const errorData = await response.json();
        setMessage(`❌ Failed to schedule email: ${errorData.detail}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkAndSendEmails = async () => {
    setCheckLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/check-send-emails`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(
          `✅ Checked ${result.checked_count} emails. Sent: ${result.sent_count}, Failed: ${result.failed_count}`
        );
        fetchScheduledEmails();
        setTimeout(() => setMessage(''), 5000);
      } else {
        const errorData = await response.json();
        setMessage(`❌ Failed to check emails: ${errorData.detail}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setCheckLoading(false);
    }
  };

  const testEmail = async () => {
    setCheckLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/test-email`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMessage(`✅ Test email sent successfully! From: ${result.details.from} → To: ${result.details.to}`);
        } else {
          setMessage(`❌ Test email failed: ${result.message}`);
        }
      } else {
        const errorData = await response.json();
        setMessage(`❌ Failed to send test email: ${errorData.detail}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setCheckLoading(false);
    }
  };

  const cancelEmail = async (emailId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scheduled-emails/${emailId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('✅ Email cancelled successfully');
        fetchScheduledEmails();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(`❌ Failed to cancel email: ${errorData.detail}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setEmailSubject(template.subject);
    setEmailMessage(template.message);
    setMessage(`✅ Template "${template.name}" applied!`);
    setTimeout(() => setMessage(''), 3000);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'outline', color: 'text-amber-600 dark:text-amber-400', label: 'Pending', icon: Clock },
      sent: { variant: 'default', color: 'text-green-600 dark:text-green-400', label: 'Sent', icon: CheckCircle },
      failed: { variant: 'destructive', color: 'text-red-600 dark:text-red-400', label: 'Failed', icon: AlertTriangle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className={`${config.color} gap-1`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', label: 'Low' },
      normal: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', label: 'Normal' },
      high: { color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', label: 'High' }
    };

    const config = priorityConfig[priority] || priorityConfig.normal;
    
    return (
      <Badge className={`${config.color} text-xs`}>
        {priority === 'high' && <Star className="h-3 w-3 mr-1" />}
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-light transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1"></div>
            <div className="flex items-center justify-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex-1 flex justify-end gap-2">
              <EmailSettings />
              <EmailTemplates onSelectTemplate={handleTemplateSelect} />
              <ThemeToggle />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4 dark:from-gray-100 dark:via-blue-200 dark:to-indigo-200">
            Advanced Email Scheduler
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Schedule emails with custom settings, templates, and priority levels. Send from your own email with full control.
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="schedule" className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Email
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
              <Send className="h-4 w-4" />
              Send & Manage
            </TabsTrigger>
            <TabsTrigger value="emails" className="gap-2">
              <Mail className="h-4 w-4" />
              All Emails ({scheduledEmails.length})
            </TabsTrigger>
          </TabsList>

          {/* Schedule Email Tab */}
          <TabsContent value="schedule" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Email Details */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-600" />
                    Email Details
                  </CardTitle>
                  <CardDescription>
                    Configure recipient and email content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipient_email">Recipient Email *</Label>
                      <Input
                        id="recipient_email"
                        type="email"
                        placeholder="recipient@example.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipient_name">Recipient Name</Label>
                      <Input
                        id="recipient_name"
                        placeholder="John Doe"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email_subject">Subject *</Label>
                    <Input
                      id="email_subject"
                      placeholder="Email subject line"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email_message">Message *</Label>
                    <Textarea
                      id="email_message"
                      placeholder="Your email message..."
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      rows={4}
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Priority Level</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            Low Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="normal">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            Normal Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-red-500" />
                            High Priority
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTemplate && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">Template: {selectedTemplate.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(null);
                            setEmailSubject('');
                            setEmailMessage('');
                          }}
                          className="ml-auto h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Date & Time Selection */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-green-600" />
                    Schedule Time
                  </CardTitle>
                  <CardDescription>
                    When should this email be sent?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Picker */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Select Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal h-12 bg-background hover:bg-accent"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date(new Date().toDateString())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time Picker */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Select Time
                    </Label>
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="h-12 bg-background"
                    />
                  </div>

                  {/* Schedule Button */}
                  <Button
                    onClick={scheduleEmail}
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg text-lg button-hover-lift"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-3 h-5 w-5 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-3 h-5 w-5" />
                        Schedule Email
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Send & Manage Tab */}
          <TabsContent value="manage" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Send Due Emails */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Send className="h-5 w-5 text-green-600" />
                    Send Scheduled Emails
                  </CardTitle>
                  <CardDescription>
                    Manually check and send any due emails
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      onClick={checkAndSendEmails}
                      disabled={checkLoading}
                      className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg text-lg button-hover-lift"
                    >
                      {checkLoading ? (
                        <>
                          <RefreshCw className="mr-3 h-6 w-6 animate-spin" />
                          Checking & Sending...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-3 h-6 w-6" />
                          Check & Send Due Emails
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Test Email */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    Test Email Functionality
                  </CardTitle>
                  <CardDescription>
                    Send a test email to verify your settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      onClick={testEmail}
                      disabled={checkLoading}
                      variant="outline"
                      className="w-full h-14 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950 button-hover-lift"
                    >
                      {checkLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                          Sending Test...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-5 w-5" />
                          Send Test Email Now
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      This will immediately send a test email using your current settings
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* All Emails Tab */}
          <TabsContent value="emails">
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  Scheduled Emails ({scheduledEmails.length})
                </CardTitle>
                <CardDescription>
                  View and manage your scheduled emails
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scheduledEmails.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">No scheduled emails yet</p>
                    <p className="text-muted-foreground text-sm">Schedule your first email using the Schedule tab</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scheduledEmails
                      .sort((a, b) => new Date(a.scheduled_datetime) - new Date(b.scheduled_datetime))
                      .map((email) => (
                      <div
                        key={email.id}
                        className="flex items-center justify-between p-6 border rounded-lg bg-card hover:shadow-md transition-all email-item"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="font-semibold text-foreground">
                              {email.subject}
                            </h4>
                            {getStatusBadge(email.status)}
                            {getPriorityBadge(email.priority)}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-2">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              Scheduled: {formatDateTime(email.scheduled_datetime)}
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              To: {email.recipient_name ? `${email.recipient_name} <${email.recipient_email}>` : email.recipient_email}
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              <span className="line-clamp-1">{email.message}</span>
                            </div>
                            {email.sent_at && (
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                Sent: {formatDateTime(email.sent_at)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {email.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelEmail(email.id)}
                            className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Global Message Display */}
        {message && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-lg border shadow-lg max-w-md z-50 ${
            message.includes('✅') 
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200' 
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
          }`}>
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;