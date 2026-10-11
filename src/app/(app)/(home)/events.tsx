import Image from "next/image";
import Link from "next/link";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { ArrowRight, Calendar, MapPin, Clock, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getEffectiveEventStatus, sortEvents } from "@/payload/utilities/eventStatus";

export default async function EventsSection() {
  try {
    const payload = await getPayload({ config: configPromise });
    
    const eventsReq = await payload.find({
      collection: "events",
      limit: 10,
      sort: '-date',
    });
    const cmsEvents = eventsReq.docs || [];

    const fallbackEvents = [
      {
        id: 'c_python_class',
        title: 'C & Python Programming Masterclass',
        date: '2026-04-05T10:00:00.000Z',
        location: 'Lab 3, Dept of CSE, CUH',
        startTime: '10:00 AM',
        shortDescription: 'Comprehensive hands-on coding session covering foundational concepts in C and problem solving with Python.',
        status: 'completed',
        coverPhoto: {
          url: 'https://res.cloudinary.com/azzisskq/image/upload/v1789927154/codingclub/events/coding-class/c_python_masterclass.jpg',
        },
      },
      {
        id: 'fullstack_web_dev',
        title: 'Full-Stack Web Development Workshop',
        date: '2026-04-18T14:00:00.000Z',
        location: 'Seminar Hall, Academic Block 1, CUH',
        startTime: '2:00 PM',
        shortDescription: 'Learn modern web engineering with Next.js, Tailwind CSS, and APIs from student mentors.',
        status: 'completed',
        coverPhoto: {
          url: 'https://res.cloudinary.com/azzisskq/image/upload/v1789927154/codingclub/events/workshops/fullstack_web_dev.jpg',
        },
      },
      {
        id: 'annual_hackathon',
        title: 'CUH Hackathon & Code Sprint',
        date: '2026-05-12T09:00:00.000Z',
        location: 'Central University of Haryana',
        startTime: '9:00 AM',
        shortDescription: 'Campus-wide hackathon where students build innovative software solutions and win awards.',
        status: 'completed',
        coverPhoto: {
          url: 'https://res.cloudinary.com/azzisskq/image/upload/v1789927159/codingclub/gallery/2026/hackathon_session_1.jpg',
        },
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawEvents: any[] = cmsEvents.length > 0 ? cmsEvents : fallbackEvents;
    const events = sortEvents(rawEvents).slice(0, 3);

  return (
    <section className="py-16 md:py-28 relative overflow-hidden">
      {/* Subtle grid bg */}
      <div aria-hidden className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      {/* Glow blobs */}
      <div aria-hidden className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div aria-hidden className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-14 gap-6">
          <SectionHeading 
            title="Events & Workshops" 
            subtitle="Hands-on sessions, hackathons, and real-world coding experiences." 
            badge="📅 Events" 
            align="left" 
          />
          <Button asChild variant="outline" className="hidden sm:flex rounded-full border-border hover:border-primary/50 hover:bg-primary/5 transition-all gap-2">
            <Link href="/events">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
        
        {/* Staggered bento-style event grid */}
        <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
          {events.map((event, idx) => {
            const date = new Date(event.date);
            const effectiveStatus = getEffectiveEventStatus(event);

            let coverUrl: string | null = null;
            if (event.coverPhoto && typeof event.coverPhoto === 'object') {
              coverUrl = event.coverPhoto.url || null;
              if (coverUrl && coverUrl.startsWith('/api/media/file/') && event.coverPhoto.filename) {
                const folder = event.coverPhoto.folder || 'events/hackathon';
                coverUrl = `https://res.cloudinary.com/azzisskq/image/upload/codingclub/${folder}/${event.coverPhoto.filename}`;
              }
            } else if (typeof event.coverPhoto === 'string') {
              coverUrl = event.coverPhoto;
            } else if (event.coverPhotoUrl) {
              coverUrl = event.coverPhotoUrl;
            }

            if (!coverUrl) {
              coverUrl = 'https://res.cloudinary.com/azzisskq/image/upload/v1789927159/codingclub/gallery/2026/hackathon_session_1.jpg';
            }

            const statusConfig = {
              upcoming: {
                dot: 'bg-primary animate-pulse',
                badge: 'bg-gradient-to-r from-primary to-accent text-white border-transparent',
                label: '🚀 Upcoming',
              },
              ongoing: {
                dot: 'bg-amber-400 animate-pulse',
                badge: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
                label: '⚡ Live Now',
              },
              completed: {
                dot: 'bg-muted-foreground',
                badge: 'bg-muted text-muted-foreground border-border',
                label: 'Completed',
              },
            };
            const sConfig = statusConfig[effectiveStatus as keyof typeof statusConfig] || statusConfig.completed;

            // Make first card wider (lg:col-span-2) for bento layout variety
            const isFeature = idx === 0;

            return (
              <div
                key={event.id}
                className={`glass-card glass-card-hover group relative rounded-3xl overflow-hidden flex flex-col${isFeature ? ' lg:col-span-1' : ''}`}
              >
                {/* Cover image */}
                <div className={`w-full overflow-hidden relative ${
                  event.imageOrientation === 'portrait' ? 'aspect-[4/5] bg-black/40' : 'aspect-video'
                }`}>
                  {coverUrl && (
                    <Image 
                      src={coverUrl} 
                      alt={event.title} 
                      fill
                      className={`${
                        event.imageOrientation === 'portrait'
                          ? 'object-contain p-1'
                          : 'object-cover group-hover:scale-105'
                      } transition-transform duration-700`}
                    />
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />

                  {/* Registration badge */}
                  {effectiveStatus === 'upcoming' && event.isRegistrationOpen === false ? (
                    <div className="glass-pill absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-500/85 text-white shadow-sm uppercase tracking-wider">
                      Reg. Closed
                    </div>
                  ) : effectiveStatus === 'upcoming' && event.registrationLink && event.isRegistrationOpen !== false ? (
                    <div className="glass-pill absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/85 text-white shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Register Open
                    </div>
                  ) : null}

                  {/* Status badge */}
                  <div className={`glass-pill absolute top-3 right-3 px-3 py-1 text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1.5 ${sConfig.badge}`}>
                    <span className={`size-1.5 rounded-full ${sConfig.dot}`} />
                    {sConfig.label}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 gap-3">
                  <h3 className="font-bold text-lg text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>

                  <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-medium">{date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    {event.startTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{event.startTime}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm line-clamp-2 flex-1 leading-relaxed">
                    {event.shortDescription}
                  </p>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    {effectiveStatus === 'upcoming' && event.registrationLink && event.isRegistrationOpen !== false ? (
                      <Button asChild size="sm" className="flex-1 rounded-full text-xs gap-1.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-sm">
                        <Link href={event.registrationLink} target="_blank">
                          <Zap className="w-3.5 h-3.5" />
                          Register Now
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline" className="flex-1 rounded-full text-xs gap-1.5 hover:border-primary/50 hover:text-primary transition-all">
                        <Link href="/events">
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Details
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 text-center">
          <Button asChild variant="outline" className="rounded-full sm:hidden w-full gap-2">
            <Link href="/events">
              View All Events <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
  } catch (e) {
    console.error("Error loading events section:", e);
    return null;
  }
}
