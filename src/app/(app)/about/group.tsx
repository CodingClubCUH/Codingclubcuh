import { BorderBeam } from "@/components/magicui/border-beam";
import Image from "next/image";
import { getPayload } from "payload";
import configPromise from "@payload-config";

export default async function ContentSection() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let teamGroupPhoto: any = null;

  try {
    const payload = await getPayload({ config: configPromise });

    const galleryReq = await payload.find({
      collection: "gallery",
      where: {
        category: {
          equals: "team",
        },
      },
      limit: 1,
      sort: "-createdAt",
    });

    teamGroupPhoto = galleryReq.docs?.[0];
  } catch (err) {
    console.error("Error fetching group photo from CMS:", err);
  }

  const photoUrl =
    teamGroupPhoto?.image &&
    typeof teamGroupPhoto.image === "object" &&
    teamGroupPhoto.image.url
      ? teamGroupPhoto.image.url
      : "https://res.cloudinary.com/khxwr1df/image/upload/v1789927153/codingclub/teams/members/cuh_team_2026.jpg";

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12 border-t border-border pt-16 relative">
        <span className="text-sm font-medium -ml-6 -mt-20 absolute top-16 bg-background px-6 text-muted-foreground">
          Team
        </span>
        <div className="gap-4 sm:grid sm:grid-cols-2">
          <div className="sm:w-2/5">
            <h2 className="text-3xl font-bold sm:text-4xl text-foreground font-handjet tracking-wider">
              CCC Members (2023 Batch)
            </h2>
          </div>
          <div className="mt-6 sm:mt-0 text-xl">
            <p className="text-muted-foreground">
              {teamGroupPhoto?.caption ||
                "A vibrant team of members to manage the coding club efficiently and effectively."}
            </p>
          </div>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-xl glass-card">
          <Image
            className="rounded-2xl grayscale hover:grayscale-0 transition-all duration-500 w-full object-cover max-h-[600px]"
            src={photoUrl}
            alt={teamGroupPhoto?.caption || "Coding Club CUH Team"}
            height={1000}
            width={1000}
            loading="lazy"
          />
          <BorderBeam
            duration={6}
            size={1000}
            className="from-transparent via-primary to-transparent"
          />
        </div>
      </div>
    </section>
  );
}
