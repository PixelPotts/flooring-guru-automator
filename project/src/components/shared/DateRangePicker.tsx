import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  value: '7d' | '30d' | '90d' | 'ytd';
  onChange: (value: '7d' | '30d' | '90d' | 'ytd') => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as '7d' | '30d' | '90d' | 'ytd')}
        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
        <option value="ytd">Year to date</option>
      </select>
    </div>
  );
};

export default DateRangePicker;