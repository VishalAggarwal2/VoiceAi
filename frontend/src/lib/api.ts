import axios from "axios";
import { AnalysisReport } from "@/types";

const api = axios.create({
  baseURL: "/api",
  timeout: 180000,
});

export async function analyzeAudio(
  file: File,
  analysisType: "GENERAL" | "SALES",
  options?: {
    executiveName?: string;
    customerName?: string;
    callContext?: string;
  }
): Promise<AnalysisReport> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("analysisType", analysisType);
  if (options?.executiveName) formData.append("executiveName", options.executiveName);
  if (options?.customerName) formData.append("customerName", options.customerName);
  if (options?.callContext) formData.append("callContext", options.callContext);

  const { data } = await api.post<AnalysisReport>("/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getAllReports(type?: string): Promise<AnalysisReport[]> {
  const params = type ? { type } : {};
  const { data } = await api.get<AnalysisReport[]>("/reports", { params });
  return data;
}

export async function getReport(id: number): Promise<AnalysisReport> {
  const { data } = await api.get<AnalysisReport>(`/reports/${id}`);
  return data;
}

export async function deleteReport(id: number): Promise<void> {
  await api.delete(`/reports/${id}`);
}

export function parseSalesAnalysis(report: AnalysisReport) {
  try {
    return JSON.parse(report.rawAnalysisJson);
  } catch {
    return null;
  }
}

export function parseGeneralAnalysis(report: AnalysisReport) {
  try {
    return JSON.parse(report.rawAnalysisJson);
  } catch {
    return null;
  }
}
