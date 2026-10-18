"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Command,
  ArrowRight,
  ShieldCheck,
  Calendar,
  BookOpen,
  Users,
  Info,
  Mail,
  Sparkles,
  Sun,
  Moon,
  Github,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "Navigation" | "AI Assistant" | "Actions" | "Community";
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

export function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const navigateTo = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const openAIChatWithPrompt = (prompt: string) => {
    setIsOpen(false);
    // Dispatch custom event to open chatbot and send query
    window.dispatchEvent(new CustomEvent("cccuh:open_chat", { detail: { prompt } }));
  };

  const commandItems: CommandItem[] = [
    // Navigation
    {
      id: "nav-verify",
      title: "Verify Certificate",
      subtitle: "Instant cryptographic credential lookup & PDF download",
      category: "Navigation",
      icon: <ShieldCheck className="size-4 text-emerald-400" />,
      action: () => navigateTo("/verify"),
      keywords: ["certificate", "credential", "verify", "pdf"],
    },
    {
      id: "nav-courses",
      title: "Courses & Bootcamps",
      subtitle: "Hands-on masterclasses in Python, Web Dev, DSA",
      category: "Navigation",
      icon: <BookOpen className="size-4 text-blue-400" />,
      action: () => navigateTo("/courses"),
      keywords: ["courses", "learn", "classes", "bootcamp"],
    },
    {
      id: "nav-events",
      title: "Events & Hackathons",
      subtitle: "Upcoming campus sprints, code talks, workshops",
      category: "Navigation",
      icon: <Calendar className="size-4 text-violet-400" />,
      action: () => navigateTo("/events"),
      keywords: ["events", "hackathon", "workshops", "schedule"],
    },
    {
      id: "nav-team",
      title: "Meet the Team",
      subtitle: "Faculty mentors, core committee, student instructors",
      category: "Navigation",
      icon: <Users className="size-4 text-amber-400" />,
      action: () => navigateTo("/team"),
      keywords: ["team", "mentors", "leadership", "dr sunil"],
    },
    {
      id: "nav-about",
      title: "About Coding Club CUH",
      subtitle: "Our mission, history, and community culture",
      category: "Navigation",
      icon: <Info className="size-4 text-cyan-400" />,
      action: () => navigateTo("/about"),
      keywords: ["about", "mission", "vision"],
    },
    {
      id: "nav-contact",
      title: "Contact & Location",
      subtitle: "Reach out to coordinators or visit Dept of CS & IT",
      category: "Navigation",
      icon: <Mail className="size-4 text-rose-400" />,
      action: () => navigateTo("/contact"),
      keywords: ["contact", "email", "address", "help"],
    },

    // AI Prompts
    {
      id: "ai-roadmap",
      title: "Ask AI: Modern Web Dev Roadmap",
      subtitle: "Get step-by-step guidance for full-stack engineering",
      category: "AI Assistant",
      icon: <Sparkles className="size-4 text-indigo-400" />,
      action: () => openAIChatWithPrompt("Give me a complete modern Web Development roadmap for 2026"),
      keywords: ["roadmap", "web", "frontend", "backend"],
    },
    {
      id: "ai-dsa",
      title: "Ask AI: Explain Two Sum Algorithm",
      subtitle: "Get code and time complexity walkthrough",
      category: "AI Assistant",
      icon: <Sparkles className="size-4 text-indigo-400" />,
      action: () => openAIChatWithPrompt("Explain the optimal Two Sum solution in Python with time complexity"),
      keywords: ["two sum", "algorithm", "dsa", "leetcode"],
    },
    {
      id: "ai-verify-help",
      title: "Ask AI: How to verify a certificate",
      subtitle: "Step-by-step guide to certificate credentials",
      category: "AI Assistant",
      icon: <Sparkles className="size-4 text-indigo-400" />,
      action: () => openAIChatWithPrompt("How do I verify my certificate and download the PDF?"),
      keywords: ["verify certificate help"],
    },

    // Actions
    {
      id: "action-theme",
      title: theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme",
      subtitle: "Toggle between high-contrast dark and modern light",
      category: "Actions",
      icon: theme === "dark" ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-blue-400" />,
      action: () => {
        setTheme(theme === "dark" ? "light" : "dark");
        setIsOpen(false);
      },
      keywords: ["theme", "dark", "light", "mode"],
    },

    // Community
    {
      id: "comm-github",
      title: "Coding Club CUH GitHub",
      subtitle: "Open-source campus projects & repositories",
      category: "Community",
      icon: <Github className="size-4 text-zinc-300" />,
      action: () => {
        window.open("https://github.com/codingclubcuh", "_blank");
        setIsOpen(false);
      },
      keywords: ["github", "repos", "open source"],
    },
  ];

  const filteredItems = commandItems.filter((item) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    const matchesTitle = item.title.toLowerCase().includes(query);
    const matchesSub = item.subtitle?.toLowerCase().includes(query);
    const matchesKeywords = item.keywords?.some((k) => k.toLowerCase().includes(query));
    return matchesTitle || matchesSub || matchesKeywords;
  });

  // Handle arrow key navigation
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDownInMenu = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      } else if (search.trim()) {
        // Fallback: If typed something custom, pass directly to AI chat!
        openAIChatWithPrompt(search.trim());
      }
    }
  };

  return (
    <>
      {/* Trigger button component for navbar or floating quick access */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground bg-muted/60 hover:bg-muted border border-border/80 hover:border-primary/40 transition-all shadow-sm group"
        title="Command Menu (Ctrl+K)"
        aria-label="Open Command Menu"
      >
        <Search className="size-3.5 group-hover:text-primary transition-colors flex-shrink-0" />
        <span className="hidden xl:inline">Search or ask AI...</span>
        <span className="inline xl:hidden">Search...</span>
        <kbd className="inline-flex items-center gap-0.5 text-[10px] bg-background/80 px-1.5 py-0.5 rounded border border-border font-mono text-muted-foreground flex-shrink-0">
          <Command className="size-2.5" /> K
        </kbd>
      </button>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative w-full max-w-xl bg-card/95 backdrop-blur-xl border border-border/90 rounded-2xl shadow-2xl overflow-hidden text-foreground flex flex-col z-10"
              onKeyDown={handleKeyDownInMenu}
            >
              {/* Search Bar */}
              <div className="relative flex items-center px-4 py-3.5 border-b border-border">
                <Search className="size-5 text-muted-foreground mr-3 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type a command, page name, or question for AI..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors ml-2"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "hover:bg-muted/50 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-primary/20" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <span>{item.title}</span>
                              <span className="text-[10px] text-muted-foreground font-normal px-1.5 py-0.2 rounded bg-muted">
                                {item.category}
                              </span>
                            </div>
                            {item.subtitle && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                        <ArrowRight
                          className={`size-4 transition-transform ${
                            isSelected ? "translate-x-0.5 opacity-100" : "opacity-0"
                          }`}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div
                    onClick={() => openAIChatWithPrompt(search.trim())}
                    className="p-6 text-center cursor-pointer hover:bg-muted/40 rounded-xl transition-colors"
                  >
                    <Sparkles className="size-8 text-primary mx-auto mb-2 animate-pulse" />
                    <p className="text-sm font-semibold text-foreground">
                      Ask AI about &ldquo;{search}&rdquo;
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Press <kbd className="px-1 py-0.5 rounded bg-muted border border-border">Enter</kbd> to launch live AI tutor
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-muted/30 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>
                    <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono">↑↓</kbd> Navigate
                  </span>
                  <span>
                    <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono">↵</kbd> Select
                  </span>
                  <span>
                    <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono">esc</kbd> Close
                  </span>
                </div>
                <span>Coding Club CUH</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
