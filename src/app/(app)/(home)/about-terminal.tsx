"use client";

import { useState } from "react";
import { Terminal, Copy, Check, Play, Sparkles, Code2, Cpu } from "lucide-react";

interface TabItem {
  id: string;
  filename: string;
  language: string;
  icon: typeof Terminal;
  code: string;
  output: string[];
}

const TABS: TabItem[] = [
  {
    id: "manifesto",
    filename: "cuh-club-manifesto.ts",
    language: "typescript",
    icon: Code2,
    code: `// Coding Club Central University of Haryana
export interface ClubEcosystem {
  institution: "Central University of Haryana";
  department: "Dept. of CS & IT";
  established: 2022;
  facultyMentor: "Dr. Sunil Kumar";
  techStack: ["Next.js 15", "Python", "C++", "AI Assistant", "Payload CMS"];
  accessPolicy: "100% Free For All Students";
  activeCoders: 500;
  status: "ACTIVE_AND_EXPANDING";
}

export function joinCommunity(studentRollNo: string) {
  return {
    verified: true,
    perks: ["Peer Mentorship", "Hackathon Entry", "Verifiable Certificates"],
  };
}`,
    output: [
      "[INFO] Loading CUH Coding Club manifest...",
      "[SUCCESS] Connected to CUH Tech Network (500+ peers)",
      "[READY] Next.js 15 + AI Assistant online.",
    ],
  },
  {
    id: "bash",
    filename: "join-workflow.sh",
    language: "bash",
    icon: Terminal,
    code: `#!/usr/bin/env bash
# Quickstart script for new Coding Club CUH members

echo "🚀 Connecting to Coding Club CUH..."
git clone https://github.com/codingclubcuh/core-projects.git
cd core-projects

# Install dependencies with pnpm
pnpm install

# Launch modern development environment
pnpm dev --port 3001

echo "✨ Ready to build the future at CUH!"`,
    output: [
      "$ bash join-workflow.sh",
      "Cloning into 'core-projects'...",
      "Done in 1.4s.",
      "✓ Local server running at http://localhost:3001",
    ],
  },
  {
    id: "ai",
    filename: "ai-mentor.py",
    language: "python",
    icon: Cpu,
    code: `# CUH AI Coding Mentor Integration
from cuh_ai import CodingAssistant

assistant = CodingAssistant()

prompt = "Explain Dijkstra's algorithm for CUH campus navigation graph"
response = assistant.solve(prompt)

print("🤖 AI Mentor:", response.text[:120] + "...")`,
    output: [
      "$ python ai-mentor.py",
      "🤖 AI Mentor: Dijkstra's algorithm computes the shortest path",
      "from the CUH Academic Block to the Library in O(E + V log V)...",
      "✓ Verified optimal path calculated.",
    ],
  },
];

export function AboutTerminal() {
  const [activeTab, setActiveTab] = useState<string>("manifesto");
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const current = TABS.find((t) => t.id === activeTab) || TABS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setRunning(true);
    setShowOutput(false);
    setTimeout(() => {
      setRunning(false);
      setShowOutput(true);
    }, 600);
  };

  return (
    <div className="glass-panel rounded-3xl border border-white/15 dark:border-white/10 bg-zinc-950/80 backdrop-blur-2xl text-zinc-100 shadow-2xl shadow-primary/10 overflow-hidden font-mono text-xs ring-1 ring-white/10">
      {/* Terminal Titlebar & Tab Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-zinc-900/60 backdrop-blur-xl border-b border-white/10 text-zinc-400 gap-2">
        {/* Window controls */}
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-red-500/80 inline-block" />
          <span className="size-3 rounded-full bg-yellow-500/80 inline-block" />
          <span className="size-3 rounded-full bg-emerald-500/80 inline-block" />
        </div>

        {/* Interactive Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowOutput(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                  isActive
                    ? "bg-zinc-800 text-zinc-100 font-semibold shadow-xs border border-zinc-700/60"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                <Icon size={12} className={isActive ? "text-primary" : "text-zinc-500"} />
                <span>{tab.filename}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 transition-all cursor-pointer disabled:opacity-50"
            title="Execute script simulation"
          >
            <Play size={10} className={running ? "animate-spin" : ""} />
            <span>{running ? "Running..." : "Run"}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-4 sm:p-5 overflow-x-auto text-[11px] leading-relaxed max-h-[300px]">
        <pre className="text-zinc-300 font-mono">
          <code>{current.code}</code>
        </pre>
      </div>

      {/* Interactive Terminal Output Drawer */}
      {showOutput && (
        <div className="border-t border-zinc-800 bg-black/60 p-3.5 space-y-1 text-[11px] text-emerald-400 font-mono transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] pb-1 border-b border-zinc-800/80 mb-2">
            <span>TERMINAL OUTPUT</span>
            <span className="text-emerald-400">EXIT 0</span>
          </div>
          {current.output.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-zinc-600">&gt;</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      )}

      {/* Terminal Footer */}
      <div className="px-4 py-2.5 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <Sparkles size={11} />
          <span>CUH DEV NETWORK: LIVE</span>
        </div>
        <span className="text-zinc-500">UTF-8 • {current.language.toUpperCase()}</span>
      </div>
    </div>
  );
}
