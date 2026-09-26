import React from 'react';
import UserSidebar from '../pages/user/UserSidebar';
import UserHeader from '../pages/user/UserHeader';

/**
 * UserLayout provides a standardized layout shell for victim / civilian users.
 */
export const UserLayout = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="layout-user flex min-h-screen">
      <UserSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="layout-main flex-1 flex flex-col">
        <UserHeader />
        <main className="layout-content flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
