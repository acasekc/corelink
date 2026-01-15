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

const Plans = () => {
  const [plans, setPlans] = useState({ data: [], last_page: 1, current_page: 1 });

  useEffect(() => {
    fetch(`/admin/discovery/plans?page=${plans.current_page}`)
      .then((res) => res.json())
      .then((data) => setPlans(data));
  }, [plans.current_page]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Discovery Plans</h2>
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Session</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email Sent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Generated</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {plans.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No plans generated yet.</td>
              </tr>
            ) : (
              plans.data.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <a href={`/admin/discovery/sessions/${plan.session_id}`} className="text-purple-400 hover:text-purple-300">Session #{plan.session_id}</a>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{plan.session?.metadata?.user_email || 'Anonymous'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusClass(plan.status)}`}>{plan.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    {plan.email_sent_at ? (
                      <span className="text-green-400 text-sm">{formatDate(plan.email_sent_at)}</span>
                    ) : (
                      <span className="text-gray-500 text-sm">Not sent</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(plan.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <a href={`/admin/discovery/plans/${plan.id}`} className="text-blue-400 hover:text-blue-300 text-sm">View Plan</a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {plans.last_page > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          {Array.from({ length: plans.last_page }, (_, i) => i + 1).map((page) => (
            <a
              key={page}
              href={`?page=${page}`}
              className={`px-3 py-1 rounded text-sm ${page === plans.current_page ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {page}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Plans;
