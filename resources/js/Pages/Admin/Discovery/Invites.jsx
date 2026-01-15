import React, { useEffect, useState } from "react";

const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

const Invites = () => {
  const [invites, setInvites] = useState({ data: [] });

  useEffect(() => {
    fetch("/api/admin/discovery/invites", {
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'same-origin',
    })
      .then((res) => res.json())
      .then((data) => setInvites(data));
  }, []);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    // Optionally show a toast/alert
  };
  
  const copyLink = (code) => {
    const link = `${window.location.origin}/discovery?code=${code}`;
    navigator.clipboard.writeText(link);
    // Optionally show a toast/alert
  };

  return (
    <div className="pt-24 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Invite Codes</h2>
        <a href="/admin/discovery/invites/create" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Invite
        </a>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Uses</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sessions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Expires</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {invites.data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No invite codes yet. Create one to get started.
                </td>
              </tr>
            ) : (
              invites.data.map((invite) => (
                <tr key={invite.id} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-purple-400 font-medium">{invite.code}</span>
                      <button onClick={() => copyCode(invite.code)} className="text-gray-500 hover:text-white" title="Copy code">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button onClick={() => copyLink(invite.code)} className="text-gray-500 hover:text-white" title="Copy discovery link">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${invite.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {invite.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {invite.current_uses} / {invite.max_uses || '∞'}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{invite.sessions_count}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{invite.expires_at ? formatDate(invite.expires_at) : 'Never'}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(invite.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    {/* Actions: Resend, Toggle, Delete, etc. */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invites;
