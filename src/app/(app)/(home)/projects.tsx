import Image from "next/image";
import Link from "next/link";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { ExternalLink, Github, Code2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function ProjectsSection() {
  try {
    const payload = await getPayload({ config: configPromise });
    
    const projectsReq = await payload.find({
      collection: "projects",
      limit: 4,
    });
    const projects = projectsReq.docs || [];

    if (projects.length === 0) return null;

  return (
    <section className="py-16 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div aria-hidden className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
      <div aria-hidden className="absolute -bottom-32 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <SectionHeading 
          title="Student Projects" 
          subtitle="Real-world software built by our community — from web apps to open-source tools." 
          badge="🚀 Showcase" 
        />
        
        <div className="grid gap-6 md:grid-cols-2 mt-12">
          {projects.map((project) => (
            <div
              key={project.id}
              className="glass-card glass-card-hover group relative rounded-3xl overflow-hidden"
            >
              {/* Screenshot */}
              <div className="aspect-[16/9] w-full bg-muted/40 relative overflow-hidden">
                {project.screenshot && typeof project.screenshot === 'object' && project.screenshot.url && (
                  <Image 
                    src={project.screenshot.url} 
                    alt={project.name} 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                
                {/* Floating action links on hover */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  {project.github && (
                    <Link
                      href={project.github}
                      target="_blank"
                      className="glass-pill size-9 rounded-full flex items-center justify-center text-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm"
                    >
                      <Github className="w-4 h-4" />
                    </Link>
                  )}
                  {project.liveDemo && (
                    <Link
                      href={project.liveDemo}
                      target="_blank"
                      className="glass-pill size-9 rounded-full bg-primary/80 text-primary-foreground border-primary/40 flex items-center justify-center hover:opacity-90 transition-all shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Project</span>
                  </div>
                </div>
                
                {project.techStack && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.techStack.split(',').map((tech: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
                
                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-4">
                  {project.description}
                </p>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Built by:</span>{" "}
                    {project.members}
                  </p>
                  <div className="flex gap-2">
                    {project.github && (
                      <Link href={project.github} target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                        <Github className="w-4 h-4" />
                      </Link>
                    )}
                    {project.liveDemo && (
                      <Link href={project.liveDemo} target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
  } catch (e) {
    console.error("Error loading projects section:", e);
    return null;
  }
}
