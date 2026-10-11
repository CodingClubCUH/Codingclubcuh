import { Code2, Cpu, Globe, Layout, Lightbulb, Users, ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import Link from "next/link";

const objectives = [
  {
    title: "Peer-to-Peer Learning",
    description: "Learn algorithms, tools, and languages directly from senior developers in a collaborative, supportive setting.",
    icon: Users,
    colorClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    tag: "Community",
    href: "/about",
  },
  {
    title: "Modern Web Engineering",
    description: "Master modern production stacks like Next.js 15, React 19, TypeScript, Tailwind CSS, and REST/GraphQL APIs.",
    icon: Globe,
    colorClass: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    tag: "Full-Stack",
    href: "/courses",
  },
  {
    title: "DSA & Algorithmic Problem Solving",
    description: "Crack technical interviews and competitive programming challenges with structured practice and logic building.",
    icon: Code2,
    colorClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    tag: "Interviews",
    href: "/courses",
  },
  {
    title: "AI, ML & Generative Tech",
    description: "Explore LLMs, intelligent prompt engineering, model tuning, and hands-on AI application development.",
    icon: Cpu,
    colorClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    tag: "Emerging Tech",
    href: "/courses",
  },
  {
    title: "Product Design & Modern UI/UX",
    description: "Craft stunning, accessible user interfaces with Figma, motion systems, and design tokens before writing code.",
    icon: Layout,
    colorClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    tag: "Design",
    href: "/about",
  },
  {
    title: "Hackathons & Live Sprints",
    description: "Build real products under pressure, pitch to industry judges, and win awards in campus and national hackathons.",
    icon: Lightbulb,
    colorClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    tag: "Competitions",
    href: "/events",
  },
];

export default function ObjectivesSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <SectionHeading 
          title="What We Do & Specialize In" 
          subtitle="Explore our core domains, technical masterclasses, and community programs." 
          badge="Specializations" 
          align="center"
        />
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          {objectives.map((obj, i) => {
            const Icon = obj.icon;
            return (
              <Link
                key={i}
                href={obj.href}
                className="glass-card glass-card-hover group relative p-7 rounded-3xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`size-12 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs ${obj.colorClass}`}>
                      <Icon className="size-6" />
                    </div>
                    <span className="glass-pill text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-muted-foreground group-hover:border-primary/40 group-hover:text-primary transition-colors">
                      {obj.tag}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{obj.title}</span>
                    <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {obj.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-border/40 flex items-center gap-1 text-[11px] font-semibold text-primary/80 group-hover:text-primary">
                  <span>Explore domain</span>
                  <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
