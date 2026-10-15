import PageHeader from "@/components/page-header";
import Image from "next/image";
import Link from "next/link";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { BookOpen, Github, Linkedin, User } from "lucide-react";
import { CLOUDINARY_TEAM_MEMBERS } from "@/lib/cloudinary-teams";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeamPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let teams: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let teachers: any[] = [];

  try {
    const payload = await getPayload({ config: configPromise });

    const [teamReq, teachersReq] = await Promise.all([
      payload.find({
        collection: "teams",
        limit: 100,
      }),
      payload
        .find({
          collection: "teachers",
          limit: 50,
          sort: "order",
        })
        .catch(() => ({ docs: [] })),
    ]);

    teams = teamReq.docs || [];
    teachers = teachersReq.docs || [];
  } catch (err) {
    console.error("Error fetching teams from CMS:", err);
  }

  // Fallback to Cloudinary team dataset if CMS is empty or query fails
  if (teams.length === 0) {
    teams = CLOUDINARY_TEAM_MEMBERS;
  }

  const categoryLabels: Record<string, string> = {
    faculty: "Faculty Coordinators & Leadership",
    core: "Core Committee",
    teachers: "Club Instructors & Student Mentors",
    technical: "Technical Team",
    design: "Design & Media",
    outreach: "Event & Outreach",
  };

  const categoryOrder = ["faculty", "core", "teachers", "technical", "design", "outreach"];

  const groupedTeams = categoryOrder.reduce((acc, cat) => {
    let list: typeof teams = [];
    if (cat === "teachers") {
      const fromTeams = teams.filter(
        (m) => m.category === "teachers" || m.isTeacher || (m.position && m.position.trim().toLowerCase() === "teacher")
      );
      const combined = [...fromTeams, ...teachers];
      const seen = new Set<string>();
      list = combined.filter((m) => {
        const key = m.name ? String(m.name).toLowerCase().trim() : String(m.id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } else {
      list = teams.filter(
        (m) =>
          m.category === cat &&
          m.category !== "teachers" &&
          !m.isTeacher &&
          !(m.position && m.position.trim().toLowerCase() === "teacher")
      );
    }
    acc[cat] = list.sort((a, b) => Number(a.order ?? 10) - Number(b.order ?? 10));
    return acc;
  }, {} as Record<string, typeof teams>);

  return (
    <section className="min-h-screen pb-16 bg-background">
      <PageHeader
        pagetitle="Our Team"
        image1="/images/icons/calendar.png"
        image2="/images/icons/time.png"
        pagedescription="Meet the minds powering Coding Club CUH"
      />
      <div className="mx-auto max-w-5xl px-6 lg:px-8 mt-8">
        <div className="space-y-12">
          {categoryOrder.map((categoryKey) => {
            const members = groupedTeams[categoryKey];
            if (!members || members.length === 0) return null;

            return (
              <div key={categoryKey} className="border-t border-border pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-2 h-8 rounded-full bg-primary" aria-hidden="true" />
                  <h3 className="text-xl font-bold tracking-tight text-foreground font-handjet">
                    {categoryLabels[categoryKey] || categoryKey}
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {members.map((member) => {
                    let photoUrl: string | null = null;
                    if (member.photo && typeof member.photo === "object") {
                      photoUrl = member.photo.url || null;
                      if (photoUrl && photoUrl.startsWith('/api/media/file/') && member.photo.filename) {
                        const folder = member.photo.folder || 'teams/members';
                        photoUrl = `https://res.cloudinary.com/khxwr1df/image/upload/codingclub/${folder}/${member.photo.filename}`;
                      }
                    } else if (typeof member.photo === "string") {
                      photoUrl = member.photo;
                    } else if (member.photoUrl || member.photo_url) {
                      photoUrl = member.photoUrl || member.photo_url;
                    }

                    const courseYear = member.courseYear || member.course_year;

                    return (
                      <div
                        key={member.id}
                        className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-card glass-card hover:shadow-md hover:border-primary/30 transition-all glow-hover"
                      >
                        <div className="size-24 rounded-full ring-2 ring-border overflow-hidden bg-muted flex items-center justify-center mb-3 hover:ring-primary/40 transition-all">
                          {photoUrl ? (
                            <Image
                              className="aspect-square rounded-full object-cover w-full h-full"
                              src={photoUrl}
                              alt={member.name}
                              height={160}
                              width={160}
                              loading="lazy"
                            />
                          ) : (
                            <User className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-semibold text-sm text-foreground">{member.name}</span>
                        <span className="text-xs text-primary font-medium mt-0.5 text-gradient">
                          {member.position}
                        </span>
                        {courseYear && (
                          <span className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{courseYear}</span>
                        )}
                        {(member.subjectsTaught || member.subjects_taught || member.teachingSubject || member.teaching_subject) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 text-center">
                            <BookOpen className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="line-clamp-1">{member.subjectsTaught || member.subjects_taught || member.teachingSubject || member.teaching_subject}</span>
                          </span>
                        )}
                        <div className="flex gap-2 mt-3">
                          {member.github && (
                            <Link
                              href={member.github}
                              target="_blank"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Github className="w-4 h-4" />
                            </Link>
                          )}
                          {member.linkedin && (
                            <Link
                              href={member.linkedin}
                              target="_blank"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Linkedin className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
