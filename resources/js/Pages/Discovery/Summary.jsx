import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const Summary = () => {
  const { sessionId } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`/api/discovery/${sessionId}/summary`);
        if (response.ok) {
          const data = await response.json();
          setSummary(data.summary);
        }
      } catch (error) {
        console.error('Error loading summary:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummary();
  }, [sessionId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading summary...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-block">
            <img
              src="/images/logo_100_h.png"
              alt="CoreLink Logo"
              width={400}
              height={100}
              decoding="async"
              loading="lazy"
              className="h-8 w-auto"
            />
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="pt-36 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-green-500/20 border border-green-400/50 rounded-full text-sm text-green-400">
              Discovery Complete
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {summary?.project_name || 'Your Project Summary'}
            </h1>
            <p className="text-slate-400">Here's what we discussed about your project</p>
          </div>
          
          {/* Summary Card */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8">
            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span> Overview
              </h2>
              <p className="text-slate-300 leading-relaxed">
                {summary?.overview || 'No overview available.'}
              </p>
            </div>
            
            {/* Key Features */}
            {summary?.key_features?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">✨</span> Key Features
                </h2>
                <ul className="space-y-3">
                  {summary.key_features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-300">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Target Users */}
            {summary?.target_users && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">👥</span> Who This Is For
                </h2>
                <p className="text-slate-300 leading-relaxed">{summary.target_users}</p>
              </div>
            )}
            
            {/* Success Metrics */}
            {summary?.success_metrics?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">📊</span> Success Looks Like
                </h2>
                <ul className="space-y-2">
                  {summary.success_metrics.map((metric, index) => (
                    <li key={index} className="text-slate-300">
                      • {metric}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Next Steps */}
            {summary?.next_steps && (
              <div className="pt-6 border-t border-slate-700">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🚀</span> What's Next
                </h2>
                <p className="text-slate-300 leading-relaxed">{summary.next_steps}</p>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-8 py-4 bg-linear-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold text-center hover:opacity-90 transition"
            >
              Let's Build This Together
            </Link>
            <Link
              to="/"
              className="px-8 py-4 bg-slate-700 rounded-lg font-semibold text-center hover:bg-slate-600 transition"
            >
              Back to Home
            </Link>
          </div>
          
          {/* Footer Note */}
          <p className="text-center text-slate-500 text-sm mt-8">
            A copy of this summary has been sent to your email. Our team will review the full details and reach out soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Summary;
