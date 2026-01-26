import React from "react";
import { useLocation } from "react-router-dom";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({ children }) {
  const location = useLocation();
  
  // Hide header on login and change-password pages
  const hideHeader = location.pathname === '/admin/login' 
    || location.pathname === '/admin/change-password'
    || location.pathname === '/helpdesk/login';

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {!hideHeader && <AdminHeader />}
      <main className={hideHeader ? "" : "mx-auto max-w-7xl px-4 py-6"}>
        {children}
      </main>
    </div>
  );
}
