import React from 'react';
import AdminSidebar from '../pages/admin/AdminSidebar';
import AdminHeader from '../pages/admin/AdminHeader';

/**
 * AdminLayout provides a standardized layout shell for administrator views.
 */
export const AdminLayout = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="layout-admin flex min-h-screen">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="layout-main flex-1 flex flex-col">
        <AdminHeader />
        <main className="layout-content flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
