import Image from "next/image";
import Link from "next/link";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { ArrowRight, Github, Linkedin, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { CLOUDINARY_TEAM_MEMBERS } from "@/lib/cloudinary-teams";

export default async function TeamSection() {
  try {
    const payload = await getPayload({ config: configPromise });

    const teamReq = await payload.find({
      collection: "teams",
      where: {
        showOnHome: {
          not_equals: false,
        },
        category: {
          not_equals: "teachers",
        },
      },
      limit: 50,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let teams: any[] = ((teamReq.docs || []) as any[]).filter(
      (m) =>
        m.category !== "teachers" &&
        !m.isTeacher &&
        !(typeof m.position === "string" && m.position.trim().toLowerCase() === "teacher")
    );

    if (teams.length === 0) {
      teams = CLOUDINARY_TEAM_MEMBERS.filter(
        (m) => m.category !== "teachers" && !m.isTeacher
      );
    }

    const categoryWeight: Record<string, number> = {
      faculty: 1,
      core: 2,
      technical: 3,
      design: 4,
      outreach: 5,
    };

    const getPositionWeight = (pos: string) => {
      const p = pos.toLowerCase();
      if (p.includes("patron") || p.includes("chancellor")) return 0;
      if (p.includes("coordinator")) return 1;
      if (p.includes("president")) return 2;
      if (p.includes("vice president") || p.includes("vice-president")) return 3;
      if (p.includes("lead") || p.includes("head")) return 4;
      return 5;
    };

    const sortedTeams = [...teams].sort((a, b) => {
      const catA = categoryWeight[a.category] || 99;
      const catB = categoryWeight[b.category] || 99;
      if (catA !== catB) return catA - catB;

      const posA = getPositionWeight(a.position || "");
      const posB = getPositionWeight(b.position || "");
      return posA - posB;
    });

    // Category badge colors
    const categoryStyles: Record<string, string> = {
      faculty:   'bg-amber-500/10 text-amber-400 border-amber-500/25',
      core:      'bg-primary/10 text-primary border-primary/25',
      technical: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      design:    'bg-violet-500/10 text-violet-400 border-violet-500/25',
      outreach:  'bg-blue-500/10 text-blue-400 border-blue-500/25',
    };

    return (
      <section className="py-16 md:py-28 relative overflow-hidden">
        {/* Background */}
        <div aria-hidden className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
        <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-primary/4 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <SectionHeading
            title="Meet the Team"
            subtitle="The talented minds and passionate builders who make Coding Club CUH."
            badge="👥 Our People"
          />

          {/* Team count pill */}
          <div className="flex justify-center mt-4 mb-12">
            <div className="flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full bg-card border border-border text-muted-foreground">
              <Users size={13} className="text-primary" />
              {sortedTeams.length}+ active members across all teams
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sortedTeams.map((member) => {
              const photoUrl =
                member.photo && typeof member.photo === "object" && member.photo.url
                  ? member.photo.url
                  : (typeof member.photo === "string" ? member.photo : member.photoUrl || null);

              const catStyle = categoryStyles[member.category] || 'bg-muted text-muted-foreground border-border';

              return (
                <div
                  key={member.id}
                  className="glass-card glass-card-hover group relative rounded-3xl p-5 flex flex-col items-center text-center overflow-hidden"
                >
                  {/* Hover shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-3xl" />

                  {/* Avatar */}
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted ring-2 ring-white/10 group-hover:ring-primary/40 transition-all duration-300 shadow-sm">
                      {photoUrl ? (
                        <Image
                          src={photoUrl}
                          alt={member.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl font-handjet">
                          {member.name?.[0] || "?"}
                        </div>
                      )}
                    </div>
                    {/* Online dot for core/faculty */}
                    {(member.category === 'core' || member.category === 'faculty') && (
                      <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-500 border-2 border-card" />
                    )}
                  </div>

                  {/* Name & position */}
                  <h3 className="font-bold text-sm text-foreground leading-tight group-hover:text-primary transition-colors">{member.name}</h3>
                  <p className="text-xs font-semibold text-primary mt-0.5">{member.position}</p>
                  {member.courseYear && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">{member.courseYear}</p>
                  )}

                  {/* Category badge */}
                  <div className={`glass-pill mt-3 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${catStyle}`}>
                    {member.category}
                  </div>

                  {/* Social links */}
                  {(member.github || member.linkedin) && (
                    <div className="mt-3 flex gap-2">
                      {member.github && (
                        <Link
                          href={member.github}
                          target="_blank"
                          className="glass-pill size-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-xs"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      {member.linkedin && (
                        <Link
                          href={member.linkedin}
                          target="_blank"
                          className="glass-pill size-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-xs"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles size={13} className="text-primary" />
              <span>Want to be part of the team? Join Coding Club CUH today!</span>
              <Sparkles size={13} className="text-primary" />
            </div>
            <Button asChild variant="outline" className="rounded-full gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Link href="/team" className="flex items-center gap-2">
                View Full Team Directory <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  } catch (e) {
    console.error("Error loading team section:", e);
    return null;
  }
}
