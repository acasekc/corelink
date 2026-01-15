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

const PlanDetail = () => {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    fetch(`/admin/discovery/plans/${planId}`)
      .then((res) => res.json())
      .then((data) => setPlan(data));
  }, [planId]);

  if (!plan) return <div>Loading...</div>;

  const tabs = [
    { id: "summary", label: "User Summary" },
    { id: "requirements", label: "Requirements" },
    { id: "plan", label: "Plan" },
    { id: "history", label: "History" },
  ];

  return (
    <div>
      <div className="mb-6">
        <a href="/admin/discovery/plans" className="text-gray-400 hover:text-white text-sm">← Back to Plans</a>
      </div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold">{plan.projectName}</h2>
          <p className="text-gray-400 mt-1">
            From <a href={`/admin/discovery/sessions/${plan.session_id}`} className="text-purple-400 hover:text-purple-300">Session #{String(plan.session_id).slice(0, 8)}...</a>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {plan.complexity && <span className="px-3 py-1 rounded text-sm font-medium bg-blue-500/20 text-blue-400">{plan.complexity}</span>}
          <span className={`px-3 py-1 rounded text-sm font-medium ${statusClass(plan.status)}`}>{plan.status}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">User Email</p>
          <p className="text-gray-300 mt-1">{plan.session?.metadata?.user_email || 'Anonymous'}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Target Users</p>
          <p className="text-gray-300 mt-1">{plan.requirements?.users?.primary_users || '—'}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Generated</p>
          <p className="text-gray-300 mt-1">{formatDate(plan.created_at)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Email Sent</p>
          <p className="text-gray-300 mt-1">{plan.email_sent_at ? formatDate(plan.email_sent_at) : 'Not sent'}</p>
        </div>
      </div>
      <div className="flex gap-2 mb-6 border-b border-gray-700 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "summary" && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="font-semibold text-green-400 flex items-center gap-2">
                <span role="img" aria-label="clipboard">📋</span> Project Overview
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-300 leading-relaxed">{plan.userSummary?.project_overview || 'No overview available.'}</p>
            </div>
          </div>
        </div>
      )}
      {/* Implement other tabs as needed */}
    </div>
  );
};

export default PlanDetail;
