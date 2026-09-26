import React from 'react';
import AdminDashboardHeader from './AdminDashboardHeader';
import AdminTopNav from './AdminTopNav';

const AdminHeader = (props) => {
  if (props.activeTab === 'dashboard') {
    return <AdminDashboardHeader {...props} />;
  }
  return <AdminTopNav {...props} />;
};

export default AdminHeader;
