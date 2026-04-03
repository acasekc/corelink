import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleString() : '—');
const toArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return [value.trim()];
  }

  return [];
};

const formatList = (value) => {
  const items = toArray(value);

  return items.length > 0 ? items.join(', ') : '—';
};

const extractedReferenceSections = [
  { key: 'current_property', label: 'Current Property / Existing Site' },
  { key: 'reference_examples', label: 'Reference Examples' },
  { key: 'competitors', label: 'Competitors' },
  { key: 'design_inspirations', label: 'Design Inspirations' },
  { key: 'feature_patterns_to_consider', label: 'Feature Patterns to Consider' },
  { key: 'notes', label: 'Reference Notes' },
];

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
  const [showRawTechnical, setShowRawTechnical] = useState(false);
  const userSummary = plan?.user_summary;
  const requirements = plan?.structured_requirements;
  const technicalPlan = plan?.technical_plan;
  const referenceSummaries = toArray(plan?.session?.metadata?.reference_summaries);
  const extractedReferences = requirements?.references || {};
  const visibleReferenceSections = extractedReferenceSections
    .map((section) => ({
      ...section,
      items: toArray(extractedReferences?.[section.key]),
    }))
    .filter((section) => section.items.length > 0);
  const projectName = requirements?.project?.name || 'Discovery Plan';
  const complexity = userSummary?.complexity || requirements?.estimation?.complexity;

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
          <p className="text-gray-300 mt-1">{formatList(requirements?.users?.primary_users)}</p>
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

          {referenceSummaries.length > 0 && (
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="font-semibold text-green-400 flex items-center gap-2">
                  <span role="img" aria-label="link">🔗</span> Reference Inputs
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {referenceSummaries.map((reference, index) => (
                  <div key={`${reference.url || 'reference'}-${index}`} className="rounded-lg bg-gray-900 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-200">{reference.title || reference.url || `Reference ${index + 1}`}</p>
                        {reference.url && (
                          <a href={reference.url} target="_blank" rel="noreferrer" className="text-sm text-purple-400 hover:text-purple-300 break-all">
                            {reference.url}
                          </a>
                        )}
                      </div>
                      {reference.source_type && (
                        <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300">
                          {reference.source_type.replaceAll('_', ' ')}
                        </span>
                      )}
                    </div>

                    {reference.summary && (
                      <p className="mt-3 text-sm leading-relaxed text-gray-300">{reference.summary}</p>
                    )}

                    {toArray(reference.observed_patterns).length > 0 && (
                      <div className="mt-3">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Observed Patterns</p>
                        <div className="flex flex-wrap gap-2">
                          {toArray(reference.observed_patterns).map((pattern, patternIndex) => (
                            <span key={patternIndex} className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-300">
                              {pattern}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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

          {requirements?.features?.must_have?.length > 0 && (
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="font-semibold text-blue-400">Must-Have Features</h3>
              </div>
              <div className="p-6 flex flex-wrap gap-2">
                {requirements.features.must_have.map((feature, index) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {requirements?.features?.nice_to_have?.length > 0 && (
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="font-semibold text-blue-400">Nice-to-Have Features</h3>
              </div>
              <div className="p-6 flex flex-wrap gap-2">
                {requirements.features.nice_to_have.map((feature, index) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(visibleReferenceSections.length > 0 || referenceSummaries.length > 0) && (
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="font-semibold text-blue-400">Reference Context</h3>
              </div>
              <div className="p-6 space-y-5">
                {visibleReferenceSections.length > 0 ? (
                  visibleReferenceSections.map((section) => (
                    <div key={section.key}>
                      <p className="mb-2 text-sm text-gray-500">{section.label}</p>
                      <ul className="space-y-2">
                        {section.items.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-300">
                            <span className="mt-0.5 text-blue-400">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">
                    This plan predates explicit reference extraction, so the analyzed sites are shown below from session metadata.
                  </p>
                )}

                {referenceSummaries.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm text-gray-500">Analyzed Inputs</p>
                    <div className="flex flex-wrap gap-2">
                      {referenceSummaries.map((reference, index) => (
                        <span key={`${reference.url || 'analyzed-reference'}-${index}`} className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300">
                          {reference.url || reference.title || `Reference ${index + 1}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "technical" && (
        <div className="space-y-6">
          {technicalPlan?.executive_summary && (
            <div className="bg-gray-800 rounded-lg border border-purple-700">
              <div className="border-b border-purple-700 bg-purple-900/20 px-6 py-4">
                <h3 className="flex items-center gap-2 font-semibold text-purple-400">
                  <span role="img" aria-label="bar chart">📊</span> Executive Summary
                </h3>
              </div>
              <div className="p-6">
                <p className="leading-relaxed text-gray-300">{technicalPlan.executive_summary}</p>
              </div>
            </div>
          )}

          {technicalPlan?.tech_stack_details && (
            <div className="bg-gray-800 rounded-lg border border-purple-700">
              <div className="border-b border-purple-700 bg-purple-900/20 px-6 py-4">
                <h3 className="flex items-center gap-2 font-semibold text-purple-400">
                  <span role="img" aria-label="tools">🛠️</span> Recommended Tech Stack
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                {technicalPlan.tech_stack_details.backend && (
                  <div className="rounded-lg bg-gray-900 p-4">
                    <h4 className="mb-3 font-medium text-purple-300">Backend</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Language</span>
                        <span className="text-right text-gray-300">{technicalPlan.tech_stack_details.backend.language || '—'}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Framework</span>
                        <span className="text-right text-gray-300">{technicalPlan.tech_stack_details.backend.framework || '—'}</span>
                      </div>
                    </div>
                    {technicalPlan.tech_stack_details.backend.rationale && (
                      <p className="mt-3 text-sm italic text-gray-500">{technicalPlan.tech_stack_details.backend.rationale}</p>
                    )}
                  </div>
                )}

                {technicalPlan.tech_stack_details.frontend && (
                  <div className="rounded-lg bg-gray-900 p-4">
                    <h4 className="mb-3 font-medium text-purple-300">Frontend</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Framework</span>
                        <span className="text-right text-gray-300">{technicalPlan.tech_stack_details.frontend.framework || '—'}</span>
                      </div>
                    </div>
                    {technicalPlan.tech_stack_details.frontend.rationale && (
                      <p className="mt-3 text-sm italic text-gray-500">{technicalPlan.tech_stack_details.frontend.rationale}</p>
                    )}
                  </div>
                )}

                {technicalPlan.tech_stack_details.database && (
                  <div className="rounded-lg bg-gray-900 p-4">
                    <h4 className="mb-3 font-medium text-purple-300">Database</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Primary</span>
                        <span className="text-right text-gray-300">{technicalPlan.tech_stack_details.database.primary || '—'}</span>
                      </div>
                      {technicalPlan.tech_stack_details.database.cache && (
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-500">Cache</span>
                          <span className="text-right text-gray-300">{technicalPlan.tech_stack_details.database.cache}</span>
                        </div>
                      )}
                    </div>
                    {technicalPlan.tech_stack_details.database.rationale && (
                      <p className="mt-3 text-sm italic text-gray-500">{technicalPlan.tech_stack_details.database.rationale}</p>
                    )}
                  </div>
                )}

                {technicalPlan.tech_stack_details.deployment && (
                  <div className="rounded-lg bg-gray-900 p-4">
                    <h4 className="mb-3 font-medium text-purple-300">Deployment</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Hosting</span>
                        <span className="text-right text-gray-300">{technicalPlan.tech_stack_details.deployment.hosting || '—'}</span>
                      </div>
                      {technicalPlan.tech_stack_details.deployment.infrastructure && (
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-500">Infrastructure</span>
                          <span className="text-right text-gray-300">{technicalPlan.tech_stack_details.deployment.infrastructure}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {technicalPlan?.architecture_recommendations && (
            <div className="bg-gray-800 rounded-lg border border-purple-700">
              <div className="border-b border-purple-700 bg-purple-900/20 px-6 py-4">
                <h3 className="flex items-center gap-2 font-semibold text-purple-400">
                  <span role="img" aria-label="building">🏗️</span> Architecture
                </h3>
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <p className="mb-1 text-sm text-gray-500">Pattern</p>
                  <p className="font-medium text-gray-300">{technicalPlan.architecture_recommendations.pattern || '—'}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-500">Rationale</p>
                  <p className="text-gray-300">{technicalPlan.architecture_recommendations.rationale || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {technicalPlan?.full_technical_breakdown?.key_components?.length > 0 && (
            <div className="bg-gray-800 rounded-lg border border-purple-700">
              <div className="border-b border-purple-700 bg-purple-900/20 px-6 py-4">
                <h3 className="flex items-center gap-2 font-semibold text-purple-400">
                  <span role="img" aria-label="puzzle">🧩</span> Key Components
                </h3>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {technicalPlan.full_technical_breakdown.key_components.map((component, index) => (
                    <span key={index} className="rounded-lg bg-purple-500/20 px-3 py-2 text-sm text-purple-300">
                      {component}
                    </span>
                  ))}
                </div>
                {technicalPlan.full_technical_breakdown.description && (
                  <p className="mt-4 text-sm text-gray-400">{technicalPlan.full_technical_breakdown.description}</p>
                )}
              </div>
            </div>
          )}

          {technicalPlan?.timeline_week_ranges?.phases?.length > 0 && (
            <div className="bg-gray-800 rounded-lg border border-purple-700">
              <div className="flex items-center justify-between border-b border-purple-700 bg-purple-900/20 px-6 py-4">
                <h3 className="flex items-center gap-2 font-semibold text-purple-400">
                  <span role="img" aria-label="calendar">📅</span> Project Timeline
                </h3>
                <span className="text-sm text-purple-300">Total: {technicalPlan.timeline_week_ranges.total_weeks || '—'}</span>
              </div>
              <div className="space-y-4 p-6">
                {technicalPlan.timeline_week_ranges.phases.map((phase) => (
                  <div key={phase.phase} className="rounded-lg bg-gray-900 p-4">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <span className="text-sm text-purple-400">Phase {phase.phase}</span>
                        <h4 className="font-medium text-gray-200">{phase.name}</h4>
                      </div>
                      <span className="text-sm text-gray-400">{phase.duration}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(phase.deliverables || []).map((deliverable, index) => (
                        <span key={index} className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-400">
                          {deliverable}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {technicalPlan?.cost_estimates && (
            <div className="bg-gray-800 rounded-lg border border-purple-700">
              <div className="border-b border-purple-700 bg-purple-900/20 px-6 py-4">
                <h3 className="flex items-center gap-2 font-semibold text-purple-400">
                  <span role="img" aria-label="money bag">💰</span> Cost Estimates
                </h3>
              </div>
              <div className="p-6">
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-gray-900 p-4 text-center">
                    <p className="mb-1 text-sm text-gray-500">Development</p>
                    <p className="text-2xl font-bold text-green-400">{technicalPlan.cost_estimates.development?.subtotal_range || '—'}</p>
                    <p className="mt-1 text-xs text-gray-500">{technicalPlan.cost_estimates.development?.hours || '—'} hrs @ {technicalPlan.cost_estimates.development?.rate_range || '—'}/hr</p>
                  </div>
                  <div className="rounded-lg bg-gray-900 p-4 text-center">
                    <p className="mb-1 text-sm text-gray-500">Infrastructure (Monthly)</p>
                    <p className="text-2xl font-bold text-blue-400">{technicalPlan.cost_estimates.infrastructure_monthly || '—'}</p>
                  </div>
                  <div className="rounded-lg bg-gray-900 p-4 text-center">
                    <p className="mb-1 text-sm text-gray-500">Total Estimate</p>
                    <p className="text-2xl font-bold text-purple-400">{technicalPlan.cost_estimates.total_estimate_range || '—'}</p>
                  </div>
                </div>

                {technicalPlan.cost_estimates.third_party_services?.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-sm text-gray-500">Third Party Services</p>
                    <div className="space-y-2">
                      {technicalPlan.cost_estimates.third_party_services.map((service, index) => (
                        <div key={index} className="flex justify-between gap-4 rounded bg-gray-900 px-3 py-2">
                          <span className="text-gray-400">{service.service}</span>
                          <span className="text-gray-300">{service.cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {technicalPlan.cost_estimates.assumptions?.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm text-gray-500">Assumptions</p>
                    <ul className="space-y-1 text-sm text-gray-400">
                      {technicalPlan.cost_estimates.assumptions.map((assumption, index) => (
                        <li key={index}>• {assumption}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {technicalPlan?.risk_assessment?.length > 0 && (
            <div className="bg-gray-800 rounded-lg border border-purple-700">
              <div className="border-b border-purple-700 bg-purple-900/20 px-6 py-4">
                <h3 className="flex items-center gap-2 font-semibold text-purple-400">
                  <span role="img" aria-label="lightning">⚡</span> Risk Assessment
                </h3>
              </div>
              <div className="space-y-4 p-6">
                {technicalPlan.risk_assessment.map((risk, index) => (
                  <div key={index} className="rounded-lg bg-gray-900 p-4">
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <p className="font-medium text-gray-200">{risk.risk}</p>
                      <span className={`rounded px-2 py-1 text-xs font-medium ${risk.impact === 'high' ? 'bg-red-500/20 text-red-400' : risk.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                        {risk.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-400"><span className="text-gray-500">Mitigation:</span> {risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {technicalPlan?.recommendations && (
            <div className="bg-gray-800 rounded-lg border border-purple-700">
              <div className="border-b border-purple-700 bg-purple-900/20 px-6 py-4">
                <h3 className="flex items-center gap-2 font-semibold text-purple-400">
                  <span role="img" aria-label="light bulb">💡</span> Recommendations
                </h3>
              </div>
              <div className="space-y-4 p-6">
                {technicalPlan.recommendations.team_composition && (
                  <div>
                    <p className="mb-1 text-sm text-gray-500">Team Composition</p>
                    <p className="text-gray-300">{technicalPlan.recommendations.team_composition}</p>
                  </div>
                )}

                {technicalPlan.recommendations.prioritization?.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm text-gray-500">Prioritization</p>
                    <ul className="space-y-1">
                      {technicalPlan.recommendations.prioritization.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-300">
                          <span className="text-purple-400">{index + 1}.</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {technicalPlan.recommendations.architectural_decisions?.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm text-gray-500">Architectural Decisions</p>
                    <ul className="space-y-1">
                      {technicalPlan.recommendations.architectural_decisions.map((decision, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="mt-0.5 text-purple-400">•</span>
                          <span>{decision}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <button
              type="button"
              onClick={() => setShowRawTechnical((current) => !current)}
              className="flex w-full items-center justify-between px-6 py-4 text-gray-400 transition hover:text-white"
            >
              <span className="font-semibold">View Raw JSON</span>
              <span>{showRawTechnical ? '▲' : '▼'}</span>
            </button>
            {showRawTechnical && (
              <div className="px-6 pb-6">
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-gray-900 p-4 text-sm text-gray-300">{JSON.stringify(technicalPlan || {}, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanDetail;
