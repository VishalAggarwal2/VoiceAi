"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllReports } from "@/lib/api";
import { AnalysisReport } from "@/types";
import {
  Mic2,
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  BarChart3,
  Users,
  Zap,
} from "lucide-react";
import { format } from "date-fns";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="glass rounded-2xl p-5 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: color + "22" }}
        >
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    positive: { color: "#10b981", bg: "#10b98122" },
    neutral: { color: "#f59e0b", bg: "#f59e0b22" },
    negative: { color: "#ef4444", bg: "#ef444422" },
  };
  const s = map[sentiment] || map.neutral;
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
      style={{ color: s.color, background: s.bg }}
    >
      {sentiment}
    </span>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "COMPLETED") return <CheckCircle size={14} className="text-emerald-400" />;
  if (status === "PROCESSING") return <Clock size={14} className="text-amber-400 animate-spin" />;
  return <XCircle size={14} className="text-red-400" />;
}

export default function Dashboard() {
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllReports()
      .then(setReports)
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  const completed = reports.filter((r) => r.status === "COMPLETED");
  const salesReports = reports.filter((r) => r.analysisType === "SALES");
  const avgScore =
    completed.length > 0
      ? Math.round(completed.reduce((a, r) => a + (r.overallScore || 0), 0) / completed.length)
      : 0;
  const avgConversion =
    salesReports.length > 0
      ? Math.round(salesReports.reduce((a, r) => a + (r.conversionProbability || 0), 0) / salesReports.length)
      : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
          <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider">System Active</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">AI-powered voice and sales call intelligence</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/analyze?type=GENERAL" className="glass rounded-2xl p-5 card-hover group flex items-center gap-4 border border-transparent hover:border-indigo-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
            <Mic2 size={22} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold">General Analysis</h3>
            <p className="text-slate-400 text-sm">Transcribe & analyze any audio</p>
          </div>
          <ArrowRight size={18} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
        </Link>
        <Link href="/analyze?type=SALES" className="glass rounded-2xl p-5 card-hover group flex items-center gap-4 border border-transparent hover:border-purple-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
            <TrendingUp size={22} className="text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold">Sales Analysis</h3>
            <p className="text-slate-400 text-sm">Deep sales executive insights</p>
          </div>
          <ArrowRight size={18} className="text-slate-600 group-hover:text-purple-400 transition-colors" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Reports" value={reports.length} icon={FileText} color="#6366f1" sub="all time" />
        <StatCard label="Avg Score" value={`${avgScore}%`} icon={BarChart3} color="#8b5cf6" sub="completed analyses" />
        <StatCard label="Sales Reports" value={salesReports.length} icon={Users} color="#06b6d4" sub="executive analyses" />
        <StatCard label="Avg Conversion" value={`${avgConversion}%`} icon={Zap} color="#10b981" sub="probability" />
      </div>

      {/* Recent Reports */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Recent Reports</h2>
          <Link href="/reports" className="text-indigo-400 text-sm hover:text-indigo-300 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <Mic2 size={40} className="mx-auto text-slate-700 mb-3" />
            <p className="text-slate-400">No analyses yet</p>
            <Link href="/analyze" className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 text-sm hover:bg-indigo-500/30 transition-colors">
              Start your first analysis <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {reports.slice(0, 8).map((report) => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: report.analysisType === "SALES" ? "#8b5cf622" : "#6366f122",
                  }}
                >
                  {report.analysisType === "SALES"
                    ? <TrendingUp size={16} style={{ color: "#8b5cf6" }} />
                    : <Mic2 size={16} style={{ color: "#6366f1" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{report.fileName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {report.createdAt ? format(new Date(report.createdAt), "MMM d, yyyy · h:mm a") : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {report.customerSentiment && (
                    <SentimentBadge sentiment={report.customerSentiment} />
                  )}
                  {report.overallScore != null && report.status === "COMPLETED" && (
                    <span className="text-sm font-semibold text-indigo-300">{report.overallScore}%</span>
                  )}
                  <StatusIcon status={report.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
