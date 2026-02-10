import React, { useState } from "react";
import { Ticket, ArrowLeft, Loader2, Mail } from "lucide-react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [processing, setProcessing] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError("");

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            || document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];

        try {
            const res = await fetch("/helpdesk/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ''),
                    "Accept": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.errors?.email || data.message || "Something went wrong.");
                setProcessing(false);
            } else {
                setSent(true);
                setProcessing(false);
            }
        } catch {
            setError("Network error. Please try again.");
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                            <Ticket className="w-8 h-8 text-purple-400" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Forgot Password</h1>
                    <p className="text-slate-400 mt-2">
                        Enter your email and we'll send you a reset link
                    </p>
                </div>

                {/* Card */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
                    {sent ? (
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-4">
                                <div className="p-3 bg-green-500/20 rounded-full">
                                    <Mail className="w-8 h-8 text-green-400" />
                                </div>
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
                            <p className="text-slate-400 text-sm mb-6">
                                If an account exists with that email, we've sent a password reset link. Please check your inbox and spam folder.
                            </p>
                            <a
                                href="/helpdesk/login"
                                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition text-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to sign in
                            </a>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        autoFocus
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium rounded-lg transition"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-5 h-5" />
                                            Send Reset Link
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!sent && (
                    <div className="mt-6 text-center">
                        <a
                            href="/helpdesk/login"
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-400 transition text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to sign in
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
