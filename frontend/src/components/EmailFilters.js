import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Search, 
  Filter, 
  X, 
  Download,
  CheckSquare,
  Square
} from 'lucide-react';

export function EmailFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  totalCount,
  filteredCount,
  onExport,
  selectedEmails,
  onSelectAll,
  onClearSelection,
  onBulkAction
}) {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? '' : value
    });
  };

  const handleSearchChange = (value) => {
    onFiltersChange({
      ...filters,
      search: value
    });
  };

  const clearFilters = () => {
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');
  const hasSelection = selectedEmails.length > 0;

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Actions
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Badge variant="outline">
                {filteredCount} of {totalCount} emails
              </Badge>
            )}
            {hasSelection && (
              <Badge variant="secondary">
                {selectedEmails.length} selected
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by subject, recipient, or content..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select 
              value={filters.priority || 'all'} 
              onValueChange={(value) => handleFilterChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="normal">Normal Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select 
              value={filters.category || 'all'} 
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
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

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
          {/* Selection Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectedEmails.length === filteredCount ? onClearSelection : onSelectAll}
              className="gap-2"
            >
              {selectedEmails.length === filteredCount ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {selectedEmails.length === filteredCount ? 'Deselect All' : 'Select All'}
            </Button>

            {hasSelection && (
              <>
                <Select onValueChange={(action) => onBulkAction(action)}>
                  <SelectTrigger className="w-auto">
                    <SelectValue placeholder="Bulk Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delete">Delete Selected</SelectItem>
                    <SelectItem value="change_priority_high">Set High Priority</SelectItem>
                    <SelectItem value="change_priority_normal">Set Normal Priority</SelectItem>
                    <SelectItem value="change_priority_low">Set Low Priority</SelectItem>
                    <SelectItem value="change_category_business">Set Category: Business</SelectItem>
                    <SelectItem value="change_category_marketing">Set Category: Marketing</SelectItem>
                    <SelectItem value="change_category_general">Set Category: General</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Export */}
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: "{filters.search}"
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleSearchChange('')}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="gap-1">
                Status: {filters.status}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('status', '')}
                />
              </Badge>
            )}
            {filters.priority && (
              <Badge variant="secondary" className="gap-1">
                Priority: {filters.priority}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('priority', '')}
                />
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                Category: {filters.category}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('category', '')}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}