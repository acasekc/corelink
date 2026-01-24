import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Image,
  Clock,
  Mail,
  Settings,
  CheckCircle,
  XCircle,
  Zap,
  Loader2,
} from "lucide-react";

export default function ArticleSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [formData, setFormData] = useState({
    is_enabled: false,
    dalle_enabled: false,
    auto_publish_enabled: false,
    auto_publish_hours: 24,
    max_articles_per_day: 3,
    max_articles_per_week: 15,
    admin_notification_email: "",
    openai_model: "gpt-4o",
    dalle_model: "dall-e-3",
    dalle_size: "1792x1024",
    dalle_quality: "standard",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/admin/articles/settings", {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      if (data.settings) {
        setFormData(data.settings);
      }
      if (data.statistics) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSaving(true);

    try {
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");

      const response = await fetch("/admin/articles/settings", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        alert("Failed to save settings");
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");

      const response = await fetch("/admin/articles/settings/test-connection", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ success: false, message: "Connection test failed" });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/articles"
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">Article Settings</h1>
                <p className="text-sm text-slate-400">
                  Configure AI generation settings
                </p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Settings
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Generation Statistics */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Generated Today</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {statistics?.ai_generated_today || 0} /{" "}
                    {formData.max_articles_per_day}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Generated This Week</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {statistics?.ai_generated_this_week || 0} /{" "}
                    {formData.max_articles_per_week}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-1">
                    {statistics?.pending_review || 0}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Total Published</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    {statistics?.published_articles || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Left Column */}
            <div className="space-y-6">
              {/* AI Generation */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold">AI Generation</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable AI Generation</p>
                      <p className="text-sm text-slate-400">
                        Allow generating articles using OpenAI
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_enabled"
                        checked={formData.is_enabled}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      OpenAI Model
                    </label>
                    <select
                      name="openai_model"
                      value={formData.openai_model}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="gpt-4o">GPT-4o (Recommended)</option>
                      <option value="gpt-4o-mini">GPT-4o Mini (Faster)</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    </select>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testing}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg transition-colors"
                    >
                      {testing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      Test Connection
                    </button>
                    {testResult && (
                      <div
                        className={`mt-3 flex items-center gap-2 text-sm ${
                          testResult.success
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {testResult.success ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {testResult.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* DALL-E Settings */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-pink-600 rounded-lg">
                    <Image className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold">Image Generation</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable DALL-E Images</p>
                      <p className="text-sm text-slate-400">
                        Auto-generate featured images
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="dalle_enabled"
                        checked={formData.dalle_enabled}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      DALL-E Model
                    </label>
                    <select
                      name="dalle_model"
                      value={formData.dalle_model}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="dall-e-3">DALL-E 3 (Recommended)</option>
                      <option value="dall-e-2">DALL-E 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Image Size
                    </label>
                    <select
                      name="dalle_size"
                      value={formData.dalle_size}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="1792x1024">1792x1024 (Landscape)</option>
                      <option value="1024x1024">1024x1024 (Square)</option>
                      <option value="1024x1792">1024x1792 (Portrait)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Image Quality
                    </label>
                    <select
                      name="dalle_quality"
                      value={formData.dalle_quality}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="standard">Standard</option>
                      <option value="hd">HD (Higher cost)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Auto-Publish */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold">Auto-Publish</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Auto-Publish</p>
                      <p className="text-sm text-slate-400">
                        Schedule articles automatically
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="auto_publish_enabled"
                        checked={formData.auto_publish_enabled}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Hours Until Auto-Publish
                    </label>
                    <input
                      type="number"
                      name="auto_publish_hours"
                      value={formData.auto_publish_hours}
                      onChange={handleChange}
                      min={1}
                      max={720}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-slate-500 text-xs mt-1">
                      Generated articles will be scheduled to publish after this
                      many hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Rate Limits */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-600 rounded-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold">Rate Limits</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Max Articles Per Day
                    </label>
                    <input
                      type="number"
                      name="max_articles_per_day"
                      value={formData.max_articles_per_day}
                      onChange={handleChange}
                      min={1}
                      max={50}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Max Articles Per Week
                    </label>
                    <input
                      type="number"
                      name="max_articles_per_week"
                      value={formData.max_articles_per_week}
                      onChange={handleChange}
                      min={1}
                      max={200}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold">Notifications</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Admin Notification Email
                  </label>
                  <input
                    type="email"
                    name="admin_notification_email"
                    value={formData.admin_notification_email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-slate-500 text-xs mt-1">
                    Receive notifications when articles need review
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
