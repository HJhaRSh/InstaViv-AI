import React from 'react';
import { ArrowRight, Eye, Briefcase, Cpu, Factory, Wrench, Code, Users, MessageSquare, Globe, Map, GraduationCap, UserCheck, BookOpen, Award } from 'lucide-react';

const iconMap = {
  "Eye": Eye,
  "Briefcase": Briefcase,
  "Cpu": Cpu,
  "Factory": Factory,
  "Wrench": Wrench,
  "Code": Code,
  "Users": Users,
  "MessageSquare": MessageSquare,
  "Globe": Globe,
  "Map": Map,
  "GraduationCap": GraduationCap,
  "UserCheck": UserCheck,
  "BookOpen": BookOpen,
  "Award": Award
};

const CategoryCard = ({ category, onClick, isExpanded }) => {
  const IconComponent = iconMap[category.icon] || BookOpen;

  return (
    <div className={`category-card ${isExpanded ? 'expanded' : ''}`} onClick={onClick}>
      <div className="category-card-bg"></div>
      <div className="cat-icon-wrapper">
        <IconComponent size={28} className="cat-icon" />
      </div>
      <h3 className="cat-title">{category.category}</h3>
      <p className="cat-desc">{category.description}</p>
      
      <div className="cat-meta">
        <span className="cat-count">{category.courses.length} {category.courses.length === 1 ? 'Course' : 'Courses'}</span>
        <div className="cat-arrow-wrapper">
          <ArrowRight size={18} className="cat-arrow" />
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
