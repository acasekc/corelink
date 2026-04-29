import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Copy, RefreshCw, Ban, Trash2, ExternalLink, Eye } from "lucide-react";

const formatDate = (s) => (s ? new Date(s).toLocaleString() : "—");

const STATUS_STYLES = {
  pending: "bg-slate-500/20 text-slate-300",
  opened: "bg-blue-500/20 text-blue-300",
  submitted: "bg-emerald-500/20 text-emerald-300",
  expired: "bg-yellow-500/20 text-yellow-300",
  revoked: "bg-red-500/20 text-red-300",
};

export default function IntakeInvites() {
  const [invites, setInvites] = useState({ data: [] });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [invitesRes, statsRes] = await Promise.all([
        fetch("/api/admin/intake/invites", { headers: { Accept: "application/json" }, credentials: "same-origin" }),
        fetch("/api/admin/intake/dashboard", { headers: { Accept: "application/json" }, credentials: "same-origin" }),
      ]);
      setInvites(await invitesRes.json());
      const statsBody = await statsRes.json();
      setStats(statsBody.data);
    } catch (e) {
      setError("Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const csrf = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
  };

  const resend = async (invite) => {
    if (!invite.prospect_email && !confirm("No email on file. Enter one to resend?")) return;
    const email = invite.prospect_email || prompt("Send invite to which email?");
    if (!email) return;
    await fetch(`/api/admin/intake/invites/${invite.id}/resend`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrf(), Accept: "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email }),
    });
    alert("Invite email sent.");
  };

  const revoke = async (invite) => {
    if (!confirm("Revoke this invite? The link will stop working.")) return;
    await fetch(`/api/admin/intake/invites/${invite.id}/revoke`, {
      method: "POST",
      headers: { "X-CSRF-TOKEN": csrf(), Accept: "application/json" },
      credentials: "same-origin",
    });
    load();
  };

  const remove = async (invite) => {
    if (!confirm("Delete this invite? This cannot be undone.")) return;
    await fetch(`/api/admin/intake/invites/${invite.id}`, {
      method: "DELETE",
      headers: { "X-CSRF-TOKEN": csrf(), Accept: "application/json" },
      credentials: "same-origin",
    });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Client Intake</h1>
          <p className="text-slate-400 text-sm mt-1">
            Generate tracked intake links for prospects. Each link is single-use and tied to one submission.
          </p>
        </div>
        <Link
          to="/admin/intake/invites/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Create invite
        </Link>
      </div>

      {stats && <Stats stats={stats} />}

      {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Prospect</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sent</th>
              <th className="px-4 py-3">Opened</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Step</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
            ) : invites.data.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No invites yet.</td></tr>
            ) : (
              invites.data.map((invite) => (
                <tr key={invite.id} className="hover:bg-slate-800/30 text-sm">
                  <td className="px-4 py-3">
                    <div className="font-medium">{invite.business_name || invite.prospect_name || "—"}</div>
                    <div className="text-xs text-slate-400">{invite.prospect_email || "no email"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={"px-2 py-0.5 rounded text-xs font-medium " + (STATUS_STYLES[invite.status] || "bg-slate-700 text-slate-300")}>
                      {invite.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(invite.created_at)}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(invite.opened_at)}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(invite.submitted_at)}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{invite.last_step !== null ? `Step ${invite.last_step + 1}` : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => copyLink(invite.public_url)} title="Copy link" className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700">
                        <Copy className="w-4 h-4" />
                      </button>
                      {invite.submission_id ? (
                        <Link to={`/admin/intake/submissions/${invite.submission_id}`} title="View submission" className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700">
                          <Eye className="w-4 h-4" />
                        </Link>
                      ) : (
                        <>
                          <button onClick={() => resend(invite)} title="Resend email" className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button onClick={() => revoke(invite)} title="Revoke" className="p-1.5 rounded text-slate-400 hover:text-yellow-400 hover:bg-slate-700">
                            <Ban className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <a href={invite.public_url} target="_blank" rel="noreferrer" title="Open public form" className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button onClick={() => remove(invite)} title="Delete" className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-700">
                        <Trash2 className="w-4 h-4" />
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
}

function Stats({ stats }) {
  const cards = [
    { label: "Total invites", value: stats.invites_total },
    { label: "Pending", value: stats.invites_pending },
    { label: "Opened", value: stats.invites_opened },
    { label: "Submitted", value: stats.invites_submitted },
    { label: "Open rate", value: stats.open_rate + "%" },
    { label: "Completion rate", value: stats.completion_rate + "%" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-slate-800/40 border border-slate-700 rounded-lg p-3">
          <div className="text-xs text-slate-400">{card.label}</div>
          <div className="text-xl font-semibold mt-1">{card.value}</div>
        </div>
      ))}
    </div>
  );
}
