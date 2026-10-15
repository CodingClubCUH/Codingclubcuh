import { getPayload } from "payload";
import configPromise from "@payload-config";
import FaqClient, { ObjectiveItem } from "./faq.client";

const DEFAULT_OBJECTIVES: ObjectiveItem[] = [
  {
    id: "cbs",
    title: "Classes By Students",
    description: `Peer-to-peer coding sessions. Hands-on workshops on programming & tech. Web development & ML tutorials. Coding contests & hackathons. Learn by teaching & sharing knowledge.`,
    icon: "BookOpen",
    image: "https://res.cloudinary.com/khxwr1df/image/upload/v1789927155/codingclub/gallery/2026/club_group_photo.jpg",
  },
  {
    id: "da",
    title: "Development Activities",
    description: `Real-world project building. Open-source contributions. Campus-focused apps & websites. Tech seminars & industry talks. Networking with experts & alumni.`,
    icon: "Code2",
    image: "https://res.cloudinary.com/khxwr1df/image/upload/v1789927153/codingclub/teams/members/cuh_team_2026.jpg",
  },
  {
    id: "oo",
    title: "Other Objectives",
    description: `Promote coding culture & innovation. Encourage participation in competitions. Strengthen skills for placements & internships. Make coding fun, practical & impactful.`,
    icon: "Rocket",
    image: "https://res.cloudinary.com/khxwr1df/image/upload/v1789927156/codingclub/gallery/2026/media_coverage_dainik_bhaskar.jpg",
  },
];

export default async function Faq() {
  try {
    const payload = await getPayload({ config: configPromise });

    const objReq = await payload.find({
      collection: "objectives",
      where: {
        showOnWebsite: {
          not_equals: false,
        },
      },
      sort: "order",
      limit: 20,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items: ObjectiveItem[] = (objReq.docs || []).map((doc: any) => {
      let image: string | null = null;
      if (doc.image && typeof doc.image === "object" && doc.image.url) {
        image = doc.image.url;
      } else if (doc.imageUrl) {
        image = doc.imageUrl;
      }

      return {
        id: doc.id,
        title: doc.title,
        description: doc.description,
        icon: doc.icon || "BookOpen",
        image,
      };
    });

    if (items.length === 0) {
      items = DEFAULT_OBJECTIVES;
    }

    return <FaqClient items={items} />;
  } catch (e) {
    console.error("Error loading objectives:", e);
    return <FaqClient items={DEFAULT_OBJECTIVES} />;
  }
}
