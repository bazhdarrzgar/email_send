import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Eye, Mail, User, Calendar, Star } from 'lucide-react';

export function EmailPreview({ 
  recipientEmail, 
  recipientName, 
  subject, 
  message, 
  scheduledDateTime, 
  priority,
  category 
}) {
  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not set';
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'normal': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'low': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Email Preview
          </DialogTitle>
          <DialogDescription>
            Preview how your email will look when sent
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Email Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Recipient</div>
                  <div className="text-sm text-muted-foreground">
                    {recipientName ? `${recipientName} <${recipientEmail}>` : recipientEmail}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Scheduled Time</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDateTime(scheduledDateTime)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(priority)}>
                    {priority === 'high' && <Star className="h-3 w-3 mr-1" />}
                    {priority?.charAt(0).toUpperCase() + priority?.slice(1)} Priority
                  </Badge>
                  {category && (
                    <Badge variant="outline" className="capitalize">
                      {category}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-card space-y-4">
                {/* Email Header */}
                <div className="border-b pb-4">
                  <div className="text-sm text-muted-foreground mb-2">Subject:</div>
                  <div className="font-semibold text-lg">{subject || 'No subject'}</div>
                </div>
                
                {/* Email Body */}
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Message:</div>
                  <div className="prose prose-sm max-w-none">
                    {message ? (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message}
                      </div>
                    ) : (
                      <div className="text-muted-foreground italic">No message content</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Email Preview */}
        <Card className="lg:hidden">
          <CardHeader>
            <CardTitle className="text-lg">Mobile Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm mx-auto border-2 border-gray-300 rounded-lg p-2 bg-gray-50 dark:bg-gray-900">
              <div className="bg-white dark:bg-gray-800 rounded border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {recipientName || 'Recipient'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {recipientEmail}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm font-medium mb-2 line-clamp-2">
                  {subject || 'No subject'}
                </div>
                
                <div className="text-xs text-muted-foreground line-clamp-3">
                  {message || 'No message content'}
                </div>
                
                <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                  <Badge className={`${getPriorityColor(priority)} text-xs`}>
                    {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
                  </Badge>
                  {category && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}