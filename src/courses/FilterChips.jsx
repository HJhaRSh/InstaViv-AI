import React from 'react';

const FILTER_OPTIONS = [
  'All',
  'Beginner',
  'Intermediate',
  'Advanced',
  'Business',
  'Engineering',
  'Technology',
  'Industry',
  'School',
  'College'
];

const FilterChips = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="filter-chips">
      {FILTER_OPTIONS.map(filter => (
        <button
          key={filter}
          className={`filter-chip ${activeFilter === filter ? 'active' : ''}`}
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default FilterChips;
