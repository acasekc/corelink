import React from "react";
import { CheckCircle2 } from "lucide-react";
import SeoHead from "@/components/SeoHead";

export default function IntakeSubmitted({ meta }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <SeoHead meta={meta} />
      <div className="max-w-md text-center bg-slate-900 border border-slate-800 rounded-xl p-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Thanks — we got it</h1>
        <p className="text-slate-400 text-sm mb-6">
          Your intake is in our queue. A team member will review your answers and reach out within
          1–2 business days to schedule a scoping call.
        </p>
        <p className="text-xs text-slate-500">
          If anything's changed, just reply to the confirmation email we sent you.
        </p>
      </div>
    </div>
  );
}

IntakeSubmitted.layout = (page) => <div className="bg-slate-950 min-h-screen">{page}</div>;
