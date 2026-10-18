"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, UserPlus, Sparkles, Code2, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { CarouselPlugin } from "./carousel";
import { BorderBeam } from "@/components/magicui/border-beam";
import { FlipWords } from "@/components/ui/flip-words";

export default function HeroSection() {
  const handleOpenAi = () => {
    window.dispatchEvent(
      new CustomEvent("cccuh:open_chat", {
        detail: { prompt: "Hello! Tell me about Coding Club CUH and what projects or bootcamps I can join." },
      })
    );
  };

  return (
    <main className="overflow-hidden relative pt-24 pb-16 lg:pt-36 lg:pb-28">
      {/* Dot grid background */}
      <div aria-hidden className="absolute inset-0 dot-grid opacity-50" />

      {/* Radial glow */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] pointer-events-none"
      />

      <section className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center sm:mx-auto max-w-4xl">
          {/* Announcement pill */}
          <Link
            href="/events"
            className="glass-pill group mx-auto flex w-fit items-center gap-3 rounded-full p-1 pl-4 hover:border-primary/50 transition-all duration-300 mb-8 shadow-md hover:shadow-primary/10 hover:scale-[1.02]"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="text-foreground text-sm font-medium">
              See Upcoming Events & Hackathons
            </span>
            <span className="block h-4 w-px bg-border/60" />
            <div className="bg-primary/15 group-hover:bg-primary/25 size-7 overflow-hidden rounded-full transition-colors duration-300 flex items-center justify-center">
              <ArrowRight className="size-3.5 text-primary" />
            </div>
          </Link>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-handjet font-bold tracking-tight text-gradient leading-[1.1]">
            CODING CLUB CUH
          </h1>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-1 text-xl md:text-3xl font-semibold text-muted-foreground tracking-wide">
            <span>Empowering students with</span>
            <FlipWords
              words={["Open Source", "Competitive Coding", "Hackathons", "Tech Leadership", "Peer Innovation"]}
              className="font-bold text-foreground dark:text-white"
            />
          </div>

          <TextEffect
            per="line"
            preset="fade-in-blur"
            speedSegment={0.3}
            delay={0.3}
            as="p"
            className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            {`Founded in 2022, Coding Club CUH is the campus hotspot for coding, creativity, and cutting-edge tech. We fuel a culture of programming, innovation, and peer-to-peer learning.`}
          </TextEffect>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 h-12 text-base font-semibold w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]"
            >
              <Link href="/auth/signup">
                <UserPlus className="w-5 h-5" />
                <span>Join Coding Club</span>
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="glass-pill rounded-full px-8 h-12 text-base font-semibold w-full sm:w-auto gap-2 hover:border-primary/50 hover:bg-primary/10 transition-all hover:scale-[1.02]"
            >
              <Link href="/events">
                <CalendarDays className="w-5 h-5" />
                <span>Explore Events</span>
              </Link>
            </Button>
          </div>

          {/* Hybrid interactive highlight pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <button
              onClick={handleOpenAi}
              className="glass-pill flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:border-indigo-400/50 hover:scale-105 transition-all cursor-pointer group"
              title="Launch AI Coding Assistant"
            >
              <Sparkles className="size-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span className="font-medium text-foreground">AI Coding Assistant</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-primary/20 text-primary uppercase">
                Interactive
              </span>
            </button>

            <Link
              href="/courses"
              className="glass-pill flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:border-emerald-500/50 hover:scale-105 transition-all text-foreground"
            >
              <Terminal className="size-3.5 text-emerald-400" />
              <span className="font-medium">Peer-Led Bootcamps</span>
            </Link>

            <Link
              href="/verify"
              className="glass-pill flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:border-blue-500/50 hover:scale-105 transition-all text-foreground"
            >
              <Code2 className="size-3.5 text-blue-400" />
              <span className="font-medium">Instant Certificate Verification</span>
            </Link>
          </div>
        </div>

        {/* Image showcase */}
        <div className="relative mt-16 md:mt-24 overflow-hidden px-2 z-20">
          <div
            aria-hidden
            className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
          />
          <div className="glass-panel relative mx-auto max-w-5xl overflow-hidden rounded-3xl p-2.5 shadow-2xl shadow-primary/15 aspect-15/8 glow-hover border border-white/20 dark:border-white/10 ring-1 ring-primary/20">
            <BorderBeam size={360} duration={14} delay={0} colorFrom="#3b82f6" colorTo="#8b5cf6" />
            <CarouselPlugin />
          </div>
        </div>
      </section>
    </main>
  );
}
