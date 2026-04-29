import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Copy } from "lucide-react";

export default function CreateIntakeInvite() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    prospect_name: "",
    prospect_email: "",
    business_name: "",
    expires_days: 30,
    send_email: false,
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [created, setCreated] = useState(null);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

    try {
      const res = await fetch("/api/admin/intake/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrf,
          Accept: "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          ...form,
          expires_days: form.expires_days ? Number(form.expires_days) : null,
        }),
      });

      if (res.status === 422) {
        const body = await res.json();
        setErrors(body.errors || {});
      } else if (res.ok) {
        const body = await res.json();
        setCreated(body);
      }
    } finally {
      setProcessing(false);
    }
  };

  const copyLink = () => {
    if (created?.url) {
      navigator.clipboard.writeText(created.url);
    }
  };

  if (created) {
    return (
      <div className="max-w-xl space-y-4">
        <Link to="/admin/intake" className="text-sm text-slate-400 hover:text-white inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to invites
        </Link>
        <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-emerald-200 mb-1">Invite created</h2>
          <p className="text-sm text-slate-300 mb-4">Send the link below to your prospect. Once they submit, the link stops working.</p>
          <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-3 border border-slate-700">
            <code className="flex-1 text-sm text-blue-300 break-all">{created.url}</code>
            <button onClick={copyLink} className="p-2 rounded text-slate-400 hover:text-white hover:bg-slate-800">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/admin/intake")}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
          >
            Done
          </button>
          <button
            onClick={() => {
              setCreated(null);
              setForm({ prospect_name: "", prospect_email: "", business_name: "", expires_days: 30, send_email: false });
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm"
          >
            Create another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <Link to="/admin/intake" className="text-sm text-slate-400 hover:text-white inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to invites
      </Link>
      <h1 className="text-2xl font-bold mb-6">Create intake invite</h1>

      <form onSubmit={submit} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
        <Input
          label="Business / organization name"
          name="business_name"
          value={form.business_name}
          onChange={change}
          error={errors.business_name?.[0]}
          placeholder="Acme Co."
        />
        <Input
          label="Prospect name"
          name="prospect_name"
          value={form.prospect_name}
          onChange={change}
          error={errors.prospect_name?.[0]}
        />
        <Input
          label="Prospect email"
          name="prospect_email"
          type="email"
          value={form.prospect_email}
          onChange={change}
          error={errors.prospect_email?.[0]}
          help="Optional — pre-fills the form and enables 'send email now'."
        />

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1.5">Expires in</label>
          <select
            name="expires_days"
            value={form.expires_days || ""}
            onChange={change}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">Never</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="60">60 days</option>
            <option value="90">90 days</option>
          </select>
        </div>

        {form.prospect_email && (
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              name="send_email"
              checked={form.send_email}
              onChange={change}
              className="w-4 h-4 rounded bg-slate-900 border-slate-600"
            />
            Send invite email now
          </label>
        )}

        <button
          type="submit"
          disabled={processing}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm"
        >
          {processing ? "Creating…" : "Create invite"}
        </button>
      </form>
    </div>
  );
}

function Input({ label, name, type = "text", value, onChange, error, help, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-200 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || ""}
        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
      />
      {help && <p className="text-xs text-slate-500 mt-1">{help}</p>}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
