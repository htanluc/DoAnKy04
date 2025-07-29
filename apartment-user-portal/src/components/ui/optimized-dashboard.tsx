import React from 'react';

interface OptimizedDashboardProps {
  children: React.ReactNode;
  className?: string;
  user?: any;
  resident?: any;
  apartment?: any;
  roles?: any;
}

export const OptimizedDashboard: React.FC<OptimizedDashboardProps> = ({ 
  children, 
  className = '',
  user,
  resident,
  apartment,
  roles
}) => {
  return (
    <div className={`optimized-dashboard ${className}`}>
      {children}
    </div>
  );
};

export default OptimizedDashboard; 