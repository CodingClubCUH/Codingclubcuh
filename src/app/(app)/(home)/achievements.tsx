import { getPayload } from "payload";
import configPromise from "@payload-config";
import Image from "next/image";
import { Award, Trophy, Star, ExternalLink, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function AchievementsSection() {
  try {
    const payload = await getPayload({ config: configPromise });
    
    const achievementsReq = await payload.find({
      collection: "achievements",
      limit: 6,
      sort: '-date',
    });
    const achievements = achievementsReq.docs || [];

    if (achievements.length === 0) return null;

  return (
    <section className="py-16 md:py-28 relative overflow-hidden">
      {/* Background accents */}
      <div aria-hidden className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
      <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <SectionHeading 
          title="Achievements & Milestones" 
          subtitle="Celebrating the wins, recognitions, and impact of our community." 
          badge="🏆 Achievements" 
        />
        
        {/* Trophy header accent */}
        <div className="flex items-center justify-center gap-4 my-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles size={13} />
            Hall of Fame
            <Sparkles size={13} />
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((item, idx) => {
            const Icon = item.category === 'hackathon' ? Trophy : 
                         item.category === 'award' ? Award : Star;
            
            // Different gradient tints per card for visual richness
            const tints = [
              'from-amber-500/10 via-transparent',
              'from-violet-500/8 via-transparent',
              'from-emerald-500/8 via-transparent',
              'from-blue-500/8 via-transparent',
              'from-rose-500/8 via-transparent',
              'from-amber-500/10 via-transparent',
            ];
            const tint = tints[idx % tints.length];

            const iconColors = [
              'bg-amber-500/15 text-amber-400 border-amber-500/25',
              'bg-violet-500/15 text-violet-400 border-violet-500/25',
              'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
              'bg-blue-500/15 text-blue-400 border-blue-500/25',
              'bg-rose-500/15 text-rose-400 border-rose-500/25',
            ];
            const iconColor = iconColors[idx % iconColors.length];

            return (
              <div
                key={item.id}
                className={`glass-card glass-card-hover group relative bg-gradient-to-br ${tint} rounded-3xl p-6 flex flex-col hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-400/10 transition-all duration-500 overflow-hidden`}
              >
                {/* Corner shimmer accent */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-400/5 blur-xl pointer-events-none group-hover:bg-amber-400/15 transition-colors duration-500" />

                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${iconColor} transition-transform group-hover:scale-110 duration-300 shadow-xs`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="glass-pill text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-muted-foreground">
                    {item.category.replace('-', ' ')}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg leading-tight text-foreground mb-2 group-hover:text-amber-400 transition-colors duration-300">
                  {item.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 flex-grow leading-relaxed">
                  {item.description}
                </p>
                
                {item.image && typeof item.image === 'object' && item.image.url && (
                  <div className="mt-auto relative h-32 w-full rounded-2xl overflow-hidden bg-muted mb-4 border border-border/60">
                    <Image 
                      src={item.image.url} 
                      alt={item.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/40 to-transparent" />
                  </div>
                )}
                
                <div className="flex justify-between items-center border-t border-border/50 pt-3 mt-auto">
                  <span className="text-xs font-mono text-muted-foreground">
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  {item.link && (
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-primary/80 transition-colors"
                    >
                      Details <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
  } catch (e) {
    console.error("Error loading achievements section:", e);
    return null;
  }
}
