import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleString() : '—');
const statusClass = (status) => {
  switch (status) {
    case "generating":
      return "bg-purple-600 text-white";
    case "completed":
      return "bg-green-600 text-white";
    case "failed":
      return "bg-red-600 text-white";
    default:
      return "bg-gray-600 text-white";
  }
};

const PlanDetail = () => {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const userSummary = plan?.user_summary;
  const requirements = plan?.structured_requirements;
  const technicalPlan = plan?.technical_plan;
  const projectName = requirements?.project?.name || 'Discovery Plan';
  const complexity = userSummary?.complexity || requirements?.complexity;

  useEffect(() => {
    fetch(`/api/admin/discovery/plans/${planId}`, {
      headers: {
        Accept: 'application/json',
      },
      credentials: 'same-origin',
    })
      .then((res) => res.json())
      .then((data) => setPlan(data));
  }, [planId]);

  if (!plan) return <div>Loading...</div>;

  const tabs = [
    { id: "summary", label: "User Summary" },
    { id: "requirements", label: "Requirements" },
    { id: "technical", label: "Technical Plan" },
  ];

  return (
    <div>
      <div className="mb-6">
        <a href="/admin/discovery/plans" className="text-gray-400 hover:text-white text-sm">← Back to Plans</a>
      </div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold">{projectName}</h2>
          <p className="text-gray-400 mt-1">
            From <a href={`/admin/discovery/sessions/${plan.session_id}`} className="text-purple-400 hover:text-purple-300">Session #{String(plan.session_id).slice(0, 8)}...</a>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {complexity && <span className="px-3 py-1 rounded text-sm font-medium bg-blue-500/20 text-blue-400">{complexity}</span>}
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
          <p className="text-gray-300 mt-1">{requirements?.users?.primary_users || '—'}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Generated</p>
          <p className="text-gray-300 mt-1">{formatDate(plan.created_at)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Email Sent</p>
          <p className="text-gray-300 mt-1">Not tracked</p>
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
              <p className="text-gray-300 leading-relaxed">{userSummary?.project_overview || 'No overview available.'}</p>
            </div>
          </div>

          {userSummary?.high_level_features?.length > 0 && (
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="font-semibold text-green-400 flex items-center gap-2">
                  <span role="img" aria-label="sparkles">✨</span> Key Features
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {userSummary.high_level_features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {userSummary?.goals_and_success?.length > 0 && (
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="font-semibold text-green-400 flex items-center gap-2">
                  <span role="img" aria-label="target">🎯</span> Goals & Success Metrics
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {userSummary.goals_and_success.map((goal, index) => (
                    <li key={index} className="text-gray-300">{goal}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "requirements" && (
        <div className="space-y-6">
          {requirements?.project && (
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="font-semibold text-blue-400">Project Details</h3>
              </div>
              <div className="p-6 space-y-4 text-gray-300">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Project Name</p>
                  <p>{requirements.project.name || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Vision</p>
                  <p>{requirements.project.vision || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Problem Statement</p>
                  <p>{requirements.project.problem_statement || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {requirements?.features?.core_features?.length > 0 && (
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="font-semibold text-blue-400">Core Features</h3>
              </div>
              <div className="p-6 flex flex-wrap gap-2">
                {requirements.features.core_features.map((feature, index) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "technical" && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="font-semibold text-purple-400">Technical Plan</h3>
            </div>
            <div className="p-6 text-gray-300">
              <pre className="whitespace-pre-wrap wrap-break-word text-sm">{JSON.stringify(technicalPlan || {}, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanDetail;
