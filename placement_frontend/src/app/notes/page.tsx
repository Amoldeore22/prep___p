"use client";

import React, { useState, useEffect, useRef } from "react";
import StudentSidebar from "@/components/layout/StudentSidebar";
import StudentNavbar from "@/components/layout/StudentNavbar";
import {
  Plus,
  Pin,
  Trash2,
  Download,
  Search,
  Tag,
  Save,
  Check,
  Sparkles,
} from "lucide-react";

export default function StudentNotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [category, setCategory] = useState<string>("DSA");
  const [tags, setTags] = useState<string>("");
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [isAutosaving, setIsAutosaving] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotes = () => {
    fetch(`/api/notes?category=${filterCategory}&search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.notes) {
          setNotes(d.notes);
          if (!selectedNote && d.notes.length > 0) {
            loadNoteIntoEditor(d.notes[0]);
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Notes error:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchNotes();
  }, [filterCategory, search]);

  const loadNoteIntoEditor = (note: any) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content || "");
    setCategory(note.category || "DSA");
    setTags(note.tags || "");
    setIsPinned(note.isPinned || false);
    setLastSavedTime("Synced");
  };

  const handleCreateNewNote = async () => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Note",
          content: "",
          category: "DSA",
        }),
      });
      const data = await res.json();
      if (data.note) {
        setNotes([data.note, ...notes]);
        loadNoteIntoEditor(data.note);
      }
    } catch (err) {
      console.error("Create note error:", err);
    }
  };

  // Trigger autosave when content or title changes
  const triggerAutosave = (newTitle: string, newContent: string) => {
    if (!selectedNote) return;
    setIsAutosaving(true);

    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);

    autosaveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/notes/${selectedNote.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newTitle,
            content: newContent,
            category,
            tags,
            isPinned,
          }),
        });

        setIsAutosaving(false);
        setLastSavedTime(new Date().toLocaleTimeString());

        // Update list title
        setNotes((prev) =>
          prev.map((n) =>
            n.id === selectedNote.id ? { ...n, title: newTitle, content: newContent } : n
          )
        );
      } catch (err) {
        console.error("Autosave error:", err);
        setIsAutosaving(false);
      }
    }, 800);
  };

  const handleTogglePin = async () => {
    if (!selectedNote) return;
    const newPinned = !isPinned;
    setIsPinned(newPinned);

    try {
      await fetch(`/api/notes/${selectedNote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: newPinned }),
      });
      setNotes((prev) =>
        prev.map((n) => (n.id === selectedNote.id ? { ...n, isPinned: newPinned } : n))
      );
    } catch {}
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this note?");
    if (!confirmDelete) return;

    try {
      await fetch(`/api/notes/${selectedNote.id}`, { method: "DELETE" });
      const remaining = notes.filter((n) => n.id !== selectedNote.id);
      setNotes(remaining);
      if (remaining.length > 0) {
        loadNoteIntoEditor(remaining[0]);
      } else {
        setSelectedNote(null);
      }
    } catch (err) {
      console.error("Delete note error:", err);
    }
  };

  const handleExport = (format: "markdown" | "txt") => {
    if (!selectedNote) return;
    const fileContent = `# ${title}\n\nCategory: ${category}\nTags: ${tags}\n\n${content}`;
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/\s+/g, "_")}.${format === "markdown" ? "md" : "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-[#121316] text-zinc-100">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentNavbar title="Private Student Notes" />

        <main className="p-6 md:p-8 space-y-6 flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Personal Study Notes</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Autosaved markdown notes strictly isolated to your student account.
              </p>
            </div>

            <button
              onClick={handleCreateNewNote}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#F15A24] hover:from-[#F15A24] hover:to-[#ea580c] text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition flex items-center gap-2 self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Note</span>
            </button>
          </div>

          {/* Two-Pane Workspace: Left List, Right Editor */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-[550px]">
            {/* Left Column: Notes List */}
            <div className="md:col-span-4 glass-panel rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] p-4 flex flex-col space-y-3">
              {/* Search & Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search notes..."
                    className="glass-input w-full pl-8 pr-3 py-1.5 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                  {["All", "DSA", "Aptitude", "Interview", "General"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        filterCategory === cat
                          ? "bg-gradient-to-r from-[#FF5722] to-[#F15A24] text-white shadow-sm shadow-orange-500/20"
                          : "bg-[#202226] text-zinc-400 hover:text-white border border-[#2C2E33]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note Cards List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {notes.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs">
                    No notes found. Click "Create New Note" to start.
                  </div>
                ) : (
                  notes.map((n) => {
                    const isSelected = selectedNote?.id === n.id;
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => loadNoteIntoEditor(n)}
                        className={`w-full p-3.5 rounded-xl text-left border transition-all space-y-1.5 ${
                          isSelected
                            ? "bg-[#FF5722]/10 border-[#FF5722]/40 text-white ring-1 ring-[#FF5722]/30"
                            : "bg-[#202226] border-[#2C2E33] text-zinc-300 hover:bg-[#282a30]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs truncate max-w-[180px]">
                            {n.title || "Untitled"}
                          </span>
                          {n.isPinned && <Pin className="w-3 h-3 text-amber-400 fill-current" />}
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {n.content || "Empty note content..."}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                          <span className="capitalize">{n.category}</span>
                          <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Note Editor */}
            <div className="md:col-span-8 glass-panel rounded-2xl border border-[#2C2E33] bg-[#1A1B1E] p-6 flex flex-col justify-between space-y-4">
              {selectedNote ? (
                <>
                  {/* Editor Header Toolbar */}
                  <div className="space-y-3 pb-3 border-b border-[#2C2E33]">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          triggerAutosave(e.target.value, content);
                        }}
                        placeholder="Note Title..."
                        className="bg-transparent text-xl font-bold text-white outline-none w-full"
                      />

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Pin */}
                        <button
                          onClick={handleTogglePin}
                          className={`p-2 rounded-xl text-xs transition ${
                            isPinned
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-[#202226] hover:bg-[#2C2E33] text-zinc-400 hover:text-white border border-[#2C2E33]"
                          }`}
                          title={isPinned ? "Unpin note" : "Pin note to top"}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        {/* Export Menu */}
                        <button
                          onClick={() => handleExport("markdown")}
                          className="p-2 rounded-xl bg-[#202226] hover:bg-[#2C2E33] text-zinc-400 hover:text-white border border-[#2C2E33] text-xs transition flex items-center gap-1.5"
                          title="Export as Markdown"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">.md</span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={handleDeleteNote}
                          className="p-2 rounded-xl bg-[#202226] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-[#2C2E33] text-xs transition"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Selector */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">Category:</span>
                        <select
                          value={category}
                          onChange={(e) => {
                            setCategory(e.target.value);
                            triggerAutosave(title, content);
                          }}
                          className="bg-[#202226] border border-[#2C2E33] text-zinc-300 rounded-lg px-2 py-1 outline-none text-xs"
                        >
                          <option value="DSA">DSA</option>
                          <option value="Aptitude">Aptitude</option>
                          <option value="Interview">Interview</option>
                          <option value="General">General</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 flex-1">
                        <Tag className="w-3 h-3 text-zinc-500" />
                        <input
                          type="text"
                          value={tags}
                          onChange={(e) => {
                            setTags(e.target.value);
                            triggerAutosave(title, content);
                          }}
                          placeholder="Add tags (e.g. recursion, dynamic-programming)..."
                          className="bg-transparent text-zinc-300 text-xs outline-none w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Note Content Textarea */}
                  <textarea
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      triggerAutosave(title, e.target.value);
                    }}
                    placeholder="Write your study notes, algorithmic proof, time complexities, or placement strategies here..."
                    className="flex-1 w-full bg-transparent text-zinc-200 text-sm outline-none resize-none leading-relaxed p-1 font-mono"
                  />

                  {/* Footer status bar */}
                  <div className="pt-3 border-t border-[#2C2E33] text-[11px] text-zinc-500 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      {isAutosaving ? (
                        <>
                          <Save className="w-3.5 h-3.5 text-[#FF5722] animate-spin" />
                          <span className="text-[#FF5722]">Autosaving changes...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Last synced at {lastSavedTime || "recently"}</span>
                        </>
                      )}
                    </span>
                    <span>Markdown supported</span>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
                  Select a note from the left pane or create a new one.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
