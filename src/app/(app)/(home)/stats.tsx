"use client";

import { AnimatedCounter } from "@/components/ui/animated-counter";
import { SectionHeading } from "@/components/ui/section-heading";
import Image from "next/image";
import { Users, Calendar, Code2, Sparkles, Award, Quote, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function StatsSection() {
  const stats = [
    {
      value: 500,
      label: "Active Coders",
      sublabel: "Across CUH departments",
      suffix: "+",
      icon: Users,
      color: "from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30",
    },
    {
      value: 10,
      label: "Events & Hackathons",
      sublabel: "Competitive sprints",
      suffix: "+",
      icon: Calendar,
      color: "from-violet-500/20 to-purple-500/10 text-violet-400 border-violet-500/30",
    },
    {
      value: 15,
      label: "Open Source Projects",
      sublabel: "Campus web & software tools",
      suffix: "+",
      icon: Code2,
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      value: 20,
      label: "Workshops Held",
      sublabel: "Peer-led masterclasses",
      suffix: "+",
      icon: Sparkles,
      color: "from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30",
    },
  ];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <SectionHeading
          title="Empowering the Next Generation of Engineers"
          subtitle="Igniting a passion for programming since 2022 — learn, build, and innovate with CUH's student-led tech ecosystem."
          align="center"
        />

        {/* Bento Stats Row */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16 mt-12">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="glass-card glass-card-hover group relative p-6 rounded-3xl flex flex-col justify-between cursor-default"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`size-12 rounded-2xl bg-gradient-to-br ${stat.color} border flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs`}>
                    <Icon className="size-6" />
                  </div>
                  <span className="glass-pill text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-muted-foreground">
                    Verified
                  </span>
                </div>

                <div>
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    className="text-4xl md:text-5xl font-bold font-handjet text-foreground tracking-wide block"
                    duration={2.5}
                  />
                  <h4 className="mt-1 font-semibold text-foreground text-sm">{stat.label}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.sublabel}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Split Bento: Excellence & Faculty Spotlight */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="grid gap-8 md:grid-cols-12 items-stretch"
        >
          <div className="md:col-span-5 flex flex-col justify-between space-y-6">
            <div className="glass-card rounded-3xl p-8 shadow-lg flex flex-col justify-between h-full">
              <h3 className="text-2xl font-bold font-handjet text-foreground tracking-wide mb-3">
                Peer-Driven Innovation Model
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Shaping the future of student engineers through coding classes, hackathons, and real-world system design. Our senior-to-junior mentoring loop ensures no learner is left behind.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-pill p-4 rounded-2xl">
                  <span className="text-3xl font-bold font-handjet text-primary block">3+</span>
                  <p className="text-xs font-medium text-muted-foreground mt-1">Years of Legacy</p>
                </div>
                <div className="glass-pill p-4 rounded-2xl">
                  <span className="text-3xl font-bold font-handjet text-primary block">50+</span>
                  <p className="text-xs font-medium text-muted-foreground mt-1">Student Mentors</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="glass-panel h-full relative rounded-3xl p-8 shadow-xl flex flex-col justify-between border border-white/20 dark:border-white/10 ring-1 ring-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div className="glass-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-primary">
                  <Award size={13} />
                  <span>Faculty Leadership & Guidance</span>
                </div>
                <Quote className="size-8 text-primary/20" />
              </div>

              <blockquote className="my-4">
                <p className="text-base md:text-lg font-medium leading-relaxed text-foreground/90 italic">
                  &ldquo;The Coding Club was established with a vision to spark curiosity and passion for programming among students of CUH. Together, we are cultivating a community of creators and innovators who will lead the digital future.&rdquo;
                </p>
              </blockquote>

              <div className="flex items-center gap-4 pt-6 border-t border-border/60 mt-auto">
                <div className="relative">
                  <Image
                    alt="Dr. Sunil Kumar"
                    className="size-14 rounded-2xl border-2 border-primary/40 object-cover shadow-md"
                    src="https://res.cloudinary.com/khxwr1df/image/upload/v1789927151/codingclub/teams/coordinators/dr_sunil_kumar.jpg"
                    loading="lazy"
                    width={120}
                    height={120}
                  />
                  <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center text-white">
                    <CheckCircle2 size={10} />
                  </span>
                </div>
                <div>
                  <cite className="block font-bold text-foreground text-base not-italic leading-tight">
                    Dr. Sunil Kumar
                  </cite>
                  <span className="text-xs text-muted-foreground font-medium">
                    Faculty Coordinator & Assistant Professor, Dept. of CS & IT
                  </span>
                  <p className="text-[11px] text-primary font-medium mt-0.5">
                    Central University of Haryana
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
