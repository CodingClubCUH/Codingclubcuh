import Image from "next/image";
import Link from "next/link";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { ArrowRight, BookOpen, GraduationCap, Github, Linkedin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function TeachersSection() {
  try {
    const payload = await getPayload({ config: configPromise });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let teachers: any[] = [];

    try {
      const [teamsReq, teachersReq] = await Promise.all([
        payload
          .find({
            collection: "teams",
            where: {
              showOnHome: {
                not_equals: false,
              },
              or: [
                {
                  category: {
                    equals: "teachers",
                  },
                },
                {
                  isTeacher: {
                    equals: true,
                  },
                },
              ],
            },
            limit: 20,
          })
          .catch(() => ({ docs: [] })),
        payload
          .find({
            collection: "teachers",
            where: {
              showOnHome: {
                not_equals: false,
              },
            },
            limit: 20,
          })
          .catch(() => ({ docs: [] })),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const combined = [...(teamsReq.docs || []), ...(teachersReq.docs || [])] as unknown as Record<string, any>[];
      const seen = new Set<string>();
      teachers = combined.filter((item) => {
        const key = item.name ? String(item.name).toLowerCase().trim() : String(item.id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      teachers.sort((a, b) => Number(a.order ?? 10) - Number(b.order ?? 10));
    } catch (err) {
      console.error("Error fetching teachers from CMS:", err);
      teachers = [];
    }

    // Strictly dynamic: Only display records created and managed by admin in CMS.
    if (!teachers || teachers.length === 0) return null;

    return (
      <section className="py-12 md:py-20 bg-background relative">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            title="Meet Our Student Instructors"
            subtitle="Experienced student members who conduct hands-on masterclasses, workshops, and coding courses for fellow students."
            badge="Student Mentors & Teachers"
          />

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-12">
            {teachers.map((instructor) => {
              const photoUrl =
                instructor.photo && typeof instructor.photo === "object" && instructor.photo.url
                  ? instructor.photo.url
                  : (typeof instructor.photo === "string" ? instructor.photo : instructor.photoUrl || null);

              const rawSubjects =
                instructor.subjectsTaught ||
                instructor.subjects_taught ||
                instructor.teachingSubject ||
                instructor.teaching_subject;
              const subjects: string[] = rawSubjects
                ? String(rawSubjects).split(/[,&]/).map((s: string) => s.trim()).filter(Boolean)
                : [];

              const courseYear = instructor.courseYear || instructor.course_year;

              return (
                <div
                  key={instructor.id}
                  className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col items-center text-center group"
                >
                  <div className="w-24 h-24 mb-4 rounded-2xl overflow-hidden bg-muted flex items-center justify-center transition-all ring-2 ring-white/10 group-hover:ring-primary/40 shadow-sm">
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt={instructor.name}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>

                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{instructor.name}</h3>
                  <p className="text-sm font-medium text-gradient mb-1">
                    {instructor.position || "Club Instructor"}
                  </p>

                  {courseYear && (
                    <p className="text-xs text-muted-foreground mb-3">{courseYear}</p>
                  )}

                  {/* Teaching Subjects Badge */}
                  {subjects.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                      {subjects.map((sub, i) => (
                        <span
                          key={i}
                          className="glass-pill inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-primary"
                        >
                          <BookOpen className="w-3 h-3" />
                          {sub}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-4">
                      <span className="glass-pill inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-primary">
                        <GraduationCap className="w-3 h-3" />
                        Course Instructor
                      </span>
                    </div>
                  )}

                  <div className="mt-auto flex items-center gap-3 pt-4 border-t border-border/50 w-full justify-center">
                    {instructor.github && (
                      <Link
                        href={instructor.github}
                        target="_blank"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="GitHub Profile"
                      >
                        <Github className="w-5 h-5" />
                      </Link>
                    )}
                    {instructor.linkedin && (
                      <Link
                        href={instructor.linkedin}
                        target="_blank"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Button asChild variant="outline" className="rounded-full shadow-sm hover:border-primary/40">
              <Link href="/courses" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Explore Courses & Workshops <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  } catch (e) {
    console.error("Error loading teachers section:", e);
    return null;
  }
}
