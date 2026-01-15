import React, { useEffect, useState } from "react";

const CaseStudiesList = () => {
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/case-studies")
      .then((res) => res.json())
      .then((data) => {
        setCaseStudies(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this case study?")) return;
    
    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') 
      || document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
    
    try {
      await fetch(`/api/admin/case-studies/${id}`, { 
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ''),
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      setCaseStudies(caseStudies.filter((cs) => cs.id !== id));
    } catch (err) {
      alert("Failed to delete case study");
    }
  };

  if (loading) return <div className="pt-32 px-6">Loading...</div>;

  return (
    <div className="pt-32 pb-12 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Case Studies</h2>
        <a
          href="/admin/case-studies/create"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Case Study
        </a>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {caseStudies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No case studies yet. Create one to get started.
                </td>
              </tr>
            ) : (
              caseStudies.map((cs) => (
                <tr key={cs.id} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4 text-gray-300">{cs.title}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-purple-400 text-sm">{cs.slug}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{cs.client_name || '—'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        cs.is_published ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {cs.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{cs.order}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <a
                        href={`/admin/case-studies/${cs.id}/edit`}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Edit
                      </a>
                      <button
                        onClick={() => handleDelete(cs.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
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

export default CaseStudiesList;
