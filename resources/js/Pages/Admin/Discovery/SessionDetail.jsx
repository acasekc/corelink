import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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

const SessionDetail = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);

  useEffect(() => {
    fetch(`/admin/discovery/sessions/${sessionId}`)
      .then((res) => res.json())
      .then((data) => setSession(data));
  }, [sessionId]);

  if (!session) return <div>Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <a href="/admin/discovery/sessions" className="text-gray-400 hover:text-white text-sm">← Back to Sessions</a>
      </div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold">Session #{session.id}</h2>
          <p className="text-gray-400 mt-1">{session.metadata?.user_email || 'Anonymous'}</p>
        </div>
        <span className={`px-3 py-1 rounded text-sm font-medium ${statusClass(session.status)}`}>{session.status}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Invite Code</p>
          <p className="font-mono text-purple-400 mt-1">{session.invite_code?.code}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Turn Count</p>
          <p className="text-2xl font-bold mt-1">{session.turn_count}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Started</p>
          <p className="text-gray-300 mt-1">{formatDate(session.created_at)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Last Activity</p>
          <p className="text-gray-300 mt-1">{formatDate(session.updated_at)}</p>
        </div>
      </div>
      {session.discovery_plan && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-green-400">Discovery Plan Generated</h3>
              <p className="text-green-300 text-sm mt-1">Plan was generated on {formatDate(session.discovery_plan.created_at)}</p>
            </div>
            <a href={`/admin/discovery/plans/${session.discovery_plan.id}`} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-medium">View Plan</a>
          </div>
        </div>
      )}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="font-semibold">Conversation History</h3>
        </div>
        <div className="p-6 space-y-4 max-h-150 overflow-y-auto">
          {(!session.messages || session.messages.length === 0) ? (
            <div className="text-center text-gray-500 py-8">No messages in this session.</div>
          ) : (
            session.messages.map((message) => (
              <div key={message.id} className={message.role === 'user' ? 'ml-8' : 'mr-8'}>
                <div className={`rounded-lg p-4 border ${message.role === 'user' ? 'bg-purple-600/20 border-purple-500/30' : 'bg-gray-700/50 border-gray-600'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={message.role === 'user' ? 'text-purple-400' : 'text-gray-400'}>{message.role}</span>
                  </div>
                  <div className="text-gray-300 whitespace-pre-line">{message.content}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
