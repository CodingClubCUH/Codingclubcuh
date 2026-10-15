import Image from "next/image";
import { Timeline } from "@/components/ui/timeline";
import PageHeader from "@/components/page-header";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import Link from "next/link";
import { Calendar, MapPin, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEffectiveEventStatus, sortEvents } from "@/payload/utilities/eventStatus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EventsPage() {
  const payload = await getPayload({ config: configPromise });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmsEvents: any[] = [];
  try {
    const eventsReq = await payload.find({
      collection: "events",
      limit: 50,
      sort: "-date",
    });
    cmsEvents = eventsReq.docs || [];
  } catch (error) {
    console.error("Error loading events from CMS:", error);
  }

  const fallbackEvents = [
    {
      id: 'c_python_class',
      title: 'C & Python Programming Masterclass',
      date: '2026-04-05T10:00:00.000Z',
      location: 'Lab 3, Dept of CSE, CUH',
      shortDescription: 'Comprehensive hands-on coding session covering foundational concepts in C and practical problem solving with Python.',
      status: 'completed',
      coverPhoto: {
        url: 'https://res.cloudinary.com/khxwr1df/image/upload/v1789927154/codingclub/events/coding-class/c_python_masterclass.jpg',
      },
    },
    {
      id: 'fullstack_web_dev',
      title: 'Full-Stack Web Development Workshop',
      date: '2026-04-18T14:00:00.000Z',
      location: 'Seminar Hall, Academic Block 1, CUH',
      shortDescription: 'Learn modern web engineering with Next.js, Tailwind CSS, and APIs from student mentors.',
      status: 'completed',
      coverPhoto: {
        url: 'https://res.cloudinary.com/khxwr1df/image/upload/v1789927154/codingclub/events/workshops/fullstack_web_dev.jpg',
      },
    },
    {
      id: 'annual_hackathon',
      title: 'CUH Hackathon & Code Sprint',
      date: '2026-05-12T09:00:00.000Z',
      location: 'Central University of Haryana',
      shortDescription: 'Campus-wide hackathon where students build innovative software solutions and win awards.',
      status: 'completed',
      coverPhoto: {
        url: 'https://res.cloudinary.com/khxwr1df/image/upload/v1789927159/codingclub/gallery/2026/hackathon_session_1.jpg',
      },
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawEvents: any[] = cmsEvents.length > 0 ? cmsEvents : fallbackEvents;
  const events = sortEvents(rawEvents);

  const timelineData = events.map((event) => {
    const date = new Date(event.date);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const effectiveStatus = getEffectiveEventStatus(event);

    let coverUrl: string | null = null;
    if (event.coverPhoto && typeof event.coverPhoto === "object") {
      coverUrl = event.coverPhoto.url || null;
      if (coverUrl && coverUrl.startsWith('/api/media/file/') && event.coverPhoto.filename) {
        const folder = event.coverPhoto.folder || 'events/hackathon';
        coverUrl = `https://res.cloudinary.com/khxwr1df/image/upload/codingclub/${folder}/${event.coverPhoto.filename}`;
      }
    } else if (typeof event.coverPhoto === "string") {
      coverUrl = event.coverPhoto;
    } else if (event.coverPhotoUrl) {
      coverUrl = event.coverPhotoUrl;
    }

    // Only fallback if no image URL could be resolved
    if (!coverUrl) {
      coverUrl = 'https://res.cloudinary.com/khxwr1df/image/upload/v1789927159/codingclub/gallery/2026/hackathon_session_1.jpg';
    }

    return {
      title: event.title,
      content: (
        <div key={event.id} className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              {formattedDate}
            </span>
            {event.startTime && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                {event.startTime} {event.endTime ? `- ${event.endTime}` : ''}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-accent" />
                {event.location}
              </span>
            )}
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider border ${
                effectiveStatus === "upcoming"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : effectiveStatus === "ongoing"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {effectiveStatus}
            </span>
          </div>

          <p className="text-foreground text-sm md:text-base leading-relaxed whitespace-pre-line">
            {event.shortDescription}
          </p>

          {coverUrl && (
            <div
              className={`relative w-full rounded-2xl overflow-hidden shadow-md border border-border/80 ${
                event.imageOrientation === "portrait"
                  ? "aspect-[2/3] max-w-sm sm:max-w-md bg-black/40"
                  : event.imageOrientation === "square"
                  ? "aspect-square max-w-md"
                  : "aspect-video max-w-lg"
              }`}
            >
              <Image
                src={coverUrl}
                alt={event.title}
                fill
                className={
                  event.imageOrientation === "portrait"
                    ? "object-contain p-1"
                    : "object-cover"
                }
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>
          )}

          {/* Registration Button & Status */}
          {effectiveStatus === "completed" ? (
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
                Event Concluded
              </span>
            </div>
          ) : event.isRegistrationOpen === false ? (
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2.5">
              <Button
                disabled
                size="sm"
                variant="outline"
                className="rounded-full bg-muted/60 text-muted-foreground border-border cursor-not-allowed font-medium w-fit opacity-90"
              >
                Registrations Closed
              </Button>
              <span className="text-xs text-muted-foreground italic">
                {event.registrationClosedMessage || "Registration for this event has ended."}
              </span>
            </div>
          ) : event.registrationLink ? (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button asChild size="sm" className="rounded-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-opacity shadow-sm">
                <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                  Register Now <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Registration Open
              </span>
            </div>
          ) : null}
        </div>
      ),
    };
  });

  return (
    <div className="w-full min-h-screen pb-16 bg-background">
      <PageHeader
        pagetitle={`Coding Club Events`}
        image1={"/images/icons/calendar.png"}
        image2={"/images/icons/time.png"}
        pagedescription={`Bringing Coders Together to Learn, Build, and Grow.`}
      />
      {timelineData.length === 0 ? (
        <div className="mx-auto max-w-3xl px-6 py-20 text-center text-muted-foreground">
          <p className="text-xl font-medium text-foreground">No events published yet.</p>
          <p className="text-sm mt-2">
            Admins can add workshops, hackathons, and seminars directly from the Payload CMS admin panel.
          </p>
        </div>
      ) : (
        <Timeline data={timelineData} />
      )}
    </div>
  );
}
