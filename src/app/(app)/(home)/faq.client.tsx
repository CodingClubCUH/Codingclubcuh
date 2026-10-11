"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Code2,
  Rocket,
  Users,
  Globe,
  Cpu,
  Lightbulb,
  Layout,
  LucideIcon,
  ChevronRight,
} from "lucide-react";
import { BorderBeam } from "@/components/magicui/border-beam";

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Code2,
  Rocket,
  Users,
  Globe,
  Cpu,
  Lightbulb,
  Layout,
};

export interface ObjectiveItem {
  id: string | number;
  title: string;
  description: string;
  icon?: string | null;
  image?: string | null;
}

export default function FaqClient({ items }: { items: ObjectiveItem[] }) {
  const [activeItemTitle, setActiveItemTitle] = useState<string>(
    items[0]?.title || "Classes By Students"
  );
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const currentItem =
    items.find((item) => item.title === activeItemTitle) || items[0];

  if (!items || items.length === 0) return null;

  const CurrentIcon =
    (currentItem?.icon && ICON_MAP[currentItem.icon]) || BookOpen;

  const hasImage =
    currentItem?.image && !imageErrors[currentItem.id || currentItem.title];

  return (
    <section className="relative py-16 md:py-28 overflow-hidden">
      {/* Background accents */}
      <div aria-hidden className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
      <div aria-hidden className="absolute top-0 right-0 w-[500px] h-[400px] rounded-full bg-primary/4 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-5xl space-y-12 px-6 md:space-y-16 relative z-10">
        {/* Section header */}
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 rounded-full border border-primary/20">
            <Rocket size={12} />
            Objectives
          </span>
          <h2 className="text-balance text-3xl md:text-4xl lg:text-5xl font-bold font-handjet tracking-wider">
            Key Objectives of<br />
            <span className="text-gradient">Coding Club</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            The main objectives and functions of the Coding Club at Central University of Haryana.
          </p>
        </div>

        {/* Interactive two-column layout */}
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12 items-start">
          {/* Left: clickable accordion-style list */}
          <div className="space-y-2">
            {items.map((item, index) => {
              const Icon = (item.icon && ICON_MAP[item.icon]) || BookOpen;
              const isActive = item.title === activeItemTitle;

              const iconColors = [
                "bg-primary/10 text-primary border-primary/20",
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                "bg-amber-500/10 text-amber-400 border-amber-500/20",
                "bg-violet-500/10 text-violet-400 border-violet-500/20",
                "bg-rose-500/10 text-rose-400 border-rose-500/20",
              ];
              const iconColor = iconColors[index % iconColors.length];

              return (
                <button
                  key={item.id || index}
                  onClick={() => setActiveItemTitle(item.title)}
                  className={`w-full text-left group relative rounded-2xl p-4 transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "glass-card border-primary/50 bg-primary/10 shadow-lg shadow-primary/10"
                      : "glass-card border-white/10 hover:border-primary/30 hover:bg-card/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs ${iconColor}`}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1">
                      <span className={`font-semibold text-sm transition-colors ${isActive ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                        {item.title}
                      </span>
                      <AnimatePresence>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line overflow-hidden"
                          >
                            {item.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <ChevronRight
                      className={`size-4 text-muted-foreground shrink-0 transition-all duration-300 ${
                        isActive ? "rotate-90 text-primary" : "group-hover:translate-x-0.5"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: animated preview panel */}
          <div className="sticky top-24">
            <div className="glass-panel relative flex overflow-hidden rounded-3xl p-2.5 shadow-2xl shadow-primary/10 border border-white/20 dark:border-white/10 ring-1 ring-primary/20">
              <div className="aspect-[4/3] bg-muted/30 relative w-full rounded-2xl overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeItemTitle}-preview`}
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="size-full overflow-hidden rounded-2xl border border-border relative"
                  >
                    {hasImage ? (
                      <>
                        <Image
                          src={currentItem.image!}
                          className="size-full object-cover object-center"
                          alt={currentItem.title}
                          width={1200}
                          height={900}
                          onError={() => {
                            setImageErrors((prev) => ({
                              ...prev,
                              [currentItem.id || currentItem.title]: true,
                            }));
                          }}
                        />
                        {/* Image overlay with title */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                          <div className="p-4">
                            <h4 className="text-white font-bold text-base font-handjet tracking-wide">{currentItem.title}</h4>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="size-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-primary/10 via-background to-card">
                        <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-4 shadow-sm">
                          <CurrentIcon className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="font-bold text-xl text-foreground font-handjet tracking-wider mb-2">
                          {currentItem.title}
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-xs line-clamp-3">
                          {currentItem.description}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <BorderBeam
                duration={6}
                size={200}
                className="from-transparent via-primary to-transparent"
              />
            </div>

            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveItemTitle(item.title)}
                  className={`rounded-full transition-all duration-300 ${
                    item.title === activeItemTitle
                      ? "w-6 h-1.5 bg-primary"
                      : "w-1.5 h-1.5 bg-border hover:bg-primary/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
