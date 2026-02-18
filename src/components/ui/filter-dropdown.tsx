'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  statusOptions: FilterOption[];
  fellowOptions: FilterOption[];
  onStatusChange: (values: string[]) => void;
  onFellowChange: (values: string[]) => void;
  onDateRangeChange: (start: string, end: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onSearchChange: (search: string) => void;
  initialSearch?: string;
}

export function FilterDropdown({
  statusOptions,
  fellowOptions,
  onStatusChange,
  onFellowChange,
  onDateRangeChange,
  onSortChange,
  onSearchChange,
  initialSearch = ''
}: FilterDropdownProps) {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedFellows, setSelectedFellows] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'date');
  const [sortOrder, setSortOrder] = useState(
    searchParams.get('sortOrder') || 'desc'
  );
  const [startDate, setStartDate] = useState(
    searchParams.get('startDate') || ''
  );
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setSelectedStatuses(statusParam.split(','));
    }
    const fellowParam = searchParams.get('fellow');
    if (fellowParam) {
      setSelectedFellows(fellowParam.split(','));
    }
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleStatusToggle = (value: string) => {
    const newStatuses = selectedStatuses.includes(value)
      ? selectedStatuses.filter(s => s !== value)
      : [...selectedStatuses, value];
    setSelectedStatuses(newStatuses);
    onStatusChange(newStatuses);
  };

  const handleFellowToggle = (value: string) => {
    const newFellows = selectedFellows.includes(value)
      ? selectedFellows.filter(f => f !== value)
      : [...selectedFellows, value];
    setSelectedFellows(newFellows);
    onFellowChange(newFellows);
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    onSortChange(newSortBy, newSortOrder);
  };

  const handleDateApply = () => {
    onDateRangeChange(startDate, endDate);
    setOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedStatuses([]);
    setSelectedFellows([]);
    setStartDate('');
    setEndDate('');
    setSearch('');
    onStatusChange([]);
    onFellowChange([]);
    onDateRangeChange('', '');
    onSearchChange('');
  };

  const activeFilterCount =
    selectedStatuses.length +
    selectedFellows.length +
    (startDate ? 1 : 0) +
    (search ? 1 : 0);

  const getSortValue = () => `${sortBy}-${sortOrder}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Search transcripts..."
        value={search}
        onChange={e => handleSearch(e.target.value)}
        className="w-64 rounded-none"
      />

      <Select value={getSortValue()} onValueChange={handleSortChange}>
        <SelectTrigger className="w-48 rounded-none">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc">Date (Newest)</SelectItem>
          <SelectItem value="date-asc">Date (Oldest)</SelectItem>
          <SelectItem value="fellow-asc">Fellow Name (A-Z)</SelectItem>
          <SelectItem value="fellow-desc">Fellow Name (Z-A)</SelectItem>
          <SelectItem value="status-asc">Status</SelectItem>
        </SelectContent>
      </Select>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="rounded-none">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
            {startDate && (
              <Badge variant="secondary" className="ml-2">
                1
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleDateApply}>
                Apply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  onDateRangeChange('', '');
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="rounded-none">
            Filter by Status
            {selectedStatuses.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedStatuses.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="start">
          <div className="space-y-3">
            <div className="text-sm font-medium">Filter by Status</div>
            {statusOptions.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${option.value}`}
                  checked={selectedStatuses.includes(option.value)}
                  onCheckedChange={() => handleStatusToggle(option.value)}
                />
                <Label htmlFor={`status-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="rounded-none">
            Filter by Fellow
            {selectedFellows.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedFellows.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="start">
          <div className="space-y-3">
            <div className="text-sm font-medium">Filter by Fellow</div>
            {fellowOptions.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`fellow-${option.value}`}
                  checked={selectedFellows.includes(option.value)}
                  onCheckedChange={() => handleFellowToggle(option.value)}
                />
                <Label htmlFor={`fellow-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          Clear filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}
