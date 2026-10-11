import { SectionHeading } from "@/components/ui/section-heading";
import { Target, Users, Shield, Rocket } from "lucide-react";
import { AboutTerminal } from "./about-terminal";

export default function AboutSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <div className="grid md:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Mission & Model */}
          <div className="md:col-span-7">
            <SectionHeading
              title="Built by Students, Engineered for Impact"
              badge="About Our Community"
              align="left"
              className="mb-6"
            />
            <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
              Established in 2022 under the mentorship of <strong className="text-foreground">Dr. Sunil Kumar</strong> (Dept. of CS & IT), Coding Club CUH bridges academic coursework and modern software engineering through peer learning, open-source building, and competitive programming.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass-card glass-card-hover p-5 rounded-3xl group">
                <div className="size-11 rounded-2xl bg-primary/15 border border-primary/25 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-xs">
                  <Target className="size-5" />
                </div>
                <h3 className="font-bold text-foreground text-base mb-1.5 group-hover:text-primary transition-colors">
                  Core Mission
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Cultivating a high-velocity coding culture where every student masters practical programming and modern dev tools.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-5 rounded-3xl group">
                <div className="size-11 rounded-2xl bg-violet-500/15 border border-violet-500/25 text-violet-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-xs">
                  <Users className="size-5" />
                </div>
                <h3 className="font-bold text-foreground text-base mb-1.5 group-hover:text-violet-400 transition-colors">
                  Peer-to-Peer Learning
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Senior student mentors conduct hands-on classes in Web Dev, Python, C++, and DSA to elevate juniors.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-5 rounded-3xl group">
                <div className="size-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-xs">
                  <Shield className="size-5" />
                </div>
                <h3 className="font-bold text-foreground text-base mb-1.5 group-hover:text-emerald-400 transition-colors">
                  Verified Credentials
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Cryptographically verifiable completion certificates with instant QR verification and high-res PDF generation.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-5 rounded-3xl group">
                <div className="size-11 rounded-2xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-xs">
                  <Rocket className="size-5" />
                </div>
                <h3 className="font-bold text-foreground text-base mb-1.5 group-hover:text-amber-400 transition-colors">
                  Hackathons & Sprints
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Intensive campus hackathons where participants build real solutions, compete for awards, and build portfolios.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Code Terminal Bento */}
          <div className="md:col-span-5">
            <AboutTerminal />
          </div>
        </div>
      </div>
    </section>
  );
}
