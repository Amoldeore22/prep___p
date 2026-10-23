"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import { Layers, Plus, Edit2, Trash2, PlayCircle, BookOpen, Check, Search } from "lucide-react";

export default function AdminPatternsPage() {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingPattern, setEditingPattern] = useState<any>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [visualizerKey, setVisualizerKey] = useState<string>("");
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchPatterns = () => {
    fetch("/api/admin/dsa/patterns")
      .then((r) => r.json())
      .then((d) => {
        if (d.patterns) setPatterns(d.patterns);
      });
  };

  useEffect(() => {
    fetchPatterns();
  }, []);

  const openEdit = (p?: any) => {
    if (p) {
      setEditingPattern(p);
      setName(p.name);
      setDescription(p.description || "");
      setOrderIndex(p.orderIndex);
      setVisualizerKey(p.visualizerKey || "");
      setIsPublished(p.isPublished);
    } else {
      setEditingPattern(null);
      setName("");
      setDescription("");
      setOrderIndex(patterns.length + 1);
      setVisualizerKey("");
      setIsPublished(true);
    }
    setShowEditModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await fetch("/api/admin/dsa/patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPattern?.id,
          name,
          description,
          orderIndex: Number(orderIndex),
          visualizerKey: visualizerKey || null,
          isPublished,
        }),
      });

      setShowEditModal(false);
      setIsSaving(false);
      fetchPatterns();
    } catch {
      setIsSaving(false);
    }
  };

  const handleDelete = async (p: any) => {
    if (!confirm(`Are you sure you want to delete pattern "${p.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/dsa/patterns/${p.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchPatterns();
      }
    } catch (err) {
      console.error("Failed to delete pattern:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar title="DSA Pattern Management" />

        <main className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">DSA Pattern Directory</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage pattern curriculum, order, and algorithm visualizer mappings.
              </p>
            </div>

            <button
              onClick={() => openEdit()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Pattern</span>
            </button>
          </div>

          <div className="glass-panel rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] overflow-hidden shadow-2xl">
            <div className="divide-y divide-[#2C2E33] text-xs">
              {patterns.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-[#202226]/50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-500 font-bold">#{p.orderIndex}</span>
                      <span className="font-bold text-white text-sm">{p.name}</span>
                      {p.visualizerKey ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/30 flex items-center gap-1">
                          <PlayCircle className="w-3 h-3" /> Visualizer: {p.visualizerKey}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#202226] text-zinc-400 border border-[#2C2E33]">
                          Problem Set Only
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-xs line-clamp-1">{p.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-400 font-bold mr-2">
                      {p._count?.problems || 0} Problems
                    </span>
                    <button
                      onClick={() => openEdit(p)}
                      className="p-2 rounded-lg bg-[#202226] hover:bg-[#2C2E33] text-zinc-300 border border-[#2C2E33] transition"
                      title="Edit Pattern"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="p-2 rounded-lg bg-[#202226] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-[#2C2E33] hover:border-rose-500/30 transition"
                      title="Delete Pattern"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-[#2C2E33] bg-[#1A1B1E] space-y-4 shadow-2xl">
                <h3 className="text-lg font-bold text-white">
                  {editingPattern ? "Edit DSA Pattern" : "Create New Pattern"}
                </h3>

                <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Pattern Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="glass-input w-full p-2.5 rounded-xl text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="glass-input w-full p-2.5 rounded-xl text-white text-xs outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-300 font-semibold block mb-1">Order Index</label>
                      <input
                        type="number"
                        value={orderIndex}
                        onChange={(e) => setOrderIndex(Number(e.target.value))}
                        className="glass-input w-full p-2.5 rounded-xl text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-300 font-semibold block mb-1">Visualizer Key</label>
                      <input
                        type="text"
                        value={visualizerKey}
                        onChange={(e) => setVisualizerKey(e.target.value)}
                        placeholder="e.g. two-pointers"
                        className="glass-input w-full p-2.5 rounded-xl text-white text-xs outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="rounded border-[#2C2E33] bg-[#202226]"
                    />
                    <label htmlFor="isPublished" className="text-zinc-300 font-semibold">
                      Publish to students
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 rounded-xl text-zinc-400 hover:bg-[#202226] transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-bold transition disabled:opacity-50 shadow-lg shadow-orange-500/20"
                    >
                      {isSaving ? "Saving..." : "Save Pattern"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
