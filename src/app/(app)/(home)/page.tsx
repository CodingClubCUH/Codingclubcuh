import HeroSection from "./hero";
import AboutSection from "./about";
import StatsSection from "./stats";
import ObjectivesSection from "./objectives";
import EventsSection from "./events";
import ProjectsSection from "./projects";
import AchievementsSection from "./achievements";
import TeamSection from "./team";
import TeachersSection from "./teachers";
import GallerySection from "./gallery";
import RecentPostsSection from "./recent-posts";
import WallOfLoveSection from "./testimonial";
import Faq from "./faq";

import { getPayload } from "payload";
import configPromise from "@payload-config";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const payload = await getPayload({ config: configPromise });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const siteSettings: any = await (payload as any).findGlobal({
    slug: 'site-settings',
  }).catch(() => null);

  const isMaintenanceActive = Boolean(siteSettings?.maintenanceMode);

  return (
    <div className="overflow-hidden relative">
      {/* Ambient glassmorphic glowing orbs for backdrop refraction */}
      <div aria-hidden className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Top-right violet/indigo glow */}
        <div className="absolute -top-[10%] -right-[10%] w-[600px] md:w-[850px] h-[600px] md:h-[850px] rounded-full bg-gradient-to-br from-indigo-500/20 via-primary/15 to-transparent blur-[140px] opacity-70" />
        {/* Middle-left cyan/blue glow */}
        <div className="absolute top-[30%] -left-[15%] w-[500px] md:w-[750px] h-[500px] md:h-[750px] rounded-full bg-gradient-to-tr from-cyan-500/15 via-blue-500/12 to-transparent blur-[150px] opacity-60" />
        {/* Middle-right purple/rose glow */}
        <div className="absolute top-[55%] -right-[12%] w-[550px] md:w-[800px] h-[550px] md:h-[800px] rounded-full bg-gradient-to-bl from-purple-500/15 via-rose-500/10 to-transparent blur-[140px] opacity-50" />
        {/* Bottom emerald/teal glow */}
        <div className="absolute bottom-[10%] left-[10%] w-[500px] md:w-[700px] h-[500px] md:h-[700px] rounded-full bg-gradient-to-tr from-emerald-500/12 via-teal-500/10 to-transparent blur-[160px] opacity-50" />
      </div>

      {isMaintenanceActive && (
        <div className="glass-panel border-b border-amber-500/30 text-amber-200 py-3.5 px-4 text-center text-sm sticky top-16 z-40 flex items-center justify-center gap-2.5 shadow-lg shadow-amber-950/20">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 animate-pulse" />
          <span className="font-bold text-amber-300 tracking-wide">MAINTENANCE NOTICE:</span>
          <span className="text-amber-100/90">
            {siteSettings?.maintenanceMessage ||
              "The student portal is currently undergoing scheduled maintenance. Student login is temporarily disabled."}
          </span>
        </div>
      )}
      <HeroSection />

      <div className="relative">
        {/* Subtle section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <AboutSection />
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <StatsSection />

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <ObjectivesSection />

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <EventsSection />

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <ProjectsSection />

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <AchievementsSection />

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <TeamSection />

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <TeachersSection />

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <GallerySection />

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <RecentPostsSection />

      <WallOfLoveSection />

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <Faq />
    </div>
  );
}
