import React from 'react';
import { Clock, BarChart, BookOpen, ArrowRight } from 'lucide-react';

const CourseCard = ({ course, isHighlighted }) => {
  return (
    <div className={`course-card ${isHighlighted ? 'highlight' : ''}`}>
      <div className="course-card-inner">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-desc">{course.description}</p>
        
        <div className="course-tags">
          <div className="course-tag">
            <BarChart size={14} />
            <span>{course.level}</span>
          </div>
          <div className="course-tag">
            <Clock size={14} />
            <span>{course.duration}</span>
          </div>
        </div>
        
        <div className="course-prereq">
          <BookOpen size={14} className="prereq-icon" />
          <span><strong>Prerequisites:</strong> {course.prerequisites}</span>
        </div>
      </div>
      
      <div className="course-actions">
        <a href="#" className="btn-sm btn-outline-sm">Learn More</a>
        <a href="#contact" className="btn-sm btn-primary-sm glow-btn">
          <span>Apply Now</span>
          <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
};

export default CourseCard;
