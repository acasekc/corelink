import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Briefcase, BookText, LifeBuoy, FileText } from "lucide-react";

export default function AdminHeader() {
  const location = useLocation();

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/discovery", label: "Discovery", icon: FolderKanban },
    { to: "/admin/case-studies", label: "Case Studies", icon: BookText },
    { to: "/admin/projects", label: "Projects", icon: Briefcase },
    { to: "/admin/articles", label: "Articles", icon: FileText },
    { to: "/admin/helpdesk", label: "Helpdesk", icon: LifeBuoy },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-700">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2 text-white">
          <span className="font-semibold">CoreLink Admin</span>
        </Link>

        <nav className="flex items-center gap-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition " +
                (isActive(to)
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-300 hover:text-white hover:bg-slate-800")
              }
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
