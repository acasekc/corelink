import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, LogOut } from 'lucide-react';

const Dashboard = () => {
  const handleLogout = async () => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      await fetch('/admin/logout', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
      });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const adminSections = [
    {
      title: 'Case Studies',
      description: 'Manage portfolio case studies and client success stories',
      icon: FileText,
      link: '/admin/case-studies',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Discovery Sessions',
      description: 'Manage AI-powered project discovery conversations and plans',
      icon: MessageSquare,
      link: '/admin/discovery',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/logo_100_h.png" alt="CoreLink Logo" className="h-8" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Manage your CoreLink content and features</p>
          </div>

          {/* Admin Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {adminSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Link
                  key={index}
                  to={section.link}
                  className="group relative bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 hover:border-slate-600 transition-all duration-300 overflow-hidden"
                >
                  {/* Gradient Background Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${section.color} mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-white transition-colors">
                      {section.title}
                    </h2>
                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                      {section.description}
                    </p>
                    <div className="mt-4 flex items-center text-sm font-medium text-slate-500 group-hover:text-blue-400 transition-colors">
                      Manage
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick Stats or Additional Info */}
          <div className="mt-12 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Welcome Back!</h3>
            <p className="text-slate-400 text-sm">
              Use the cards above to navigate to different admin sections. Each section provides full management capabilities for its respective feature.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
