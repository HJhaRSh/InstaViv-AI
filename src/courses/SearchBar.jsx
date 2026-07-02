import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="search-bar-wrapper">
      <Search size={20} />
      <input
        type="text"
        className="search-input"
        placeholder="Search courses, categories, or keywords..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
