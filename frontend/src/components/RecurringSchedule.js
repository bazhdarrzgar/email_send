import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { CalendarIcon, Repeat, Info } from 'lucide-react';
import { format } from 'date-fns';

export function RecurringSchedule({
  isRecurring,
  onRecurringChange,
  recurringPattern,
  onPatternChange,
  recurringEndDate,
  onEndDateChange
}) {
  const getPatternDescription = (pattern) => {
    switch (pattern) {
      case 'daily':
        return 'Email will be sent every day';
      case 'weekly':
        return 'Email will be sent every week on the same day';
      case 'monthly':
        return 'Email will be sent every month on the same date';
      default:
        return 'Select a pattern to see description';
    }
  };

  const getFrequencyEstimate = (pattern, endDate) => {
    if (!pattern || !endDate) return null;
    
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'End date must be in the future';
    
    let frequency;
    switch (pattern) {
      case 'daily':
        frequency = diffDays;
        break;
      case 'weekly':
        frequency = Math.floor(diffDays / 7);
        break;
      case 'monthly':
        frequency = Math.floor(diffDays / 30);
        break;
      default:
        return null;
    }
    
    return `Approximately ${frequency} emails will be created`;
  };

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5 text-purple-600" />
          Recurring Schedule
        </CardTitle>
        <CardDescription>
          Set up automatic email scheduling for recurring communications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Recurring */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="recurring-toggle" className="font-medium">
              Enable Recurring Schedule
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically create multiple instances of this email
            </p>
          </div>
          <Switch
            id="recurring-toggle"
            checked={isRecurring}
            onCheckedChange={onRecurringChange}
          />
        </div>

        {isRecurring && (
          <>
            {/* Pattern Selection */}
            <div className="space-y-3">
              <Label>Recurring Pattern</Label>
              <Select value={recurringPattern || ''} onValueChange={onPatternChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recurring pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Daily
                    </div>
                  </SelectItem>
                  <SelectItem value="weekly">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Weekly
                    </div>
                  </SelectItem>
                  <SelectItem value="monthly">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Monthly
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {recurringPattern && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    {getPatternDescription(recurringPattern)}
                  </span>
                </div>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-3">
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {recurringEndDate ? format(recurringEndDate, 'PPP') : 'Select end date (optional)'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={recurringEndDate}
                    onSelect={onEndDateChange}
                    disabled={(date) => date < new Date(new Date().toDateString())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <p className="text-xs text-muted-foreground">
                If no end date is set, emails will be created for up to 1 year
              </p>
            </div>

            {/* Frequency Estimate */}
            {recurringPattern && (
              <div className="p-4 border border-dashed rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Schedule Summary</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Pattern: <span className="capitalize font-medium">{recurringPattern}</span></div>
                  {recurringEndDate && (
                    <div>Until: <span className="font-medium">{format(recurringEndDate, 'PPP')}</span></div>
                  )}
                  <div className="pt-2 text-xs">
                    {getFrequencyEstimate(recurringPattern, recurringEndDate) || 
                     'Select an end date to see frequency estimate'}
                  </div>
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <div className="font-medium mb-1">Important Notes:</div>
                  <ul className="text-xs space-y-1 list-disc list-inside ml-2">
                    <li>Recurring emails are created immediately when you schedule</li>
                    <li>Each instance can be managed individually once created</li>
                    <li>Maximum of 52 instances (1 year) will be created</li>
                    <li>Changes to this email won't affect already created instances</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}