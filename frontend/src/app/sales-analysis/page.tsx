"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllReports, parseSalesAnalysis } from "@/lib/api";
import { AnalysisReport, SalesAnalysis } from "@/types";
import {
  TrendingUp,
  Users,
  Target,
  ArrowRight,
  BarChart3,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { format } from "date-fns";
import { clsx } from "clsx";

interface EnrichedReport {
  report: AnalysisReport;
  sales: SalesAnalysis;
}

function ConversionGauge({ value }: { value: number }) {
  const color = value >= 70 ? "#10b981" : value >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-14 overflow-hidden">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="125.6"
            strokeDashoffset={125.6 - (value / 100) * 125.6}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
      </div>
      <p className="text-2xl font-bold -mt-2" style={{ color }}>{value}%</p>
    </div>
  );
}

export default function SalesAnalysisPage() {
  const [enriched, setEnriched] = useState<EnrichedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllReports("SALES")
      .then((reports) => {
        const e = reports
          .filter((r) => r.status === "COMPLETED")
          .map((r) => ({ report: r, sales: parseSalesAnalysis(r) }))
          .filter((e) => e.sales !== null) as EnrichedReport[];
        setEnriched(e);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (enriched.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Sales Analysis</h1>
          <p className="text-slate-400 mt-1">Executive performance & conversion intelligence</p>
        </div>
        <div className="glass rounded-2xl p-16 text-center">
          <TrendingUp size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-white font-semibold text-lg">No Sales Analyses Yet</p>
          <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
            Upload a sales call recording and select "Sales Analysis" to get detailed executive insights.
          </p>
          <Link href="/analyze?type=SALES"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            Analyze a Sales Call <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const avgConversion = Math.round(enriched.reduce((a, e) => a + (e.sales.conversionAnalysis?.probability || 0), 0) / enriched.length);
  const avgExecScore = Math.round(enriched.reduce((a, e) => a + (e.sales.executiveAnalysis?.score || 0), 0) / enriched.length);
  const avgOverall = Math.round(enriched.reduce((a, e) => a + (e.sales.overallScore || 0), 0) / enriched.length);

  const barData = enriched.map((e) => ({
    name: e.report.fileName.replace(/\.[^.]+$/, "").slice(0, 14),
    Executive: e.sales.executiveAnalysis?.score || 0,
    Conversion: e.sales.conversionAnalysis?.probability || 0,
    Overall: e.sales.overallScore || 0,
  }));

  const allImprovements = enriched.flatMap((e) => e.sales.executiveAnalysis?.improvements || []);
  const improvementFrequency = allImprovements.reduce<Record<string, number>>((acc, imp) => {
    acc[imp] = (acc[imp] || 0) + 1;
    return acc;
  }, {});
  const topImprovements = Object.entries(improvementFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const allPainPoints = enriched.flatMap((e) => e.sales.customerAnalysis?.painPoints || []);
  const painPointFreq = allPainPoints.reduce<Record<string, number>>((acc, p) => {
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});
  const topPainPoints = Object.entries(painPointFreq).sort(([, a], [, b]) => b - a).slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Sales Analysis</h1>
          <p className="text-slate-400 mt-1">Aggregated insights from {enriched.length} sales call{enriched.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/analyze?type=SALES"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white text-sm transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <TrendingUp size={16} /> New Analysis
        </Link>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          { label: "Avg Conversion Rate", value: avgConversion, icon: Target, color: "#10b981" },
          { label: "Avg Executive Score", value: avgExecScore, icon: Users, color: "#8b5cf6" },
          { label: "Avg Overall Score", value: avgOverall, icon: BarChart3, color: "#6366f1" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-2xl p-6 flex items-center gap-5">
            <ConversionGauge value={value} />
            <div>
              <p className="text-slate-400 text-sm">{label}</p>
              <p className="text-slate-500 text-xs mt-1">{enriched.length} calls</p>
            </div>
          </div>
        ))}
      </div>

      {/* Performance chart */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-5">Performance by Call</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
              labelStyle={{ color: "#e2e8f0" }}
            />
            <Bar dataKey="Overall" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Executive" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Conversion" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Top improvement areas */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Top Improvement Areas</h2>
          <div className="space-y-3">
            {topImprovements.length === 0 ? (
              <p className="text-slate-500 text-sm">No data yet</p>
            ) : topImprovements.map(([item, count], i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <span className="text-amber-400 text-xs font-bold">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">{item}</p>
                </div>
                <span className="text-xs text-slate-500">{count}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer pain points */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Customer Pain Points</h2>
          <div className="space-y-3">
            {topPainPoints.length === 0 ? (
              <p className="text-slate-500 text-sm">No data yet</p>
            ) : topPainPoints.map(([item, count], i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <span className="text-red-400 text-xs font-bold">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">{item}</p>
                </div>
                <span className="text-xs text-slate-500">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual call cards */}
      <div>
        <h2 className="text-white font-semibold mb-4">Individual Calls</h2>
        <div className="grid gap-4">
          {enriched.map(({ report, sales }) => {
            const conv = sales.conversionAnalysis?.probability || 0;
            const convColor = conv >= 70 ? "#10b981" : conv >= 40 ? "#f59e0b" : "#ef4444";
            return (
              <Link key={report.id} href={`/reports/${report.id}`} className="glass rounded-2xl p-5 card-hover flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                  <TrendingUp size={20} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{report.fileName}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {report.createdAt ? format(new Date(report.createdAt), "MMM d, yyyy") : "—"}
                  </p>
                  {sales.summary && (
                    <p className="text-slate-400 text-xs mt-1 line-clamp-1">{sales.summary}</p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-6 text-center shrink-0">
                  <div>
                    <p className="text-lg font-bold text-indigo-400">{sales.overallScore}%</p>
                    <p className="text-xs text-slate-600">Overall</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-400">{sales.executiveAnalysis?.score}%</p>
                    <p className="text-xs text-slate-600">Executive</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: convColor }}>{conv}%</p>
                    <p className="text-xs text-slate-600">Conversion</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-600 shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
