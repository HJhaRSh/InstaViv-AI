import React, { useState, useEffect, useRef } from 'react';
import CategoryCard from './CategoryCard';
import CourseCard from './CourseCard';
import SearchBar from './SearchBar';
import FilterChips from './FilterChips';
import coursesData from '../data/courses.json';
import { X } from 'lucide-react';
import './courses.css';

const CoursesApp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [filteredCategories, setFilteredCategories] = useState(coursesData);
  const expandedRef = useRef(null);

  useEffect(() => {
    let result = coursesData;

    // Filter by query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = coursesData.map(cat => {
        // If category matches, keep all its courses (that also match filter)
        const catMatches = cat.category.toLowerCase().includes(query) || cat.description.toLowerCase().includes(query);
        
        const matchedCourses = cat.courses.filter(course => 
          course.title.toLowerCase().includes(query) || 
          course.description.toLowerCase().includes(query) ||
          course.tags.some(tag => tag.toLowerCase().includes(query))
        );

        if (catMatches || matchedCourses.length > 0) {
          // Auto-expand if a single category is matched via courses, but let's just filter for now
          return {
            ...cat,
            courses: catMatches ? cat.courses : matchedCourses,
            _isMatch: true
          };
        }
        return null;
      }).filter(Boolean);
    }

    // Filter by active filter chip
    if (activeFilter !== 'All') {
      result = result.map(cat => {
        const filteredCourses = cat.courses.filter(course => course.tags.includes(activeFilter));
        if (filteredCourses.length > 0) {
          return {
            ...cat,
            courses: filteredCourses
          };
        }
        return null;
      }).filter(Boolean);
    }

    setFilteredCategories(result);

    // Auto expand if search yields courses in only one category
    if (searchQuery.trim() !== '' && result.length === 1 && result[0].courses.length > 0) {
      setExpandedCategoryId(result[0].id);
    } else if (searchQuery.trim() === '') {
      // Don't auto-close if they were just browsing, but if search is cleared maybe leave it
    }

  }, [searchQuery, activeFilter]);

  // Scroll to expanded section when it opens
  useEffect(() => {
    if (expandedCategoryId && expandedRef.current) {
      setTimeout(() => {
        expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [expandedCategoryId]);

  const handleCategoryClick = (id) => {
    if (expandedCategoryId === id) {
      setExpandedCategoryId(null);
    } else {
      setExpandedCategoryId(id);
    }
  };

  return (
    <div className="courses-container">
      <div className="search-filter-container reveal active">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>

      <div className="categories-grid">
        {filteredCategories.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No courses found matching your criteria.
          </div>
        ) : (
          filteredCategories.map(category => (
            <CategoryCard 
              key={category.id}
              category={category} 
              isExpanded={expandedCategoryId === category.id}
              onClick={() => handleCategoryClick(category.id)} 
            />
          ))
        )}
      </div>

      {(() => {
        const expandedCategory = filteredCategories.find(c => c.id === expandedCategoryId);
        if (!expandedCategory) return null;
        
        return (
          <div className="category-expanded-section" ref={expandedRef}>
            <div className="expanded-header">
              <h2>{expandedCategory.category}</h2>
              <button className="close-btn" onClick={() => setExpandedCategoryId(null)}>
                <X size={24} />
              </button>
            </div>
            
            {expandedCategory.courses.length === 0 ? (
              <p style={{color: 'var(--text-secondary)'}}>No courses match the current filters.</p>
            ) : (
              <div className="courses-grid">
                {expandedCategory.courses.map(course => {
                  const isHighlighted = searchQuery.trim() !== '' && (
                    course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    course.description.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  return (
                    <CourseCard 
                      key={course.id} 
                      course={course} 
                      isHighlighted={isHighlighted}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default CoursesApp;
