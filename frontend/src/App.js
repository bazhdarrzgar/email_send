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
import { Checkbox } from './components/ui/checkbox';
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
  FileText,
  BarChart3,
  Filter,
  Download,
  Eye,
  Tags,
  Repeat,
  Sparkles
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { format } from 'date-fns';
import { ThemeToggle } from './components/ui/theme-toggle';
import { EmailSettings } from './components/EmailSettings';
import { EmailTemplates } from './components/EmailTemplates';
import { Dashboard } from './components/Dashboard';
import { EmailPreview } from './components/EmailPreview';
import { EmailFilters } from './components/EmailFilters';
import { RecurringSchedule } from './components/RecurringSchedule';
import { useToast } from './components/ui/use-toast';
import { Toaster } from './components/ui/toaster';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  // Form state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [category, setCategory] = useState('general');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Recurring email state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState('');
  const [recurringEndDate, setRecurringEndDate] = useState(null);

  // App state
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Filter and selection state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: ''
  });
  const [selectedEmails, setSelectedEmails] = useState([]);

  const { toast } = useToast();

  // Fetch scheduled emails on component mount
  useEffect(() => {
    fetchScheduledEmails();
  }, []);

  // Apply filters when emails or filters change
  useEffect(() => {
    applyFilters();
  }, [scheduledEmails, filters]);

  const fetchScheduledEmails = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      
      const response = await fetch(`${API_BASE_URL}/api/scheduled-emails?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setScheduledEmails(data);
      }
    } catch (error) {
      console.error('Failed to fetch scheduled emails:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scheduled emails",
        variant: "destructive"
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...scheduledEmails];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(email => 
        email.subject.toLowerCase().includes(searchLower) ||
        email.recipient_email.toLowerCase().includes(searchLower) ||
        (email.recipient_name && email.recipient_name.toLowerCase().includes(searchLower)) ||
        email.message.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(email => email.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(email => email.priority === filters.priority);
    }

    if (filters.category) {
      filtered = filtered.filter(email => email.category === filters.category);
    }

    setFilteredEmails(filtered);
  };

  const scheduleEmail = async () => {
    if (!selectedDate || !recipientEmail || !emailSubject || !emailMessage) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (isRecurring && !recurringPattern) {
      toast({
        title: "Validation Error", 
        description: "Please select a recurring pattern",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

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
        category: category,
        template_id: selectedTemplate?.id || null,
        is_recurring: isRecurring,
        recurring_pattern: recurringPattern || null,
        recurring_end_date: recurringEndDate ? recurringEndDate.toISOString() : null
      };

      const response = await fetch(`${API_BASE_URL}/api/schedule-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: `Email ${isRecurring ? 'series' : ''} scheduled successfully!`
        });
        fetchScheduledEmails();
        // Reset form
        setSelectedDate(new Date());
        setSelectedTime('12:00');
        setRecipientEmail('');
        setRecipientName('');
        setEmailSubject('');
        setEmailMessage('');
        setPriority('normal');
        setCategory('general');
        setSelectedTemplate(null);
        setIsRecurring(false);
        setRecurringPattern('');
        setRecurringEndDate(null);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: `Failed to schedule email: ${errorData.detail}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAndSendEmails = async () => {
    setCheckLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/check-send-emails`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Email Check Complete",
          description: `Checked ${result.checked_count} emails. Sent: ${result.sent_count}, Failed: ${result.failed_count}`
        });
        fetchScheduledEmails();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: `Failed to check emails: ${errorData.detail}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setCheckLoading(false);
    }
  };

  const testEmail = async () => {
    setCheckLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/test-email`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast({
            title: "Test Email Sent",
            description: `Successfully sent from ${result.details.from} to ${result.details.to}`
          });
        } else {
          toast({
            title: "Test Failed",
            description: result.message,
            variant: "destructive"
          });
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: `Failed to send test email: ${errorData.detail}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
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
        toast({
          title: "Success",
          description: "Email cancelled successfully"
        });
        fetchScheduledEmails();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: `Failed to cancel email: ${errorData.detail}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedEmails.length === 0) return;

    const actionParts = action.split('_');
    const actionType = actionParts[0];
    const actionSubtype = actionParts[1];
    const actionValue = actionParts[2];

    let requestBody = {
      email_ids: selectedEmails,
      action: actionType === 'change' ? `change_${actionSubtype}` : actionType
    };

    if (actionType === 'change') {
      requestBody.new_value = actionValue;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/scheduled-emails/bulk-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Bulk Action Complete",
          description: result.message
        });
        fetchScheduledEmails();
        setSelectedEmails([]);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: `Bulk action failed: ${errorData.detail}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      
      const response = await fetch(`${API_BASE_URL}/api/scheduled-emails/export?${queryParams}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'scheduled_emails.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast({
          title: "Export Complete",
          description: "Email data exported successfully"
        });
      } else {
        toast({
          title: "Export Failed",
          description: "Failed to export email data",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Export error: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setEmailSubject(template.subject);
    setEmailMessage(template.message);
    setCategory(template.category || 'general');
    toast({
      title: "Template Applied",
      description: `"${template.name}" template has been applied`
    });
  };

  const handleEmailSelection = (emailId, checked) => {
    if (checked) {
      setSelectedEmails([...selectedEmails, emailId]);
    } else {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId));
    }
  };

  const handleSelectAll = () => {
    setSelectedEmails(filteredEmails.map(email => email.id));
  };

  const handleClearSelection = () => {
    setSelectedEmails([]);
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
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-600 rounded-2xl shadow-lg border border-blue-200 dark:border-blue-800">
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
            Schedule emails with custom settings, templates, analytics, and advanced automation features.
          </p>
        </div>

        {/* Enhanced Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
              <Send className="h-4 w-4" />
              Send & Manage
            </TabsTrigger>
            <TabsTrigger value="emails" className="gap-2">
              <Mail className="h-4 w-4" />
              All Emails ({scheduledEmails.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          {/* Enhanced Schedule Email Tab */}
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

                  <div className="grid grid-cols-2 gap-4">
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

                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="onboarding">Onboarding</SelectItem>
                          <SelectItem value="appointments">Appointments</SelectItem>
                          <SelectItem value="gratitude">Gratitude</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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

                  {/* Email Preview */}
                  <div className="pt-4 border-t">
                    <EmailPreview
                      recipientEmail={recipientEmail}
                      recipientName={recipientName}
                      subject={emailSubject}
                      message={emailMessage}
                      scheduledDateTime={selectedDate && selectedTime ? 
                        new Date(selectedDate.setHours(selectedTime.split(':')[0], selectedTime.split(':')[1])) : 
                        null
                      }
                      priority={priority}
                      category={category}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Date & Time Selection */}
              <div className="space-y-8">
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

                {/* Recurring Schedule */}
                <RecurringSchedule
                  isRecurring={isRecurring}
                  onRecurringChange={setIsRecurring}
                  recurringPattern={recurringPattern}
                  onPatternChange={setRecurringPattern}
                  recurringEndDate={recurringEndDate}
                  onEndDateChange={setRecurringEndDate}
                />
              </div>
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

          {/* Enhanced All Emails Tab */}
          <TabsContent value="emails" className="space-y-6">
            {/* Filters */}
            <EmailFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={() => setFilters({ search: '', status: '', priority: '', category: '' })}
              totalCount={scheduledEmails.length}
              filteredCount={filteredEmails.length}
              onExport={handleExport}
              selectedEmails={selectedEmails}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onBulkAction={handleBulkAction}
            />

            {/* Email List */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  Scheduled Emails ({filteredEmails.length})
                </CardTitle>
                <CardDescription>
                  View and manage your scheduled emails
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredEmails.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">
                      {scheduledEmails.length === 0 ? 'No scheduled emails yet' : 'No emails match your filters'}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {scheduledEmails.length === 0 ? 
                        'Schedule your first email using the Schedule tab' : 
                        'Try adjusting your filters to see more results'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEmails
                      .sort((a, b) => new Date(a.scheduled_datetime) - new Date(b.scheduled_datetime))
                      .map((email) => (
                      <div
                        key={email.id}
                        className="flex items-center gap-4 p-6 border rounded-lg bg-card hover:shadow-md transition-all email-item"
                      >
                        <Checkbox
                          checked={selectedEmails.includes(email.id)}
                          onCheckedChange={(checked) => handleEmailSelection(email.id, checked)}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="font-semibold text-foreground">
                              {email.subject}
                            </h4>
                            {getStatusBadge(email.status)}
                            {getPriorityBadge(email.priority)}
                            {email.category && (
                              <Badge variant="outline" className="capitalize">
                                <Tags className="h-3 w-3 mr-1" />
                                {email.category}
                              </Badge>
                            )}
                            {email.is_recurring && (
                              <Badge variant="secondary">
                                <Repeat className="h-3 w-3 mr-1" />
                                Recurring
                              </Badge>
                            )}
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
                        
                        <div className="flex items-center gap-2">
                          <EmailPreview
                            recipientEmail={email.recipient_email}
                            recipientName={email.recipient_name}
                            subject={email.subject}
                            message={email.message}
                            scheduledDateTime={email.scheduled_datetime}
                            priority={email.priority}
                            category={email.category}
                          />
                          
                          {email.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelEmail(email.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Dashboard />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}

export default App;