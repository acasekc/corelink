import React, { useEffect, useState } from "react";

const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleString() : '—');
const formatRelativeTime = (dateStr) => {
  if (!dateStr) {
    return '—';
  }

  const deltaSeconds = Math.round((new Date(dateStr).getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

  if (Math.abs(deltaSeconds) < 60) {
    return rtf.format(deltaSeconds, 'second');
  }

  const deltaMinutes = Math.round(deltaSeconds / 60);

  if (Math.abs(deltaMinutes) < 60) {
    return rtf.format(deltaMinutes, 'minute');
  }

  const deltaHours = Math.round(deltaMinutes / 60);

  if (Math.abs(deltaHours) < 24) {
    return rtf.format(deltaHours, 'hour');
  }

  return rtf.format(Math.round(deltaHours / 24), 'day');
};

const statusClass = (status) => {
  switch (status) {
    case "active":
      return "bg-blue-600 text-white";
    case "completed":
      return "bg-green-600 text-white";
    case "generating":
      return "bg-purple-600 text-white";
    case "failed":
      return "bg-red-600 text-white";
    case "pending":
      return "bg-yellow-500 text-black";
    default:
      return "bg-gray-600 text-white";
  }
};

const getCsrfToken = () => decodeURIComponent(document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '');

const Sessions = () => {
  const [sessions, setSessions] = useState({ data: [], last_page: 1, current_page: 1, summary: { total: 0, active: 0, active_now: 0, active_window_minutes: 5, generating: 0, completed: 0, failed: 0 } });
  const [generatingSessionId, setGeneratingSessionId] = useState(null);
  const [actionError, setActionError] = useState('');

  const loadSessions = async (page = sessions.current_page) => {
    const response = await fetch(`/api/admin/discovery/sessions?page=${page}`, {
      headers: {
        Accept: "application/json",
      },
      credentials: "same-origin",
    });

    const data = await response.json();
    setSessions(data);
  };

  useEffect(() => {
    loadSessions();
  }, [sessions.current_page]);

  const generatePlan = async (sessionId) => {
    setGeneratingSessionId(sessionId);
    setActionError('');

    try {
      const response = await fetch(`/api/admin/discovery/sessions/${sessionId}/generate-plan`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'same-origin',
      });

      const data = await response.json();

      if (!response.ok) {
        setActionError(data.message || 'Unable to start estimate generation.');

        return;
      }

      await loadSessions();
    } catch (error) {
      setActionError('Unable to start estimate generation.');
    } finally {
      setGeneratingSessionId(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Discovery Sessions</h2>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-6">
        {[
          { label: "Total", value: sessions.summary?.total ?? 0, tone: "text-white" },
          { label: `Active Now (${sessions.summary?.active_window_minutes ?? 5}m)`, value: sessions.summary?.active_now ?? 0, tone: "text-cyan-300" },
          { label: "Active", value: sessions.summary?.active ?? 0, tone: "text-blue-400" },
          { label: "Generating", value: sessions.summary?.generating ?? 0, tone: "text-purple-400" },
          { label: "Completed", value: sessions.summary?.completed ?? 0, tone: "text-green-400" },
          { label: "Failed", value: sessions.summary?.failed ?? 0, tone: "text-red-400" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <p className="text-sm text-gray-400">{item.label}</p>
            <p className={`mt-2 text-2xl font-bold ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </div>

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Activity</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sessions.data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No sessions yet.</td>
              </tr>
            ) : (
              sessions.data.map((session) => (
                <tr key={session.id} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <span>{session.metadata?.user_email || 'Anonymous'}</span>
                      {session.is_active_now && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          Live now
                        </span>
                      )}
                    </div>
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
                      <span className={`text-sm ${session.discovery_plan.status === 'failed' ? 'text-red-400' : 'text-green-400'}`}>
                        {session.discovery_plan.status === 'failed' ? 'Failed' : 'Generated'}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(session.created_at)}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    <div>{formatDate(session.last_activity_at || session.updated_at)}</div>
                    <div className="text-xs text-gray-500">{formatRelativeTime(session.last_activity_at || session.updated_at)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {session.can_generate_plan && (
                        <button
                          type="button"
                          onClick={() => generatePlan(session.id)}
                          disabled={generatingSessionId === session.id}
                          className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {generatingSessionId === session.id ? 'Starting…' : session.discovery_plan?.status === 'failed' ? 'Retry Estimate' : 'Generate Estimate'}
                        </button>
                      )}
                      <a href={`/admin/discovery/sessions/${session.id}`} className="text-blue-400 hover:text-blue-300 text-sm">View Details</a>
                    </div>
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
            <button
              key={page}
              type="button"
              onClick={() => setSessions((prev) => ({ ...prev, current_page: page }))}
              className={`px-3 py-1 rounded text-sm ${page === sessions.current_page ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sessions;
