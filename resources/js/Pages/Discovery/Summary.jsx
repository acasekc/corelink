import React from 'react';
import { Link } from '@inertiajs/react';
import SeoHead from '@/components/SeoHead';

const Summary = ({ meta, sessionId, summary }) => {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white">
      <SeoHead meta={meta} />
      
      {/* Main Content */}
      <div className="pt-12 pb-20 px-6">
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
              href="/contact"
              className="px-8 py-4 bg-linear-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold text-center hover:opacity-90 transition"
            >
              Let's Build This Together
            </Link>
            <Link
              href="/"
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
