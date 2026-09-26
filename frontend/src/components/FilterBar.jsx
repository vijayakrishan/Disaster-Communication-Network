import React from 'react';
import { Search, Calendar } from 'lucide-react';
import './FilterBar.css';

const FilterBar = ({
  searchPlaceholder = "Search...",
  searchQuery,
  setSearchQuery,
  filterDate,
  setFilterDate,
  dropdownValue,
  setDropdownValue,
  dropdownOptions = [],
  dropdownPlaceholder = "All Options"
}) => {
  return (
    <div className="filter-bar-toolbar">
      <div className="filter-bar-left">
        {setSearchQuery && (
          <div className="filter-bar-search-wrapper">
            <Search size={16} className="filter-bar-search-icon" />
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-bar-input"
            />
          </div>
        )}
      </div>

      <div className="filter-bar-right">
        {setFilterDate && (
          <div className="filter-bar-date-wrapper">
            <Calendar size={14} className="filter-bar-calendar-icon" />
            <input 
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="filter-bar-date-input"
            />
          </div>
        )}

        {setDropdownValue && (
          <select
            value={dropdownValue}
            onChange={(e) => setDropdownValue(e.target.value)}
            className="filter-bar-select"
          >
            <option value="ALL">{dropdownPlaceholder}</option>
            {dropdownOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
