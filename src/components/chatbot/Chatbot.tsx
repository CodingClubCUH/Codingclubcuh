"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  ChevronDown,
  Loader2,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Download,
  Code2,
  GraduationCap,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessageMarkdown } from "./ChatMessageMarkdown";
import { QUICK_PROMPTS } from "@/lib/chatbot-data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestedFollowUps?: string[];
}

type PersonaType = "mentor" | "guide" | "coach";

const STORAGE_KEY = "cccuh_chat_history";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasUnreadPrompt, setHasUnreadPrompt] = useState(true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [persona, setPersona] = useState<PersonaType>("mentor");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentModelName, setCurrentModelName] = useState<string | null>("AI Assistant");

  // Voice speech-to-text state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Play synthesized audio chime using Web Audio API
  const playChime = (type: "send" | "receive") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const now = ctx.currentTime;

      if (type === "send") {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else {
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18); // D6
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Audio policy
    }
  };

  // Load chat history
  useEffect(() => {
    try {
      const savedChat = sessionStorage.getItem(STORAGE_KEY);
      if (savedChat) {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          setHasUnreadPrompt(false);
          return;
        }
      }
    } catch {
      // storage exception
    }

    const welcomeMsg: Message = {
      id: "welcome-1",
      role: "assistant",
      content: `👋 **Welcome to Coding Club CUH!**

I am your **Coding Club CUH Assistant**. You can ask me **anything** — whether you need help with **programming & debugging in any language**, project ideas, career roadmaps, or information about our **workshops, events, courses, and certificates**!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestedFollowUps: [
        "Explain binary search with Python code",
        "How do I verify my certificate?",
        "Give me a Web Development roadmap",
        "What workshops and events are coming up?",
      ],
    };
    setMessages([welcomeMsg]);
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // storage quota
      }
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setHasUnreadPrompt(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    }
  }, [isOpen]);

  // Global event listener to open chat from Command Menu or buttons
  useEffect(() => {
    const handleOpenChatEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.prompt) {
        setTimeout(() => {
          handleSendMessage(customEvent.detail.prompt);
        }, 300);
      }
    };

    window.addEventListener("cccuh:open_chat", handleOpenChatEvent);
    return () => window.removeEventListener("cccuh:open_chat", handleOpenChatEvent);
  }, []);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
          .SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

      if (SpeechRecognition) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognition = new (SpeechRecognition as any)();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((result: any) => result[0].transcript)
            .join("");
          setInput(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = recognitionRef.current as any;

    if (isListening) {
      rec.stop();
      setIsListening(false);
    } else {
      try {
        rec.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    if (isListening && recognitionRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recognitionRef.current as any).stop();
      setIsListening(false);
    }

    setInput("");

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    playChime("send");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          persona,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();
      if (data.model) {
        setCurrentModelName(data.model);
      }

      const replyContent =
        data.message?.content ||
        "I could not process that request. Feel free to explore our [Events](/events) or [Courses](/courses)!";

      const botMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedFollowUps: data.suggestedFollowUps || [],
      };

      setMessages((prev) => [...prev, botMessage]);
      playChime("receive");
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          "⚠️ I'm having trouble connecting right now. Please explore our **[Certificate Verification](/verify)**, **[Courses](/courses)**, or contact us at **[codingclub@cuh.ac.in](mailto:codingclub@cuh.ac.in)**.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    const welcomeMsg: Message = {
      id: `welcome-${Date.now()}`,
      role: "assistant",
      content: `👋 Chat reset! How can I assist you with **Coding Club CUH** today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestedFollowUps: [
        "How do I verify my certificate?",
        "What courses are available?",
        "Give me a Web Development roadmap",
        "How can I join the club?",
      ],
    };
    setMessages([welcomeMsg]);
  };

  const exportChatAsMarkdown = () => {
    const thread = messages
      .map((m) => `### ${m.role === "user" ? "👤 User" : "🤖 Coding Club AI"} (${m.timestamp})\n\n${m.content}\n`)
      .join("\n---\n\n");
    const blob = new Blob([thread], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coding-club-cuh-chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating callout bubble when closed */}
      <AnimatePresence>
        {!isOpen && hasUnreadPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-3 flex items-center gap-2 bg-card/95 backdrop-blur-md border border-primary/30 text-foreground px-4 py-2.5 rounded-full shadow-xl shadow-primary/10 text-xs sm:text-sm font-medium cursor-pointer hover:border-primary transition-all duration-300"
            onClick={() => setIsOpen(true)}
          >
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Need help? Ask <strong>CUH AI Bot</strong> ✨</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setHasUnreadPrompt(false);
              }}
              className="ml-1 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
              aria-label="Dismiss prompt"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`mb-3 ${
              isExpanded
                ? "w-[calc(100vw-32px)] sm:w-[680px] max-w-[700px] h-[680px] max-h-[88vh]"
                : "w-[calc(100vw-32px)] sm:w-[420px] max-w-[430px] h-[590px] max-h-[82vh]"
            } bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-foreground transition-all duration-300`}
          >
            {/* Header */}
            <div className="relative px-4 py-3 bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-primary/15 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative size-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                  <Bot className="size-5 text-primary" />
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-sm leading-tight text-foreground">
                      Coding Club CUH
                    </h3>
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-primary/15 text-primary border border-primary/20">
                      {currentModelName || "AI"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online • CS & IT Mentor
                  </p>
                </div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center gap-1">
                {/* Expand / Minimize Window toggle */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? "Collapse canvas" : "Expand canvas"}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors hidden sm:inline-flex"
                  aria-label="Toggle expansion"
                >
                  {isExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                </button>
                {/* Export Chat */}
                <button
                  onClick={exportChatAsMarkdown}
                  title="Export chat as Markdown"
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
                  aria-label="Export chat"
                >
                  <Download className="size-4" />
                </button>
                {/* Sound */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? "Mute chimes" : "Enable chimes"}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
                  aria-label="Toggle sound"
                >
                  {soundEnabled ? (
                    <Volume2 className="size-4" />
                  ) : (
                    <VolumeX className="size-4 text-muted-foreground/60" />
                  )}
                </button>
                {/* Reset */}
                <button
                  onClick={handleClearChat}
                  title="Clear conversation"
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
                  aria-label="Clear chat"
                >
                  <RotateCcw className="size-4" />
                </button>
                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
                  aria-label="Close chat"
                >
                  <ChevronDown className="size-5" />
                </button>
              </div>
            </div>

            {/* Persona Switcher Bar */}
            <div className="px-3 py-1.5 bg-muted/40 border-b border-border/60 flex items-center justify-between text-xs overflow-x-auto">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider shrink-0 mr-2">
                Mode:
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPersona("mentor")}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${
                    persona === "mentor"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  <Code2 className="size-3" />
                  <span>Code Mentor</span>
                </button>
                <button
                  onClick={() => setPersona("guide")}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${
                    persona === "guide"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  <GraduationCap className="size-3" />
                  <span>Club Guide</span>
                </button>
                <button
                  onClick={() => setPersona("coach")}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${
                    persona === "coach"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  <Trophy className="size-3" />
                  <span>Hackathon Coach</span>
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scroll-smooth">
              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <div
                    key={message.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`flex gap-2.5 max-w-[90%] ${
                        isUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`size-6 rounded-full shrink-0 flex items-center justify-center mt-1 text-[11px] ${
                          isUser
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "bg-muted text-primary border border-border"
                        }`}
                      >
                        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 shadow-sm text-sm ${
                          isUser
                            ? "bg-primary text-primary-foreground rounded-tr-xs"
                            : "bg-muted/60 text-foreground border border-border/80 rounded-tl-xs"
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <ChatMessageMarkdown content={message.content} />
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <span className="text-[10px] text-muted-foreground/60 mt-1 px-8">
                      {message.timestamp}
                    </span>

                    {/* Suggested follow-up prompt chips */}
                    {!isUser && message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 pl-8 max-w-[95%]">
                        {message.suggestedFollowUps.map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleSendMessage(prompt)}
                            disabled={isLoading}
                            className="text-left text-xs bg-card hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border rounded-full px-2.5 py-1 transition-all duration-200"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing / Loading indicator */}
              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="size-6 rounded-full bg-muted text-primary border border-border flex items-center justify-center shrink-0 mt-1">
                    <Bot className="size-3.5" />
                  </div>
                  <div className="bg-muted/60 border border-border/80 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-1.5 shadow-sm">
                    <span className="size-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
                    <span className="size-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
                    <span className="size-2 rounded-full bg-primary/70 animate-bounce" />
                    <span className="text-xs text-muted-foreground ml-1.5 font-medium">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Voice Listening Bar */}
            {isListening && (
              <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 flex items-center justify-between text-xs text-red-400 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-red-500" />
                  <span>Listening... Speak your question</span>
                </div>
                <button
                  onClick={toggleVoiceInput}
                  className="font-semibold underline text-red-300"
                >
                  Stop
                </button>
              </div>
            )}

            {/* Quick Prompts bar (when conversation is fresh) */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-border/60 bg-muted/20">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Suggested Prompts
                </p>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {QUICK_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.query)}
                      disabled={isLoading}
                      className="shrink-0 text-xs bg-background hover:bg-primary/15 text-foreground hover:text-primary border border-border hover:border-primary/40 rounded-full px-2.5 py-1 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 border-t border-border bg-card flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isListening
                      ? "Listening to voice..."
                      : persona === "mentor"
                      ? "Ask any coding, DSA, or architecture question..."
                      : persona === "guide"
                      ? "Ask about events, certificates, or team..."
                      : "Ask about hackathon ideas or career prep..."
                  }
                  disabled={isLoading}
                  className="w-full bg-muted/60 text-foreground placeholder:text-muted-foreground text-sm rounded-full pl-4 pr-10 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />

                {/* Voice Dictation button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  title={isListening ? "Stop listening" : "Speak question (Voice input)"}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                    isListening
                      ? "text-red-500 bg-red-500/20 animate-pulse"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                </button>
              </div>

              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="size-10 rounded-full shrink-0 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </form>

            {/* Bottom mini footer */}
            <div className="px-4 py-1 bg-muted/30 border-t border-border/40 text-center flex items-center justify-between text-[10px] text-muted-foreground/70">
              <span>Ctrl+K for Command Menu</span>
              <span className="flex items-center gap-1">
                <Sparkles className="size-2.5 text-primary" />
                Coding Club CUH
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative size-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/25 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-primary/30 transition-shadow duration-300 group"
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-60 pointer-events-none" />
        {isOpen ? (
          <X className="size-6 transition-transform duration-200 group-hover:rotate-90" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageSquare className="size-6" />
            <Sparkles className="size-3.5 absolute -top-1.5 -right-2 text-yellow-300 animate-pulse" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
