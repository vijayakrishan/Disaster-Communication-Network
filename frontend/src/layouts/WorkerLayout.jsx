import React from 'react';
import WorkerSidebar from '../pages/worker/WorkerSidebar';
import WorkerHeader from '../pages/worker/WorkerHeader';

/**
 * WorkerLayout provides a standardized layout shell for field rescue workers.
 */
export const WorkerLayout = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="layout-worker flex min-h-screen">
      <WorkerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="layout-main flex-1 flex flex-col">
        <WorkerHeader />
        <main className="layout-content flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default WorkerLayout;
