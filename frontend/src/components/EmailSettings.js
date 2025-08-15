import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Settings, Mail, Key, User, Server, RefreshCw, Save, AlertCircle } from 'lucide-react';
import { Separator } from './ui/separator';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

export function EmailSettings() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState({
    sender_email: '',
    sender_name: '',
    app_password: '',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587
  });

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/email-settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings({
          sender_email: data.sender_email || '',
          sender_name: data.sender_name || '',
          app_password: data.has_password ? '••••••••••••••••' : '',
          smtp_host: data.smtp_host || 'smtp.gmail.com',
          smtp_port: data.smtp_port || 587
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaveLoading(true);
    setMessage('');

    try {
      // Don't send password if it's the masked version
      const settingsToSave = {
        ...settings,
        app_password: settings.app_password.includes('•') ? undefined : settings.app_password
      };

      // Remove undefined values
      Object.keys(settingsToSave).forEach(key => 
        settingsToSave[key] === undefined && delete settingsToSave[key]
      );

      const response = await fetch(`${API_BASE_URL}/api/email-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsToSave),
      });

      if (response.ok) {
        setMessage('✅ Settings saved successfully!');
        setTimeout(() => {
          setMessage('');
          setOpen(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(`❌ Failed to save settings: ${errorData.detail}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Email Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your custom email settings to send emails from your own Gmail account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Account Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Account
              </CardTitle>
              <CardDescription>
                Your Gmail account details for sending emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sender_email" className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    Email Address *
                  </Label>
                  <Input
                    id="sender_email"
                    type="email"
                    placeholder="your.email@gmail.com"
                    value={settings.sender_email}
                    onChange={(e) => handleInputChange('sender_email', e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender_name" className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    Display Name
                  </Label>
                  <Input
                    id="sender_name"
                    placeholder="Your Name"
                    value={settings.sender_name}
                    onChange={(e) => handleInputChange('sender_name', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="app_password" className="flex items-center gap-2">
                  <Key className="h-3 w-3" />
                  App Password (16 characters) *
                </Label>
                <Input
                  id="app_password"
                  type="password"
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={settings.app_password}
                  onChange={(e) => handleInputChange('app_password', e.target.value)}
                  disabled={loading}
                  maxLength={19} // 16 chars + 3 spaces
                />
                <p className="text-xs text-muted-foreground">
                  Generate an App Password from your Google Account settings
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SMTP Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-4 w-4" />
                SMTP Configuration
              </CardTitle>
              <CardDescription>
                Advanced SMTP server settings (usually don't need to change)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={settings.smtp_host}
                    onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={settings.smtp_port}
                    onChange={(e) => handleInputChange('smtp_port', parseInt(e.target.value))}
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    How to get Gmail App Password:
                  </p>
                  <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                    <li>Go to your Google Account settings</li>
                    <li>Enable 2-Step Verification</li>
                    <li>Go to Security → App passwords</li>
                    <li>Generate a new app password for "Mail"</li>
                    <li>Copy the 16-character password here</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg border ${
              message.includes('✅') 
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200' 
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
            }`}>
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={saveLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveSettings}
              disabled={saveLoading || loading || !settings.sender_email || !settings.app_password}
              className="gap-2"
            >
              {saveLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}