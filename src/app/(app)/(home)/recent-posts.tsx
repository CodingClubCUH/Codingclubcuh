import { getPayload } from "payload";
import configPromise from "@payload-config";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, FileText, Layers, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function RecentPostsSection() {
  try {
    const payload = await getPayload({ config: configPromise });

    const postsReq = await payload.find({
      collection: "posts",
      where: {
        _status: {
          equals: "published",
        },
        showOnHome: {
          not_equals: false,
        },
      },
      limit: 3,
      sort: "-publishedAt",
    });
    const posts = postsReq.docs || [];

    if (posts.length === 0) return null;

    return (
      <section className="py-16 md:py-28 relative overflow-hidden">
        {/* Background */}
        <div aria-hidden className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
        <div aria-hidden className="absolute top-1/2 right-1/4 w-[500px] h-[400px] rounded-full bg-primary/4 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-14 gap-6">
            <SectionHeading
              title="Latest from our Blog"
              subtitle="Tutorials, tech updates, and engineering thoughts from the CUH community."
              badge="📰 Editorial"
              align="left"
            />
            <Button asChild variant="outline" className="hidden sm:flex rounded-full border-border hover:border-primary/50 hover:bg-primary/5 transition-all gap-2">
              <Link href="/posts">
                View All Posts <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post) => {
              const date = post.publishedAt || post.createdAt;
              const parsedDate = date ? new Date(date) : new Date();

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const postAny = post as any;
              const hasMultiImages =
                postAny.images && Array.isArray(postAny.images) && postAny.images.length > 1;
              const heroUrl =
                post.heroImage && typeof post.heroImage === "object" && post.heroImage.url
                  ? post.heroImage.url
                  : postAny.images &&
                    Array.isArray(postAny.images) &&
                    postAny.images.length > 0 &&
                    typeof postAny.images[0] === "object" &&
                    postAny.images[0]?.url
                  ? postAny.images[0].url
                  : null;

              const postHref = post.slug ? `/posts/${post.slug}` : `/posts/${post.id}`;

              return (
                <Link
                  href={postHref}
                  key={post.id}
                  className="glass-card glass-card-hover group relative flex flex-col rounded-3xl p-5 overflow-hidden h-full"
                >
                  {/* Hover ambient top shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-3xl" />

                  <div className="relative aspect-[16/10] w-full bg-muted/60 rounded-2xl overflow-hidden mb-5 border border-border flex items-center justify-center">
                    {heroUrl ? (
                      <Image
                        src={heroUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="size-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-card to-background border-dashed text-center">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          Coding Club CUH
                        </span>
                      </div>
                    )}
                    {hasMultiImages && (
                      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold border border-white/10 shadow-sm pointer-events-none">
                        <Layers className="w-3 h-3 text-primary" />
                        <span>{postAny.images.length} photos</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {post.categories &&
                      Array.isArray(post.categories) &&
                      post.categories.slice(0, 2).map((cat: unknown) => (
                        <span
                          key={
                            typeof cat === "object" && cat !== null && "id" in cat
                              ? (cat as { id: string }).id
                              : String(cat)
                          }
                          className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full"
                        >
                          {typeof cat === "object" && cat !== null && "title" in cat
                            ? (cat as { title: string }).title
                            : "Article"}
                        </span>
                      ))}
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 ml-auto">
                      <BookOpen size={11} className="text-muted-foreground" />
                      3 min read
                    </span>
                  </div>

                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2 text-foreground font-handjet tracking-wide leading-tight">
                    {post.title}
                  </h3>

                  {(() => {
                    const postDesc = post.description || (post as any).meta?.description;
                    return postDesc ? (
                      <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-2 flex-grow">
                        {postDesc}
                      </p>
                    ) : null;
                  })()}

                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono mt-auto pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {parsedDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <span className="text-primary font-semibold text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read <ArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <Button asChild variant="outline" className="w-full mt-8 sm:hidden rounded-full">
            <Link href="/posts">View All Posts</Link>
          </Button>
        </div>
      </section>
    );
  } catch (e) {
    console.error("Error loading recent posts section:", e);
    return null;
  }
}
