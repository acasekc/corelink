import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileDown, Image as ImageIcon, FileText, ExternalLink, Briefcase } from "lucide-react";

const formatDate = (s) => (s ? new Date(s).toLocaleString() : "—");

export default function IntakeSubmissionDetail() {
  const { id } = useParams();
  const [intake, setIntake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/intake/submissions/${id}`, {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      });
      const body = await res.json();
      setIntake(body.data);
    } catch (e) {
      setError("Failed to load submission.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const convert = async () => {
    if (!confirm("Create a new helpdesk project from this intake?")) return;
    setConverting(true);
    const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
    try {
      const res = await fetch(`/api/admin/intake/submissions/${id}/convert`, {
        method: "POST",
        headers: { "X-CSRF-TOKEN": csrf, Accept: "application/json" },
        credentials: "same-origin",
      });
      if (res.ok) load();
      else setError("Conversion failed.");
    } finally {
      setConverting(false);
    }
  };

  if (loading) return <div className="text-slate-400 text-sm">Loading…</div>;
  if (!intake) return <div className="text-slate-400 text-sm">{error || "Not found."}</div>;

  return (
    <div className="space-y-5">
      <div>
        <Link to="/admin/intake" className="text-sm text-slate-400 hover:text-white inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to invites
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{intake.business_name}</h1>
          <p className="text-sm text-slate-400 mt-1">
            Submitted by {intake.email} on {formatDate(intake.submitted_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {intake.has_pdf && (
            <a
              href={`/api/admin/intake/submissions/${intake.id}/pdf`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-slate-700 hover:bg-slate-600"
            >
              <FileDown className="w-4 h-4" /> PDF
            </a>
          )}
          {intake.helpdesk_ticket_number && (
            <a
              href={`/admin/helpdesk/tickets/${intake.helpdesk_ticket_id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-slate-700 hover:bg-slate-600"
            >
              <ExternalLink className="w-4 h-4" /> Ticket {intake.helpdesk_ticket_number}
            </a>
          )}
          {intake.converted_project ? (
            <Link
              to={`/admin/helpdesk/projects/${intake.converted_project.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              <Briefcase className="w-4 h-4" /> View project: {intake.converted_project.name}
            </Link>
          ) : (
            <button
              onClick={convert}
              disabled={converting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50"
            >
              <Briefcase className="w-4 h-4" /> {converting ? "Converting…" : "Convert to project"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          {intake.sections.map((section, idx) => (
            <div key={idx} className="bg-slate-800/40 border border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-800 px-4 py-2 text-sm font-semibold">{section.title}</div>
              <dl className="p-4 space-y-2">
                {section.fields.map((field, fIdx) => (
                  <div key={fIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-sm">
                    <dt className="text-slate-400">{field.label}</dt>
                    <dd className="sm:col-span-2 text-slate-100 break-words">{field.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">Invite</div>
            <div className="text-sm">
              <div><span className="text-slate-400">Code:</span> <code className="text-blue-300">{intake.invite?.code}</code></div>
              <div><span className="text-slate-400">Created:</span> {formatDate(intake.invite?.created_at)}</div>
              <div><span className="text-slate-400">Opened:</span> {formatDate(intake.invite?.opened_at)}</div>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">Attachments</div>
            <div className="space-y-1.5 text-sm">
              {intake.has_logo ? (
                <a
                  href={`/api/admin/intake/submissions/${intake.id}/files/logo`}
                  className="flex items-center gap-2 text-blue-300 hover:text-blue-200"
                >
                  <ImageIcon className="w-4 h-4" /> Logo
                </a>
              ) : (
                <div className="flex items-center gap-2 text-slate-500"><ImageIcon className="w-4 h-4" /> No logo</div>
              )}
              {intake.has_brand_guidelines ? (
                <a
                  href={`/api/admin/intake/submissions/${intake.id}/files/brand-guidelines`}
                  className="flex items-center gap-2 text-blue-300 hover:text-blue-200"
                >
                  <FileText className="w-4 h-4" /> Brand guidelines
                </a>
              ) : (
                <div className="flex items-center gap-2 text-slate-500"><FileText className="w-4 h-4" /> No brand guidelines</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
