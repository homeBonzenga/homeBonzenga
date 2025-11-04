import React from 'react';
import Navigation from './Navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 pt-20">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
