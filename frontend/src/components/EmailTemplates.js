import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FileText, Plus, Trash2, RefreshCw, Save } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

export function EmailTemplates({ onSelectTemplate }) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    message: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/email-templates`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      setMessage('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    setSaveLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/email-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTemplate),
      });

      if (response.ok) {
        setMessage('✅ Template created successfully!');
        setNewTemplate({ name: '', subject: '', message: '' });
        setShowCreateForm(false);
        fetchTemplates();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(`❌ Failed to create template: ${errorData.detail}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const deleteTemplate = async (templateId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email-templates/${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('✅ Template deleted successfully!');
        fetchTemplates();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(`❌ Failed to delete template: ${errorData.detail}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const initializeDefaultTemplates = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/email-templates/initialize-defaults`, {
        method: 'POST',
      });

      if (response.ok) {
        setMessage('✅ Default templates added successfully!');
        fetchTemplates();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(`❌ Failed to initialize templates: ${errorData.detail}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Email Templates
          </DialogTitle>
          <DialogDescription>
            Create and manage email templates for quick scheduling
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Template */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Create New Template</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {showCreateForm ? 'Cancel' : 'New Template'}
                </Button>
              </div>
            </CardHeader>
            
            {showCreateForm && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template_name">Template Name *</Label>
                  <Input
                    id="template_name"
                    placeholder="e.g., Meeting Reminder, Welcome Email"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template_subject">Subject *</Label>
                  <Input
                    id="template_subject"
                    placeholder="Email subject line"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template_message">Message *</Label>
                  <Textarea
                    id="template_message"
                    placeholder="Email message content..."
                    value={newTemplate.message}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewTemplate({ name: '', subject: '', message: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createTemplate}
                    disabled={saveLoading || !newTemplate.name || !newTemplate.subject || !newTemplate.message}
                    className="gap-2"
                  >
                    {saveLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Create Template
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          <Separator />

          {/* Templates List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Saved Templates</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={initializeDefaultTemplates}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Default Templates
                  </>
                )}
              </Button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : templates.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No templates created yet</p>
                  <p className="text-sm text-muted-foreground">Create your first template above</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1" onClick={() => handleSelectTemplate(template)}>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge variant="secondary" className="text-xs">Template</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Subject:</strong> {template.subject}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {template.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Created: {new Date(template.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplate(template.id);
                          }}
                          className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

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
        </div>
      </DialogContent>
    </Dialog>
  );
}