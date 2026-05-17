"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getReport, parseSalesAnalysis, parseGeneralAnalysis } from "@/lib/api";
import { AnalysisReport, SalesAnalysis, GeneralAnalysis } from "@/types";
import {
  ArrowLeft,
  FileAudio,
  TrendingUp,
  Mic2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Users,
  BarChart3,
  Target,
  MessageCircle,
  Lightbulb,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import Link from "next/link";
import { clsx } from "clsx";

function ScoreRing({ score, size = 100, color = "#6366f1" }: { score: number; size?: number; color?: string }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fill="white" fontSize={size / 5} fontWeight="bold">
        {score}%
      </text>
    </svg>
  );
}

function Section({ title, icon: Icon, children, color = "#6366f1" }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + "30" }}>
          <Icon size={16} style={{ color }} />
        </div>
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Tag({ children, color = "indigo" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-500/15 text-indigo-300",
    emerald: "bg-emerald-500/15 text-emerald-300",
    amber: "bg-amber-500/15 text-amber-300",
    red: "bg-red-500/15 text-red-300",
    purple: "bg-purple-500/15 text-purple-300",
    cyan: "bg-cyan-500/15 text-cyan-300",
  };
  return (
    <span className={clsx("inline-flex px-2.5 py-1 rounded-lg text-xs font-medium", colors[color] || colors.indigo)}>
      {children}
    </span>
  );
}

