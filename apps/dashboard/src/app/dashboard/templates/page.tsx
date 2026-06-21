"use client";

import React, { useEffect, useState } from "react";
import { Sliders, Plus, Edit2, Trash2, X, SlidersHorizontal, Info } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface Template {
  id: string;
  name: string;
  channel: "EMAIL" | "SMS" | "WEBHOOK" | "IN_APP";
  subject: string | null;
  body: string;
  createdAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<"EMAIL" | "SMS" | "WEBHOOK" | "IN_APP">("EMAIL");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch all templates
  async function fetchTemplates() {
    try {
      setLoading(true);
      const data = await apiClient.get("/api/v1/templates");
      setTemplates(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Open modal for Create
  function handleOpenCreate() {
    setEditingTemplate(null);
    setName("");
    setChannel("EMAIL");
    setSubject("");
    setBody("");
    setFormError(null);
    setIsModalOpen(true);
  }

  // Open modal for Edit
  function handleOpenEdit(tpl: Template) {
    setEditingTemplate(tpl);
    setName(tpl.name);
    setChannel(tpl.channel);
    setSubject(tpl.subject || "");
    setBody(tpl.body);
    setFormError(null);
    setIsModalOpen(true);
  }

  // Save template (Create / Update)
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    // Client-side quick check
    if (channel === "EMAIL" && (!subject || subject.trim().length === 0)) {
      setFormError("Subject is required for EMAIL channel templates.");
      setSaving(false);
      return;
    }

    const payload = {
      name,
      channel,
      subject: channel === "EMAIL" ? subject : null,
      body,
    };

    const endpoint = editingTemplate
      ? `/api/v1/templates/${editingTemplate.id}`
      : "/api/v1/templates";
    const method = editingTemplate ? "PUT" : "POST";

    try {
      if (method === "PUT") {
        await apiClient.put(endpoint, payload);
      } else {
        await apiClient.post(endpoint, payload);
      }
      setIsModalOpen(false);
      await fetchTemplates();
    } catch (err: any) {
      setFormError(err.message || "Failed to save template. Make sure the template name is unique.");
    } finally {
      setSaving(false);
    }
  }

  // Delete template
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      await apiClient.delete(`/api/v1/templates/${id}`);
      await fetchTemplates();
    } catch (err: any) {
      setError(err.message || "Failed to delete template.");
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-[#1C1917] select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#F1EDE9] pb-5 gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1C1917] tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-[#78716C]" />
            Template Manager
          </h1>
          <p className="text-xs text-[#78716C] mt-1">
            Build and manage reusable message configurations with placeholders
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] px-4 py-2.5 text-xs font-semibold text-white outline-none transition-colors w-full sm:w-auto min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-4 text-xs text-[#BE123C]">
          {error}
        </div>
      )}

      {/* Dataset Grid: Responsive cards grid */}
      {loading ? (
        <div className="text-center py-20 text-[#78716C] text-xs">
          Loading templates list...
        </div>
      ) : templates.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-xl border border-[#F1EDE9] bg-white p-5 flex flex-col justify-between space-y-4 hover:border-[#FB7185]/40 transition-colors shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#E11D48] font-bold uppercase tracking-wider bg-[#FFF1F2] border border-[#FB7185]/20 px-2 py-0.5 rounded">
                    {tpl.channel}
                  </span>
                  <span className="font-mono text-[9px] text-[#78716C]">
                    {new Date(tpl.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-sm font-bold text-[#1C1917] tracking-tight">
                  {tpl.name}
                </h3>
                
                {tpl.channel === "EMAIL" && tpl.subject && (
                  <p className="text-xs text-[#78716C] font-semibold truncate">
                    Subject: {tpl.subject}
                  </p>
                )}

                <p className="text-xs text-[#78716C] line-clamp-3 bg-[#FAF9F7] border border-[#F1EDE9] p-2.5 rounded font-sans leading-relaxed">
                  {tpl.body}
                </p>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#F1EDE9]">
                <button
                  onClick={() => handleOpenEdit(tpl)}
                  className="p-2 rounded hover:bg-[#FAF9F7] text-[#78716C] hover:text-[#1C1917] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title="Edit Template"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(tpl.id)}
                  className="p-2 rounded hover:bg-[#FAF9F7] text-[#78716C] hover:text-[#BE123C] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title="Delete Template"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#F1EDE9] bg-white rounded-xl space-y-3">
          <Sliders className="h-10 w-10 text-[#78716C]" />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-[#1C1917]">No Templates</h3>
            <p className="text-xs text-[#78716C] px-4">Create a reusable template configuration to start dispatching named templates.</p>
          </div>
        </div>
      )}

      {/* CRUD Dialog Form Overlay: Responsive full-screen on mobile, centered modal on desktop */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#1C1917]/30 backdrop-blur-sm z-50 p-0 sm:p-4">
          <div className="w-full h-full sm:h-auto sm:max-w-md rounded-none sm:rounded-xl border border-[#F1EDE9] bg-white p-6 space-y-4 shadow-xl overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#F1EDE9] pb-3">
              <h2 className="text-sm font-bold text-[#1C1917]">
                {editingTemplate ? "Edit Template" : "New Template"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#78716C] hover:text-[#1C1917] p-2 rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-3 text-[11px] text-[#BE123C]">
                {formError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-4">
              {/* Template Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">Template Name</label>
                <input
                  type="text"
                  required
                  placeholder="welcome_email_customer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-[#F1EDE9] bg-white px-3 py-2.5 text-sm text-[#1C1917] placeholder-[#78716C] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] min-h-[44px]"
                />
              </div>

              {/* Delivery Channel */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">Delivery Channel</label>
                <select
                  value={channel}
                  onChange={(e) => {
                    const nextChannel = e.target.value as any;
                    setChannel(nextChannel);
                    if (nextChannel !== "EMAIL") {
                      setSubject("");
                    }
                  }}
                  className="block w-full rounded-lg border border-[#F1EDE9] bg-[#FAF9F7] px-3 py-2.5 text-sm text-[#1C1917] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] min-h-[44px] cursor-pointer"
                >
                  <option value="EMAIL">EMAIL</option>
                  <option value="SMS">SMS</option>
                  <option value="WEBHOOK">WEBHOOK</option>
                  <option value="IN_APP">IN_APP</option>
                </select>
              </div>

              {/* Subject (EMAIL only) */}
              {channel === "EMAIL" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">Email Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Welcome {{ name }} to Notifyflow!"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="block w-full rounded-lg border border-[#F1EDE9] bg-white px-3 py-2.5 text-sm text-[#1C1917] placeholder-[#78716C] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] min-h-[44px]"
                  />
                </div>
              )}

              {/* Body Text */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">Message Body</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Hi {{ name }}, welcome on board!"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="block w-full rounded-lg border border-[#F1EDE9] bg-white px-3 py-2.5 text-sm text-[#1C1917] placeholder-[#78716C] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] min-h-[100px] font-sans"
                />
              </div>

              {/* Dynamic Variables Hint */}
              <div className="flex gap-2 rounded-lg bg-[#FAF9F7] border border-[#F1EDE9] p-3 text-xs text-[#78716C]">
                <Info className="h-4 w-4 shrink-0 text-[#78716C] mt-0.5" />
                <span>
                  Use double curly brackets (e.g. <code className="font-mono text-[#E11D48] bg-[#FFF1F2] px-1 py-0.5 rounded">{"{{ variableName }}"}</code>) inside subjects or bodies to interpolate incoming payload variables.
                </span>
              </div>

              {/* Modal Actions: Stack vertically on mobile, side-by-side on desktop */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-[#F1EDE9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto rounded-lg border border-[#F1EDE9] px-4 py-2.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] active:bg-[#FAF9F7] transition-colors outline-none min-h-[44px] flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto rounded-lg bg-[#E11D48] hover:bg-[#BE123C] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50 outline-none transition-colors min-h-[44px] flex items-center justify-center"
                >
                  {saving ? "Saving..." : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
