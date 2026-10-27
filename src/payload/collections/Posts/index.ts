import type { CollectionConfig } from "payload";

import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

import { isAdmin } from "../../access/isAdmin";
import { authenticatedOrPublished } from "../../access/authenticatedOrPublished";
import { populateAuthors } from "./hooks/populateAuthors";
import { revalidateDelete, revalidatePost } from "./hooks/revalidatePost";
import { slugField } from "@/payload/fields/slug";

export const Posts: CollectionConfig<"posts"> = {
  slug: "posts",
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticatedOrPublished,
    update: isAdmin,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
  },
  admin: {
    defaultColumns: ["title", "slug", "showOnHome", "updatedAt"],
    useAsTitle: "title",
    group: "Content & Media",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "Give your post a title",
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "About this Post",
      admin: {
        description:
          "Write a short summary or description about this post (shown in previews & cards)",
      },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      label: "Cover Image (Optional Fallback)",
      admin: {
        description:
          "Optional single cover image. If Post Images are provided below, they will be used as the carousel (1st image as cover).",
      },
    },
    {
      name: "images",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      maxRows: 10,
      label: "Post Images (Multi-select - Max 10)",
      admin: {
        description:
          "Upload or select up to 10 images at once. Visitors will see these as an Instagram-like swipeable carousel. The first image will be used as the preview cover.",
        components: {
          Field: "@/components/payload-admin/MultiImageUpload#default",
        },
      },
      validate: (val: unknown) => {
        if (Array.isArray(val) && val.length > 10) {
          return "Maximum 10 images can be selected for a post.";
        }
        return true;
      },
    },
    {
      name: "content",
      type: "richText",
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            HorizontalRuleFeature(),
          ];
        },
      }),
      label: "Post Content",
      required: true,
      admin: {
        description:
          "Write your post content here. Use the toolbar for formatting.",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
        position: "sidebar",
        description: "Auto-set when you publish",
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === "published" && !value) {
              return new Date();
            }
            return value;
          },
        ],
      },
    },
    {
      name: "showOnHome",
      type: "checkbox",
      label: "Show on Home Page",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "Display this post in the blog section on home page",
      },
    },
    {
      name: "categories",
      type: "relationship",
      admin: {
        position: "sidebar",
      },
      hasMany: true,
      relationTo: "categories",
    },
    {
      name: "authors",
      type: "relationship",
      admin: {
        position: "sidebar",
      },
      hasMany: true,
      relationTo: "users",
    },
    {
      name: "relatedPosts",
      type: "relationship",
      admin: {
        position: "sidebar",
        description:
          "Select related posts to display at the bottom of this post",
      },
      filterOptions: ({ id }) => {
        return {
          id: {
            not_in: [id],
          },
        };
      },
      hasMany: true,
      relationTo: "posts",
    },
    // Hidden field for populating author data
    {
      name: "populatedAuthors",
      type: "array",
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: "id",
          type: "text",
        },
        {
          name: "name",
          type: "text",
        },
      ],
    },
    ...slugField(),
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data && !data.slug && data.title) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        }
        return data;
      },
    ],
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
};
