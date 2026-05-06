import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Save, Send, CheckCircle2, AlertCircle } from "lucide-react";
import SeoHead from "@/components/SeoHead";

/**
 * Multi-step client intake form.
 *
 *  - props.invite.code is the URL token; all submissions hit /intake/{code}.
 *  - props.prefill seeds business/contact/email if the admin entered them on invite create.
 *  - props.draft is whatever was last autosaved on the server.
 *  - props.options is the option lists keyed by select group (goals, features, etc).
 */
export default function IntakeForm({ meta, invite, prefill, draft, options }) {
  const initialFromLocal = useMemo(() => readLocalDraft(invite.code), [invite.code]);

  const [data, setData] = useState(() => ({
    ...emptyForm(),
    ...(prefill || {}),
    ...(draft || {}),
    ...(initialFromLocal?.data || {}),
  }));
  const [step, setStep] = useState(initialFromLocal?.step ?? 0);
  const [files, setFiles] = useState({ logo: null, brand_guidelines: null });
  const [errors, setErrors] = useState({});
  const [savedAt, setSavedAt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const draftTimer = useRef(null);

  const STEPS = useMemo(() => buildSteps(options), [options]);
  const currentStep = STEPS[step];
  const isReview = step === STEPS.length - 1;
  const totalSteps = STEPS.length;

  // Autosave — debounce on data change.
  useEffect(() => {
    if (draftTimer.current) {
      clearTimeout(draftTimer.current);
    }
    draftTimer.current = setTimeout(() => {
      writeLocalDraft(invite.code, { data, step });
      saveDraftToServer(invite.code, data, step).then((res) => {
        if (res?.saved_at) setSavedAt(res.saved_at);
      });
    }, 1500);
    return () => clearTimeout(draftTimer.current);
  }, [data, step, invite.code]);

  const update = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (submitError) {
      setSubmitError(null);
    }
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const toggleMulti = (key, value) => {
    if (submitError) {
      setSubmitError(null);
    }
    setData((prev) => {
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  };

  const setFile = (key, file) => {
    if (submitError) {
      setSubmitError(null);
    }
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const focusField = (fieldKey) => {
    if (!fieldKey) {
      return;
    }

    window.setTimeout(() => {
      const container = document.querySelector(`[data-field-key="${fieldKey}"]`);
      if (!container) {
        return;
      }

      container.scrollIntoView({ behavior: "smooth", block: "center" });

      const target = container.querySelector("input, textarea, select, button");
      if (target instanceof HTMLElement) {
        target.focus();
      }
    }, 0);
  };

  const collectStepErrors = (stepConfig) => {
    const stepErrors = {};
    (stepConfig.fields || []).forEach((field) => {
      if (!field.required) return;
      if (field.requiresValue && !field.requiresValue(data)) return;

      const value = data[field.key];
      const isEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        stepErrors[field.key] = "This field is required.";
      }
    });

    return stepErrors;
  };

  const validateStep = () => {
    const stepErrors = collectStepErrors(currentStep);

    setErrors(stepErrors);

    const firstField = Object.keys(stepErrors)[0];
    if (firstField) {
      focusField(firstField);
    }

    return Object.keys(stepErrors).length === 0;
  };

  const findFirstInvalidStep = () => {
    for (let index = 0; index < STEPS.length - 1; index += 1) {
      const stepErrors = collectStepErrors(STEPS[index]);
      const firstField = Object.keys(stepErrors)[0];

      if (firstField) {
        return {
          stepIndex: index,
          fieldKey: firstField,
          errors: stepErrors,
        };
      }
    }

    return null;
  };

  const goNext = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setErrors({});

    const clientError = findFirstInvalidStep();
    if (clientError) {
      setErrors(clientError.errors);
      setStep(clientError.stepIndex);
      setSubmitError(`Step ${clientError.stepIndex + 1}: please complete the highlighted field.`);
      focusField(clientError.fieldKey);
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(`${key}[]`, v));
      } else if (value !== null && value !== undefined && value !== "") {
        formData.append(key, value);
      }
    });
    if (files.logo) formData.append("logo", files.logo);
    if (files.brand_guidelines && data.has_brand_guidelines === "yes") {
      formData.append("brand_guidelines", files.brand_guidelines);
    }
    formData.append("website", ""); // honeypot

    const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

    try {
      const res = await fetch(`/intake/${invite.code}`, {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": csrf,
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json",
        },
        credentials: "same-origin",
        body: formData,
      });

      if (res.redirected) {
        clearLocalDraft(invite.code);
        window.location.href = res.url;
        return;
      }

      if (res.status === 422) {
        const body = await res.json();
        const normalizedErrors = normalizeErrors(body.errors || {});
        const errorLocation = body.first_error?.field
          ? {
              stepIndex: body.first_error.step_index,
              fieldKey: body.first_error.field,
            }
          : findFirstErrorLocation(normalizedErrors, STEPS, data);

        setErrors(normalizedErrors);
        setSubmitError(body.message || "Please correct the highlighted fields and try again.");

        if (errorLocation) {
          setStep(errorLocation.stepIndex);
          focusField(errorLocation.fieldKey);
        }
      } else if (res.ok) {
        const body = await readJsonBody(res);
        clearLocalDraft(invite.code);
        window.location.href = body?.redirect || `/intake/${invite.code}/submitted`;
      } else {
        setSubmitError(await buildSubmitErrorMessage(res));
      }
    } catch (e) {
      setSubmitError("Network error — your data is saved, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <SeoHead meta={meta} />
      <div className="max-w-3xl mx-auto">
        <Header step={step} totalSteps={totalSteps} title={currentStep.title} subtitle={currentStep.subtitle} savedAt={savedAt} />

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 md:p-8">
          {isReview ? (
            <Review data={data} options={options} files={files} steps={STEPS.slice(0, -1)} />
          ) : (
            <StepFields step={currentStep} data={data} errors={errors} options={options} files={files} update={update} toggleMulti={toggleMulti} setFile={setFile} />
          )}

          {submitError && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {isReview ? (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 disabled:opacity-50"
              >
                {submitting ? "Submitting…" : (<><Send className="w-4 h-4" /> Submit intake</>)}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-1 px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400"
              >
                {step === STEPS.length - 2 ? "Review" : "Next"} <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Your progress is saved automatically. You can close this page and come back to your link any time.
        </p>
      </div>
    </div>
  );
}

// Inertia layout override — public chrome would compete with the focused form UI.
IntakeForm.layout = (page) => <div className="bg-slate-950 min-h-screen">{page}</div>;

function Header({ step, totalSteps, title, subtitle, savedAt }) {
  const pct = Math.round(((step + 1) / totalSteps) * 100);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-slate-400">
          Step {step + 1} of {totalSteps}
        </span>
        {savedAt && (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Save className="w-3 h-3" /> Saved {new Date(savedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
      {subtitle && <p className="text-slate-400 mt-1 text-sm">{subtitle}</p>}
    </div>
  );
}

function StepFields({ step, data, errors, options, files, update, toggleMulti, setFile }) {
  return (
    <div className="space-y-5">
      {(step.fields || []).map((field) => {
        if (field.requiresValue && !field.requiresValue(data)) return null;
        return (
          <Field
            key={field.key}
            field={field}
            value={data[field.key]}
            error={errors[field.key]}
            options={options}
            file={files[field.key]}
            update={update}
            toggleMulti={toggleMulti}
            setFile={setFile}
          />
        );
      })}
    </div>
  );
}

function Field({ field, value, error, options, file, update, toggleMulti, setFile }) {
  const labelEl = (
    <label className="block text-sm font-medium text-slate-200 mb-1.5">
      {field.label}
      {field.required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );

  const help = field.help && <p className="text-xs text-slate-500 mt-1">{field.help}</p>;
  const errEl = error && <p className="text-xs text-red-400 mt-1">{error}</p>;

  const baseInput =
    "w-full px-3.5 py-2.5 rounded-lg bg-slate-800/70 border focus:outline-none text-white placeholder-slate-500 " +
    (error
      ? "border-red-500/80 focus:border-red-400"
      : "border-slate-700 focus:border-blue-500");
  const groupClassName = error ? "rounded-lg border border-red-500/50 bg-red-500/5 p-3" : "";

  switch (field.type) {
    case "text":
    case "email":
    case "url":
    case "tel":
    case "date":
      return (
        <div data-field-key={field.key} className="scroll-mt-24">
          {labelEl}
          <input
            type={field.type}
            name={field.key}
            aria-invalid={Boolean(error)}
            value={value || ""}
            onChange={(e) => update(field.key, e.target.value)}
            placeholder={field.placeholder || ""}
            className={baseInput}
          />
          {help}
          {errEl}
        </div>
      );

    case "textarea":
      return (
        <div data-field-key={field.key} className="scroll-mt-24">
          {labelEl}
          <textarea
            name={field.key}
            aria-invalid={Boolean(error)}
            value={value || ""}
            onChange={(e) => update(field.key, e.target.value)}
            placeholder={field.placeholder || ""}
            rows={field.rows || 4}
            className={baseInput}
          />
          {help}
          {errEl}
        </div>
      );

    case "select": {
      const opts = options[field.optionGroup] || {};
      return (
        <div data-field-key={field.key} className="scroll-mt-24">
          {labelEl}
          <select
            name={field.key}
            aria-invalid={Boolean(error)}
            value={value || ""}
            onChange={(e) => update(field.key, e.target.value)}
            className={baseInput}
          >
            <option value="">Select…</option>
            {Object.entries(opts).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {help}
          {errEl}
        </div>
      );
    }

    case "radio": {
      const opts = options[field.optionGroup] || {};
      return (
        <div data-field-key={field.key} className="scroll-mt-24">
          {labelEl}
          <div className={groupClassName}>
            <div className="flex flex-wrap gap-2">
            {Object.entries(opts).map(([key, label]) => (
              <button
                type="button"
                key={key}
                onClick={() => update(field.key, key)}
                aria-invalid={Boolean(error)}
                className={
                  "px-4 py-2 rounded-lg text-sm border transition " +
                  (value === key
                    ? "bg-blue-500/20 border-blue-500 text-white"
                    : "bg-slate-800/40 border-slate-700 text-slate-300 hover:border-slate-500")
                }
              >
                {label}
              </button>
            ))}
            </div>
          </div>
          {help}
          {errEl}
        </div>
      );
    }

    case "multi": {
      const opts = options[field.optionGroup] || {};
      const current = Array.isArray(value) ? value : [];
      return (
        <div data-field-key={field.key} className="scroll-mt-24">
          {labelEl}
          <div className={groupClassName}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(opts).map(([key, label]) => {
                const active = current.includes(key);
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => toggleMulti(field.key, key)}
                    aria-invalid={Boolean(error)}
                    className={
                      "px-3.5 py-2.5 rounded-lg text-sm border text-left flex items-center gap-2 transition " +
                      (active
                        ? "bg-blue-500/20 border-blue-500 text-white"
                        : "bg-slate-800/40 border-slate-700 text-slate-300 hover:border-slate-500")
                    }
                  >
                    <span
                      className={
                        "w-4 h-4 rounded border flex items-center justify-center shrink-0 " +
                        (active ? "bg-blue-500 border-blue-500" : "border-slate-500")
                      }
                    >
                      {active && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          {help}
          {errEl}
        </div>
      );
    }

    case "file":
      return (
        <div data-field-key={field.key} className="scroll-mt-24">
          {labelEl}
          <div className={groupClassName}>
            <input
              type="file"
              name={field.key}
              aria-invalid={Boolean(error)}
              accept={field.accept || ""}
              onChange={(e) => setFile(field.key, e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-500"
            />
          </div>
          {file && <p className="text-xs text-slate-400 mt-1">Selected: {file.name}</p>}
          {help}
          {errEl}
        </div>
      );

    default:
      return null;
  }
}

function Review({ data, options, files, steps }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Review your answers</h2>
        <p className="text-sm text-slate-400">Take a moment to double-check before submitting. You can go back to fix anything.</p>
      </div>

      {steps.map((step, idx) => (
        <div key={idx} className="border border-slate-800 rounded-lg overflow-hidden">
          <div className="bg-slate-800/50 px-4 py-2 text-sm font-semibold text-slate-200">
            {step.title}
          </div>
          <dl className="p-4 space-y-2">
            {(step.fields || []).map((field) => {
              if (field.requiresValue && !field.requiresValue(data)) return null;
              const rendered = renderValue(field, data[field.key], options, files);
              if (!rendered) return null;
              return (
                <div key={field.key} className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-sm">
                  <dt className="text-slate-400">{field.label}</dt>
                  <dd className="sm:col-span-2 text-slate-100 break-words">{rendered}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      ))}
    </div>
  );
}

function renderValue(field, value, options, files) {
  if (field.type === "file") {
    return files[field.key]?.name || null;
  }
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    const labels = options[field.optionGroup] || {};
    return value.map((v) => labels[v] || v).join(", ");
  }
  if (field.type === "select" || field.type === "radio") {
    const labels = options[field.optionGroup] || {};
    return labels[value] || value;
  }
  return String(value);
}

function emptyForm() {
  return {
    business_name: "",
    industry: "",
    contact_name: "",
    email: "",
    phone: "",
    website_url: "",
    referral_source: "",
    goals: [],
    business_description: "",
    target_audience: "",
    competitors: "",
    estimated_pages: "",
    features: [],
    features_other: "",
    integrations: "",
    needs_cms: "",
    has_brand_guidelines: "",
    content_responsibility: "",
    media_responsibility: "",
    admired_websites: "",
    avoid_styles: "",
    aesthetic_direction: "",
    domain_name: "",
    hosting_provider: "",
    platform_preference: "",
    compliance_requirements: "",
    expected_traffic: "",
    seo_priority: "",
    launch_date: "",
    deadline_event: "",
    budget_range: "",
    primary_contact: "",
    approval_authority: "",
    stakeholder_count: "",
    maintenance_interest: "",
    training_needed: "",
    future_features: "",
    additional_notes: "",
  };
}

function buildSteps(_options) {
  return [
    {
      title: "About your business",
      subtitle: "The basics so we know who we're talking to.",
      fields: [
        { key: "business_name", label: "Business / organization name", type: "text", required: true },
        { key: "industry", label: "Industry / niche", type: "text", required: true },
        { key: "contact_name", label: "Primary contact name", type: "text", required: true },
        { key: "email", label: "Email", type: "email", required: true },
        { key: "phone", label: "Phone", type: "tel" },
        { key: "website_url", label: "Existing website URL", type: "text", placeholder: "example.com", help: "Domain only is fine — we'll add https:// for you." },
        { key: "referral_source", label: "How did you hear about us?", type: "text" },
      ],
    },
    {
      title: "Project overview",
      subtitle: "Tell us what you're trying to accomplish.",
      fields: [
        {
          key: "goals",
          label: "Top goals for this website (pick all that apply)",
          type: "multi",
          optionGroup: "goals",
          required: true,
        },
        {
          key: "business_description",
          label: "Describe your business in 2–3 sentences",
          type: "textarea",
          required: true,
        },
        { key: "target_audience", label: "Who is your target audience?", type: "textarea", required: true },
        {
          key: "competitors",
          label: "Main competitors (URLs if possible)",
          type: "textarea",
          rows: 3,
        },
      ],
    },
    {
      title: "Scope & features",
      subtitle: "What does your site actually need to do?",
      fields: [
        {
          key: "estimated_pages",
          label: "Estimated number of pages or sections",
          type: "select",
          optionGroup: "pages",
          required: true,
        },
        { key: "features", label: "Required features", type: "multi", optionGroup: "features", required: true },
        {
          key: "features_other",
          label: "Other features (describe)",
          type: "text",
          requiresValue: (data) => Array.isArray(data.features) && data.features.includes("other"),
          required: true,
        },
        { key: "integrations", label: "Third-party integrations needed", type: "textarea", help: "CRM, POS, email marketing, accounting, etc." },
        {
          key: "needs_cms",
          label: "Do you need a CMS so you can make your own updates?",
          type: "radio",
          optionGroup: "cms",
          required: true,
        },
      ],
    },
    {
      title: "Content & branding",
      subtitle: "What's already in place vs. what we'd help with.",
      fields: [
        {
          key: "logo",
          label: "Existing logo",
          type: "file",
          accept: ".png,.svg,.jpg,.jpeg,.pdf",
          help: "PNG, SVG, JPG or PDF. Optional.",
        },
        {
          key: "has_brand_guidelines",
          label: "Do you have established brand guidelines?",
          type: "radio",
          optionGroup: "has_brand",
          required: true,
        },
        {
          key: "brand_guidelines",
          label: "Brand guidelines upload",
          type: "file",
          accept: ".png,.svg,.jpg,.jpeg,.pdf",
          requiresValue: (data) => data.has_brand_guidelines === "yes",
        },
        {
          key: "content_responsibility",
          label: "Will you provide written content, or do you need copywriting?",
          type: "radio",
          optionGroup: "content_responsibility",
          required: true,
        },
        {
          key: "media_responsibility",
          label: "Will you provide photos / videos, or do you need sourcing help?",
          type: "radio",
          optionGroup: "media_responsibility",
          required: true,
        },
      ],
    },
    {
      title: "Design direction",
      subtitle: "Optional but helpful — tell us what you like.",
      fields: [
        {
          key: "admired_websites",
          label: "List 2–3 websites you admire and what you like about them",
          type: "textarea",
        },
        { key: "avoid_styles", label: "Any design styles or elements you want to avoid?", type: "textarea" },
        { key: "aesthetic_direction", label: "Specific colors, moods, or aesthetic directions", type: "textarea" },
      ],
    },
    {
      title: "Technical details",
      subtitle: "Setup and constraints we should know about.",
      fields: [
        { key: "domain_name", label: "Do you own a domain name? If so, what is it?", type: "text", required: true },
        { key: "hosting_provider", label: "Current hosting provider (if any)", type: "text" },
        { key: "platform_preference", label: "Platform preference", type: "select", optionGroup: "platform" },
        {
          key: "compliance_requirements",
          label: "Accessibility or compliance requirements",
          type: "textarea",
          help: "ADA, HIPAA, etc.",
        },
        { key: "expected_traffic", label: "Expected monthly traffic volume (if known)", type: "text" },
        { key: "seo_priority", label: "SEO priority level", type: "select", optionGroup: "seo" },
      ],
    },
    {
      title: "Timeline & budget",
      fields: [
        { key: "launch_date", label: "Desired launch date", type: "date" },
        { key: "deadline_event", label: "Tied to a specific event or deadline?", type: "text" },
        { key: "budget_range", label: "Budget range", type: "select", optionGroup: "budget", required: true },
      ],
    },
    {
      title: "Process & decision-making",
      fields: [
        { key: "primary_contact", label: "Primary point of contact for this project", type: "text", required: true },
        { key: "approval_authority", label: "Final approval authority on design and content", type: "text" },
        { key: "stakeholder_count", label: "Number of stakeholders involved in reviews", type: "text" },
      ],
    },
    {
      title: "Ongoing needs",
      fields: [
        { key: "maintenance_interest", label: "Interested in ongoing maintenance and support?", type: "radio", optionGroup: "maintenance" },
        { key: "training_needed", label: "Need training on how to update the site?", type: "radio", optionGroup: "training" },
        { key: "future_features", label: "Future features or phases you're already planning", type: "textarea" },
      ],
    },
    {
      title: "Anything else",
      fields: [
        { key: "additional_notes", label: "Additional notes, context, or questions", type: "textarea", rows: 5 },
      ],
    },
    { title: "Review & submit", subtitle: "One last look before we send this off.", fields: [] },
  ];
}

function normalizeErrors(rawErrors) {
  return Object.entries(rawErrors || {}).reduce((normalized, [field, message]) => {
    const key = field.split(".")[0];
    if (normalized[key]) {
      return normalized;
    }

    normalized[key] = Array.isArray(message) ? message[0] : message;
    return normalized;
  }, {});
}

function findFirstErrorLocation(errors, steps, data) {
  for (let stepIndex = 0; stepIndex < steps.length; stepIndex += 1) {
    const fieldKey = (steps[stepIndex].fields || []).find((field) => {
      if (field.requiresValue && !field.requiresValue(data)) {
        return false;
      }

      return Boolean(errors[field.key]);
    })?.key;

    if (fieldKey) {
      return { stepIndex, fieldKey };
    }
  }

  const fallbackField = Object.keys(errors)[0];
  if (!fallbackField) {
    return null;
  }

  return {
    stepIndex: 0,
    fieldKey: fallbackField,
  };
}

async function readJsonBody(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function buildSubmitErrorMessage(response) {
  const body = await readJsonBody(response);

  if (body?.message) {
    return body.message;
  }

  if (response.status === 419) {
    return "Your session expired. Refresh the page and try again.";
  }

  if (response.status === 429) {
    return "Too many submit attempts. Please wait a few minutes and try again.";
  }

  if (response.status === 413) {
    return "One of your files is too large. Upload files under 10 MB and try again.";
  }

  return "We could not submit your intake right now. Your draft is still saved, so please try again.";
}

// ----- draft persistence helpers -----

function readLocalDraft(code) {
  try {
    const raw = localStorage.getItem(`intake-draft-${code}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeLocalDraft(code, payload) {
  try {
    localStorage.setItem(`intake-draft-${code}`, JSON.stringify(payload));
  } catch {
    // quota; ignore
  }
}

function clearLocalDraft(code) {
  try {
    localStorage.removeItem(`intake-draft-${code}`);
  } catch {
    // ignore
  }
}

async function saveDraftToServer(code, data, lastStep) {
  const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
  try {
    const res = await fetch(`/intake/${code}/draft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrf,
        Accept: "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({ data, last_step: lastStep }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
