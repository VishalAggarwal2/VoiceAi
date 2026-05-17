"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllReports, deleteReport } from "@/lib/api";
import { AnalysisReport } from "@/types";
import {
  FileText,
  TrendingUp,
  Mic2,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { clsx } from "clsx";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    COMPLETED: { icon: CheckCircle, color: "#10b981", bg: "#10b98120", label: "Completed" },
    PROCESSING: { icon: Clock, color: "#f59e0b", bg: "#f59e0b20", label: "Processing" },
    FAILED: { icon: XCircle, color: "#ef4444", bg: "#ef444420", label: "Failed" },
  };
  const s = map[status] || map.FAILED;
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ color: s.color, background: s.bg }}
    >
      <Icon size={11} />
      {s.label}
    </span>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "GENERAL" | "SALES">("ALL");
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    getAllReports()
      .then(setReports)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this report?")) return;
    setDeleting(id);
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const filtered = reports.filter((r) => {
    const matchesSearch = r.fileName.toLowerCase().includes(search.toLowerCase()) ||
      (r.summary || "").toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "ALL" || r.analysisType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">All Reports</h1>
        <p className="text-slate-400 mt-1">{reports.length} total analyses</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 glass rounded-xl p-1">
          {(["ALL", "GENERAL", "SALES"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                typeFilter === t
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <FileText size={40} className="mx-auto text-slate-700 mb-3" />
          <p className="text-slate-400 font-medium">No reports found</p>
          <p className="text-slate-600 text-sm mt-1">
            {search ? "Try a different search term" : "Start a new analysis to see reports here"}
          </p>
          <Link href="/analyze" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 text-sm hover:bg-indigo-500/30 transition-colors">
            New Analysis
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((report) => (
            <Link
              key={report.id}
              href={`/reports/${report.id}`}
              className="glass rounded-2xl p-5 card-hover flex items-start gap-4 group"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: report.analysisType === "SALES" ? "#8b5cf622" : "#6366f122",
                }}
              >
                {report.analysisType === "SALES"
                  ? <TrendingUp size={20} style={{ color: "#8b5cf6" }} />
                  : <Mic2 size={20} style={{ color: "#6366f1" }} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{report.fileName}</p>
                    {report.summary && (
                      <p className="text-slate-400 text-sm mt-1 line-clamp-2">{report.summary}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={report.status} />
                    <button
                      onClick={(e) => handleDelete(report.id, e)}
                      className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100",
                        "bg-red-500/15 hover:bg-red-500/25 text-red-400"
                      )}
                    >
                      {deleting === report.id
                        ? <Clock size={14} className="animate-spin" />
                        : <Trash2 size={14} />}
                    </button>
                    <ExternalLink size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-slate-600">
                    {report.createdAt ? format(new Date(report.createdAt), "MMM d, yyyy · h:mm a") : "—"}
                  </span>
                  {report.overallScore != null && report.status === "COMPLETED" && (
                    <span className="text-xs text-indigo-400 font-medium">
                      Score: {report.overallScore}%
                    </span>
                  )}
                  {report.analysisType === "SALES" && report.conversionProbability != null && (
                    <span className="text-xs text-emerald-400 font-medium">
                      Conversion: {report.conversionProbability}%
                    </span>
                  )}
                  {report.customerSentiment && (
                    <span className={clsx(
                      "text-xs font-medium capitalize",
                      report.customerSentiment === "positive" ? "text-emerald-400" :
                      report.customerSentiment === "negative" ? "text-red-400" : "text-amber-400"
                    )}>
                      {report.customerSentiment}
                    </span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full text-slate-500 bg-white/5">
                    {report.analysisType === "SALES" ? "Sales" : "General"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
