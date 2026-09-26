import React from 'react';
import WorkerDashboardHeader from './WorkerDashboardHeader';
import WorkerTopNav from './WorkerTopNav';

const WorkerHeader = (props) => {
  if (props.activeTab === 'dashboard') {
    return <WorkerDashboardHeader {...props} />;
  }
  return <WorkerTopNav {...props} />;
};

export default WorkerHeader;