function MetricBar({ label, value, color = "#6366f1" }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

function GeneralAnalysisView({ data }: { data: GeneralAnalysis }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 text-center">
          <ScoreRing score={data.overallScore} />
          <p className="text-slate-400 text-sm mt-2">Overall Score</p>
        </div>
        <div className="glass rounded-2xl p-5 col-span-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Summary</p>
          <p className="text-slate-200 text-sm leading-relaxed">{data.summary}</p>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
            <div>
              <p className="text-xs text-slate-500">Speakers</p>
              <p className="text-white font-semibold">{data.speakerCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Language</p>
              <p className="text-white font-semibold">{data.languageDetected}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Duration</p>
              <p className="text-white font-semibold">{data.durationEstimate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Sentiment</p>
              <p className={clsx("font-semibold capitalize",
                data.sentiment === "positive" ? "text-emerald-400" :
                data.sentiment === "negative" ? "text-red-400" : "text-amber-400"
              )}>{data.sentiment}</p>
            </div>
          </div>
        </div>
      </div>

      <Section title="Key Topics" icon={BarChart3} color="#06b6d4">
        <div className="flex flex-wrap gap-2">
          {data.keyTopics?.map((t) => <Tag key={t} color="cyan">{t}</Tag>)}
        </div>
      </Section>

      <Section title="Highlights" icon={Lightbulb} color="#f59e0b">
        <ul className="space-y-2">
          {data.highlights?.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <ChevronRight size={14} className="text-amber-400 mt-0.5 shrink-0" />
              {h}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Action Items" icon={CheckCircle} color="#10b981">
        <ul className="space-y-2">
          {data.actionItems?.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-emerald-400 text-xs font-bold">{i + 1}</span>
              </div>
              {a}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Full Transcription" icon={Mic2} color="#6366f1">
        <div className="bg-white/3 rounded-xl p-4 max-h-64 overflow-y-auto">
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{data.transcription}</p>
        </div>
      </Section>
    </div>
  );
}

function SalesAnalysisView({ data }: { data: SalesAnalysis }) {
  const radarData = [
    { subject: "Communication", value: data.executiveAnalysis?.score || 0 },
    { subject: "Product Knowledge", value: data.executiveAnalysis?.productKnowledge || 0 },
    { subject: "Rapport", value: data.executiveAnalysis?.rapport || 0 },
    { subject: "Closing", value: data.executiveAnalysis?.closing || 0 },
    { subject: "Objection Handling", value: data.executiveAnalysis?.objectionHandling?.score || 0 },
    { subject: "Listening", value: 75 },
  ];

  const talkRatioData = [
    { name: "Executive", value: data.callMetrics?.talkRatio?.executive || 60, fill: "#6366f1" },
    { name: "Customer", value: data.callMetrics?.talkRatio?.customer || 40, fill: "#8b5cf6" },
  ];

  const conversionProb = data.conversionAnalysis?.probability || 0;
  const conversionColor =
    conversionProb >= 70 ? "#10b981" : conversionProb >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-5">
      {/* Top metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5 text-center col-span-1">
          <ScoreRing score={data.overallScore} size={90} />
          <p className="text-slate-400 text-xs mt-2">Overall Score</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <ScoreRing score={data.executiveAnalysis?.score || 0} size={90} color="#8b5cf6" />
          <p className="text-slate-400 text-xs mt-2">Executive Score</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <ScoreRing score={conversionProb} size={90} color={conversionColor} />
          <p className="text-slate-400 text-xs mt-2">Conversion %</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <ScoreRing score={data.customerAnalysis?.sentimentScore || 0} size={90} color="#06b6d4" />
          <p className="text-slate-400 text-xs mt-2">Customer Score</p>
        </div>
      </div>

      {/* Summary */}
      <div className="glass rounded-2xl p-6">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Call Summary</p>
        <p className="text-slate-200 text-sm leading-relaxed">{data.summary}</p>
      </div>

      {/* Executive Analysis */}
      <Section title="Sales Executive Analysis" icon={Users} color="#8b5cf6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-slate-500 mb-3">Performance Radar</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <MetricBar label="Product Knowledge" value={data.executiveAnalysis?.productKnowledge || 0} color="#8b5cf6" />
            <MetricBar label="Rapport Building" value={data.executiveAnalysis?.rapport || 0} color="#6366f1" />
            <MetricBar label="Closing Skills" value={data.executiveAnalysis?.closing || 0} color="#06b6d4" />
            <MetricBar label="Objection Handling" value={data.executiveAnalysis?.objectionHandling?.score || 0} color="#10b981" />
            <MetricBar label="Overall Communication" value={data.executiveAnalysis?.score || 0} color="#f59e0b" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ThumbsUp size={14} className="text-emerald-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wide">Strengths</p>
            </div>
            <ul className="space-y-1.5">
              {data.executiveAnalysis?.strengths?.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ThumbsDown size={14} className="text-amber-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wide">Areas to Improve</p>
            </div>
            <ul className="space-y-1.5">
              {data.executiveAnalysis?.improvements?.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {data.executiveAnalysis?.communicationStyle && (
          <div className="mt-4 p-4 rounded-xl bg-white/3">
            <p className="text-xs text-slate-500 mb-1">Communication Style</p>
            <p className="text-sm text-slate-300">{data.executiveAnalysis.communicationStyle}</p>
          </div>
        )}
      </Section>

      {/* Customer Analysis */}
      <Section title="Customer Analysis" icon={MessageCircle} color="#06b6d4">
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="text-center p-4 rounded-xl bg-white/3">
            <p className={clsx("text-2xl font-bold capitalize",
              data.customerAnalysis?.sentiment === "positive" ? "text-emerald-400" :
              data.customerAnalysis?.sentiment === "negative" ? "text-red-400" : "text-amber-400"
            )}>{data.customerAnalysis?.sentiment}</p>
            <p className="text-slate-500 text-xs mt-1">Sentiment</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/3">
            <p className="text-2xl font-bold text-cyan-400 capitalize">{data.customerAnalysis?.engagementLevel}</p>
            <p className="text-slate-500 text-xs mt-1">Engagement</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/3">
            <p className="text-2xl font-bold text-indigo-400">{data.customerAnalysis?.questions?.length || 0}</p>
            <p className="text-slate-500 text-xs mt-1">Questions Asked</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { title: "Customer Expectations", items: data.customerAnalysis?.expectations, color: "cyan" },
            { title: "Questions Raised", items: data.customerAnalysis?.questions, color: "indigo" },
            { title: "Pain Points", items: data.customerAnalysis?.painPoints, color: "red" },
            { title: "Buying Signals", items: data.customerAnalysis?.buyingSignals, color: "emerald" },
          ].map(({ title, items, color }) => (
            <div key={title}>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">{title}</p>
              <div className="flex flex-wrap gap-1.5">
                {items?.map((item, i) => <Tag key={i} color={color}>{item}</Tag>)}
                {(!items || items.length === 0) && <span className="text-xs text-slate-600">None identified</span>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Conversion Analysis */}
      <Section title="Conversion Analysis" icon={Target} color="#10b981">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-4xl font-bold" style={{ color: conversionColor }}>
                  {conversionProb}%
                </p>
                <p className="text-slate-400 text-sm">Conversion Probability</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium",
                    data.conversionAnalysis?.urgency === "high" ? "bg-red-500/20 text-red-300" :
                    data.conversionAnalysis?.urgency === "medium" ? "bg-amber-500/20 text-amber-300" :
                    "bg-slate-500/20 text-slate-400"
                  )}>
                    {data.conversionAnalysis?.urgency?.toUpperCase()} URGENCY
                  </span>
                  <span className="text-xs text-slate-500 capitalize">
                    {data.conversionAnalysis?.confidence} confidence
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-500 mb-1.5">
                  <span className="text-emerald-400">Positive Factors</span>
                </p>
                {data.conversionAnalysis?.keyFactors?.positive?.map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-slate-300 mb-1">
                    <ChevronRight size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5">
                  <span className="text-red-400">Risk Factors</span>
                </p>
                {data.conversionAnalysis?.keyFactors?.negative?.map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-slate-300 mb-1">
                    <ChevronRight size={12} className="text-red-400 mt-0.5 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Talk Ratio</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={talkRatioData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                  {talkRatioData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                <Legend formatter={(v) => <span className="text-slate-300 text-xs">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Questions", value: data.callMetrics?.questionCount },
                { label: "Objections", value: data.callMetrics?.objectionCount },
                { label: "Interruptions", value: data.callMetrics?.interruptions },
              ].map(({ label, value }) => (
                <div key={label} className="p-2 rounded-lg bg-white/3">
                  <p className="text-white font-bold">{value ?? "—"}</p>
                  <p className="text-slate-600 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs text-emerald-400 uppercase tracking-wide font-medium mb-1">Recommended Next Step</p>
          <p className="text-slate-200 text-sm">{data.conversionAnalysis?.recommendedNextStep}</p>
        </div>

        <div className="mt-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Follow-up Actions</p>
          <div className="space-y-2">
            {data.conversionAnalysis?.followUpActions?.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <span className="text-indigo-400 text-xs font-bold">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-300">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Key Moments */}
      {data.keyMoments && data.keyMoments.length > 0 && (
        <Section title="Key Moments" icon={Clock} color="#f59e0b">
          <div className="space-y-3">
            {data.keyMoments.map((m, i) => {
              const typeColors: Record<string, string> = {
                objection: "#ef4444",
                buying_signal: "#10b981",
                question: "#6366f1",
                closing: "#8b5cf6",
              };
              const c = typeColors[m.type] || "#f59e0b";
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3">
                  <span className="font-mono text-xs text-slate-500 mt-0.5 w-14 shrink-0">{m.timestamp}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0 capitalize"
                    style={{ background: c + "22", color: c }}>
                    {m.type.replace("_", " ")}
                  </span>
                  <p className="text-sm text-slate-300">{m.description}</p>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Transcription */}
      <Section title="Full Transcription" icon={Mic2} color="#6366f1">
        <div className="bg-white/3 rounded-xl p-4 max-h-72 overflow-y-auto">
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{data.transcription}</p>
        </div>
      </Section>
    </div>
  );
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReport(Number(params.id))
      .then(setReport)
      .catch(() => setError("Report not found"))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-white font-medium">{error || "Report not found"}</p>
        <Link href="/reports" className="text-indigo-400 text-sm hover:underline">Back to reports</Link>
      </div>
    );
  }

  const salesData = report.analysisType === "SALES" ? parseSalesAnalysis(report) : null;
  const generalData = report.analysisType === "GENERAL" ? parseGeneralAnalysis(report) : null;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <button onClick={() => router.back()} className="mt-1 p-2 rounded-xl glass hover:bg-white/10 transition-colors text-slate-400">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: report.analysisType === "SALES" ? "#8b5cf622" : "#6366f122" }}>
              {report.analysisType === "SALES"
                ? <TrendingUp size={16} style={{ color: "#8b5cf6" }} />
                : <Mic2 size={16} style={{ color: "#6366f1" }} />}
            </div>
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              {report.analysisType === "SALES" ? "Sales Analysis" : "General Analysis"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">{report.fileName}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {report.createdAt ? format(new Date(report.createdAt), "MMMM d, yyyy 'at' h:mm a") : "—"}
            {" · "}
            <span className={clsx(
              "capitalize",
              report.status === "COMPLETED" ? "text-emerald-400" :
              report.status === "FAILED" ? "text-red-400" : "text-amber-400"
            )}>
              {report.status.toLowerCase()}
            </span>
          </p>
        </div>
      </div>

      {report.status === "FAILED" && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
          <AlertCircle size={18} className="text-red-400" />
          <p className="text-red-300 text-sm">{report.summary || "Analysis failed"}</p>
        </div>
      )}

      {report.status === "COMPLETED" && salesData && <SalesAnalysisView data={salesData} />}
      {report.status === "COMPLETED" && generalData && <GeneralAnalysisView data={generalData} />}
      {report.status === "COMPLETED" && !salesData && !generalData && (
        <div className="glass rounded-2xl p-6">
          <p className="text-slate-400 text-sm">Raw analysis data:</p>
          <pre className="text-xs text-slate-300 mt-3 overflow-auto max-h-96">{report.rawAnalysisJson}</pre>
        </div>
      )}
    </div>
  );
}
