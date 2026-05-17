import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "VoiceAI — Intelligent Audio Analysis",
  description: "AI-powered voice and sales call analysis platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-[#0f0f1a]">
        <Sidebar />
        <main className="flex-1 ml-[260px] min-h-screen overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
