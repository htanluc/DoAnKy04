import React from 'react';

interface OptimizedDashboardProps {
  children: React.ReactNode;
  className?: string;
}

export const OptimizedDashboard: React.FC<OptimizedDashboardProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`optimized-dashboard ${className}`}>
      {children}
    </div>
  );
};

export default OptimizedDashboard; 