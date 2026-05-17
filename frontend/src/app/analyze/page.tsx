"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import AudioRecorder from "@/components/AudioRecorder";
import { analyzeAudio } from "@/lib/api";
import {
  Upload,
  Mic2,
  TrendingUp,
  FileAudio,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";

function AnalyzePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = (searchParams.get("type") as "GENERAL" | "SALES") || "GENERAL";

  const [analysisType, setAnalysisType] = useState<"GENERAL" | "SALES">(defaultType);
  const [inputMethod, setInputMethod] = useState<"upload" | "record">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [executiveName, setExecutiveName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [callContext, setCallContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".mp4", ".wav", ".webm", ".ogg", ".m4a", ".flac", ".aac"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select or record an audio file first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const report = await analyzeAudio(file, analysisType, {
        executiveName: executiveName || undefined,
        customerName: customerName || undefined,
        callContext: callContext || undefined,
      });
      router.push(`/reports/${report.id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Analysis failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">New Analysis</h1>
        <p className="text-slate-400 mt-1">Upload or record audio to get AI-powered insights</p>
      </div>

      {/* Analysis Type */}
      <div className="glass rounded-2xl p-6 mb-5">
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Analysis Type</h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            {
              type: "GENERAL" as const,
              icon: Mic2,
              title: "General Analysis",
              desc: "Transcription, topics, sentiment",
              color: "#6366f1",
            },
            {
              type: "SALES" as const,
              icon: TrendingUp,
              title: "Sales Analysis",
              desc: "Executive insights, conversion probability",
              color: "#8b5cf6",
            },
          ]).map(({ type, icon: Icon, title, desc, color }) => (
            <button
              key={type}
              onClick={() => setAnalysisType(type)}
              className={clsx(
                "text-left p-4 rounded-xl border-2 transition-all",
                analysisType === type
                  ? "border-indigo-500/60 bg-indigo-500/10"
                  : "border-white/5 hover:border-white/15 bg-white/3"
              )}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: color + "33" }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-white font-medium text-sm">{title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Method */}
      <div className="glass rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          {(["upload", "record"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setInputMethod(m); setFile(null); }}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                inputMethod === m
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              {m === "upload" ? "Upload File" : "Record Audio"}
            </button>
          ))}
        </div>

        {inputMethod === "upload" ? (
          file ? (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <FileAudio size={20} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{file.name}</p>
                <p className="text-slate-400 text-xs">{formatSize(file.size)}</p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={clsx(
                "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
                isDragActive
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-white/10 hover:border-white/20 hover:bg-white/3"
              )}
            >
              <input {...getInputProps()} />
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center mx-auto mb-4">
                <Upload size={24} className="text-indigo-400" />
              </div>
              <p className="text-white font-medium">Drop your audio file here</p>
              <p className="text-slate-500 text-sm mt-1">or click to browse</p>
              <p className="text-slate-600 text-xs mt-3">MP3, WAV, MP4, WebM, OGG, FLAC · Max 50MB</p>
            </div>
          )
        ) : (
          <AudioRecorder onRecordingComplete={(f) => { setFile(f); setError(null); }} />
        )}
      </div>

      {/* Sales Context (only for SALES type) */}
      {analysisType === "SALES" && (
        <div className="glass rounded-2xl p-6 mb-5">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Call Context (Optional)</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Sales Executive Name</label>
              <input
                type="text"
                value={executiveName}
                onChange={(e) => setExecutiveName(e.target.value)}
                placeholder="e.g., John Smith"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g., Acme Corp"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Call Context</label>
            <textarea
              value={callContext}
              onChange={(e) => setCallContext(e.target.value)}
              placeholder="Describe the purpose of this call, product being sold, or any relevant context..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-5">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="glass rounded-2xl p-6 mb-5 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Loader2 size={20} className="text-indigo-400 animate-spin" />
            <span className="text-white font-medium">Analyzing with Gemini 1.5 Pro...</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse w-3/4" />
          </div>
          <p className="text-slate-500 text-xs mt-3">This may take 30–60 seconds for longer recordings</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className={clsx(
          "w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white transition-all",
          !file || loading
            ? "bg-white/5 text-slate-500 cursor-not-allowed"
            : "hover:opacity-90 active:scale-98 cursor-pointer"
        )}
        style={
          !file || loading
            ? {}
            : { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }
        }
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin" /> Analyzing...</>
        ) : (
          <><CheckCircle size={18} /> Start Analysis <ChevronRight size={16} /></>
        )}
      </button>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading...</div>}>
      <AnalyzePageContent />
    </Suspense>
  );
}
