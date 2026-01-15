import React, { useEffect, useState } from "react";

const formatDate = (dateStr) => new Date(dateStr).toLocaleString();
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

const Sessions = () => {
  const [sessions, setSessions] = useState({ data: [], last_page: 1, current_page: 1 });

  useEffect(() => {
    fetch(`/admin/discovery/sessions?page=${sessions.current_page}`)
      .then((res) => res.json())
      .then((data) => setSessions(data));
  }, [sessions.current_page]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Discovery Sessions</h2>
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Invite Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Turns</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Started</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sessions.data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No sessions yet.</td>
              </tr>
            ) : (
              sessions.data.map((session) => (
                <tr key={session.id} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <div className="text-gray-300">{session.metadata?.user_email || 'Anonymous'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-purple-400 text-sm">{session.invite_code?.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusClass(session.status)}`}>{session.status}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{session.turn_count}</td>
                  <td className="px-6 py-4">
                    {session.discovery_plan ? (
                      <span className="text-green-400 text-sm">Generated</span>
                    ) : (
                      <span className="text-gray-500 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(session.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <a href={`/admin/discovery/sessions/${session.id}`} className="text-blue-400 hover:text-blue-300 text-sm">View Details</a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {sessions.last_page > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          {Array.from({ length: sessions.last_page }, (_, i) => i + 1).map((page) => (
            <a
              key={page}
              href={`?page=${page}`}
              className={`px-3 py-1 rounded text-sm ${page === sessions.current_page ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {page}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sessions;
