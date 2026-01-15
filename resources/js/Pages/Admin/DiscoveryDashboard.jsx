import React, { useEffect, useState } from "react";

const statusClass = (status) => {
  switch (status) {
    case "active":
      return "bg-blue-600 text-white";
    case "completed":
      return "bg-green-600 text-white";
    case "pending":
      return "bg-yellow-500 text-black";
    default:
      return "bg-gray-600 text-white";
  }
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleString();
};

const DiscoveryDashboard = () => {
  const [stats, setStats] = useState({
    total_invites: 0,
    active_invites: 0,
    total_sessions: 0,
    completed_sessions: 0,
    total_plans: 0,
  });
  const [recentSessions, setRecentSessions] = useState([]);

  useEffect(() => {
    fetch("/admin/discovery/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats || stats);
        setRecentSessions(data.recentSessions || []);
      });
  }, []);

  return (
    <div className="pt-32 pb-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-3xl font-bold text-purple-400">{stats.total_invites}</div>
          <div className="text-gray-400 text-sm mt-1">Total Invites</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-3xl font-bold text-green-400">{stats.active_invites}</div>
          <div className="text-gray-400 text-sm mt-1">Active Invites</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-3xl font-bold text-blue-400">{stats.total_sessions}</div>
          <div className="text-gray-400 text-sm mt-1">Total Sessions</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-3xl font-bold text-cyan-400">{stats.completed_sessions}</div>
          <div className="text-gray-400 text-sm mt-1">Completed</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-3xl font-bold text-yellow-400">{stats.total_plans}</div>
          <div className="text-gray-400 text-sm mt-1">Plans Generated</div>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <a
            href="/admin/discovery/invites/create"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create New Invite
          </a>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Sessions</h2>
          <a href="/admin/discovery/sessions" className="text-purple-400 hover:text-purple-300 text-sm">View All →</a>
        </div>
        <div className="divide-y divide-gray-700">
          {recentSessions.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No sessions yet. Create an invite to get started.
            </div>
          ) : (
            recentSessions.map((session) => (
              <div key={session.id} className="px-6 py-4 hover:bg-gray-700/50 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm text-purple-400">{session.invite_code?.code || 'N/A'}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusClass(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      {session.metadata?.user_email || 'No email provided'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-sm">{formatDate(session.created_at)}</div>
                    <div className="text-gray-500 text-xs mt-1">{session.turn_count} turns</div>
                  </div>
                </div>
                <div className="mt-2 flex space-x-2">
                  <a
                    href={`/admin/discovery/sessions/${session.id}`}
                    className="text-blue-400 hover:underline text-xs"
                  >
                    View Session
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoveryDashboard;
