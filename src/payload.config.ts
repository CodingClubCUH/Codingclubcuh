import path from "path";
import { fileURLToPath } from "url";

import sharp from "sharp";

import { buildConfig, PayloadRequest } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";

import { Media } from "./payload/collections/Media";
import { Pages } from "./payload/collections/Pages";
import { Posts } from "./payload/collections/Posts";
import { Users } from "./payload/collections/Users";
import { Categories } from "./payload/collections/Categories";
import { Events } from "./payload/collections/Events";
import { Teams } from "./payload/collections/Teams";
import { Teachers } from "./payload/collections/Teachers";
import { Projects } from "./payload/collections/Projects";
import { Gallery } from "./payload/collections/Gallery";
import { Achievements } from "./payload/collections/Achievements";

import { defaultLexical } from "./payload/fields/defaultLexical";
import { getServerSideURL } from "./payload/utilities/getURL";
import { plugins } from "./payload/plugins";
import { Header } from "./payload/Header/config";
import { Footer } from "./payload/Footer/config";
import { CertificateSettings } from "./payload/globals/CertificateSettings";
import { Students } from "./payload/globals/Students";
import { SiteSettings } from "./payload/globals/SiteSettings";
import { Courses } from "./payload/collections/Courses";
import { Certificates } from "./payload/collections/Certificates";
import { Objectives } from "./payload/collections/Objectives";
import { Enrollments } from "./payload/collections/Enrollments";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const getDatabaseURI = (): string => {
  let uri =
    process.env.DATABASE_URI ||
    "postgresql://postgres.vxcfaxvnftdlllcbgehw:Codingclubcuh%4022@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";

  // If using Supabase connection pooler on session port 5432, automatically switch to transaction pooler port 6543
  if (uri.includes(".pooler.supabase.com:5432")) {
    uri = uri.replace(".pooler.supabase.com:5432", ".pooler.supabase.com:6543");
  }
  return uri;
};

export default buildConfig({
  serverURL: getServerSideURL(),
  admin: {
    theme: "dark",
    meta: {
      title: "Coding Club CUH - Admin Portal",
      description:
        "coding club is evolving to be more than just the a coding club. It supports an entire ecosystem — from practical learning to innovate.",
      icons: [
        {
          rel: "icon",
          type: "image/png",
          url: "/favicon.ico",
        },
        {
          rel: "apple-touch-icon",
          type: "image/png",
          url: "/apple-touch-icon.png",
        },
      ],
      openGraph: {
        description:
          "coding club is evolving to be more than just the a coding club. It supports an entire ecosystem — from practical learning to innovate.",
        title: "Coding Club Cuh - for students by students",
      },
      titleSuffix: "- for students by students",
    },
    components: {
      actions: ["@/components/payload-admin/Actions/Action"],
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ["@/components/payload-admin/BeforeLogin"],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ["@/components/payload-admin/BeforeDashboard"],

      graphics: {
        Icon: "@/components/payload-admin/GraphicsIcon",
        Logo: "@/components/payload-admin/GraphicsLogo",
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: "Mobile",
          name: "mobile",
          width: 375,
          height: 667,
        },
        {
          label: "Tablet",
          name: "tablet",
          width: 768,
          height: 1024,
        },
        {
          label: "Desktop",
          name: "desktop",
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: getDatabaseURI(),
      max: process.env.NODE_ENV === "production" ? 4 : 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000,
    },
    push: false,
  }),
  collections: [
    Courses,
    Enrollments,
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    Events,
    Teams,
    Teachers,
    Projects,
    Gallery,
    Achievements,
    Certificates,
    Objectives,
  ],
  cors: [
    getServerSideURL(),
    "https://codingclubcuh.online",
    "https://www.codingclubcuh.online",
    "https://cuhcodingclub.netlify.app",
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.NEXT_PUBLIC_SERVER_URL || "",
  ].filter(Boolean),
  csrf: [
    getServerSideURL(),
    "https://codingclubcuh.online",
    "https://www.codingclubcuh.online",
    "https://cuhcodingclub.netlify.app",
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.NEXT_PUBLIC_SERVER_URL || "",
  ].filter(Boolean),
  globals: [Header, Footer, CertificateSettings, Students, SiteSettings],
  plugins: [...plugins],
  secret:
    process.env.PAYLOAD_SECRET || "development-secret-key-for-local-testing",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  onInit: async (payload) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = payload.db as any;
      const schemaSql = `
          ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "is_registration_open" boolean DEFAULT true;
          ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "registration_closed_message" varchar;
          ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "order" numeric DEFAULT 10;
          ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "photo_url" varchar;
          ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "show_on_home" boolean DEFAULT true;
          ALTER TABLE "gallery" ADD COLUMN IF NOT EXISTS "show_on_website" boolean DEFAULT true;
          ALTER TABLE "gallery" ADD COLUMN IF NOT EXISTS "image_url" varchar;
          ALTER TABLE "gallery" ADD COLUMN IF NOT EXISTS "order" numeric DEFAULT 10;
          ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "show_on_home" boolean DEFAULT true;
          ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_show_on_home" boolean DEFAULT true;
          ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "description" text;
          ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_description" text;
          ALTER TABLE "posts_rels" ADD COLUMN IF NOT EXISTS "media_id" integer;
          ALTER TABLE "_posts_v_rels" ADD COLUMN IF NOT EXISTS "media_id" integer;
          ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "teachers_id" integer;
          CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_teachers_id_idx" ON "payload_locked_documents_rels" ("teachers_id");
          CREATE TABLE IF NOT EXISTS "teachers" (
            "id" serial PRIMARY KEY,
            "name" varchar NOT NULL,
            "position" varchar NOT NULL,
            "subjects_taught" varchar NOT NULL,
            "course_year" varchar,
            "photo_id" integer,
            "photo_url" varchar,
            "show_on_home" boolean DEFAULT true,
            "order" numeric DEFAULT 10,
            "linkedin" varchar,
            "github" varchar,
            "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
            "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
          );
          DO $$
          BEGIN
            ALTER TYPE "public"."enum_teams_category" ADD VALUE IF NOT EXISTS 'teachers';
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
          ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "is_teacher" boolean DEFAULT false;
          ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "teaching_subject" varchar;
          ALTER TABLE "teams" ALTER COLUMN "photo_id" DROP NOT NULL;
          ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "objectives_id" integer;
          CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_objectives_id_idx" ON "payload_locked_documents_rels" ("objectives_id");
          CREATE TABLE IF NOT EXISTS "objectives" (
            "id" serial PRIMARY KEY,
            "title" varchar NOT NULL,
            "description" text NOT NULL,
            "icon" varchar DEFAULT 'BookOpen',
            "image_id" integer,
            "image_url" varchar,
            "show_on_website" boolean DEFAULT true,
            "order" numeric DEFAULT 10,
            "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
            "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
          );
          ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "slug" varchar;
          ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "slug_lock" boolean DEFAULT true;
          ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "status" varchar DEFAULT 'upcoming';
          ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "is_enrollment_open" boolean DEFAULT true;
          ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "description" text;
          ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "price" varchar DEFAULT 'Free';
          ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "instructor_name" varchar;
          ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "instructor_email" varchar;
          ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "department" varchar DEFAULT 'Computer Science and IT';
          ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "starting_date" timestamp(3) with time zone;
          ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "completion_date" timestamp(3) with time zone;
          ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "cover_image_id" integer;
          ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "course_ref_id" integer;
          DO $$
          BEGIN
            ALTER TYPE "public"."enum_certificates_semester" ADD VALUE IF NOT EXISTS 'Completed';
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
          ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "enrollments_id" integer;
          CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_enrollments_id_idx" ON "payload_locked_documents_rels" ("enrollments_id");
          CREATE TABLE IF NOT EXISTS "enrollments" (
            "id" serial PRIMARY KEY,
            "student_id" integer NOT NULL,
            "course_id" integer NOT NULL,
            "status" varchar DEFAULT 'enrolled' NOT NULL,
            "selected_for_certificate" boolean DEFAULT false,
            "certificate_id" integer,
            "certificate_sent" boolean DEFAULT false,
            "certificate_sent_at" timestamp(3) with time zone,
            "enrolled_at" timestamp(3) with time zone DEFAULT now(),
            "remarks" varchar,
            "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
            "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
          );
          CREATE INDEX IF NOT EXISTS "enrollments_student_idx" ON "enrollments" ("student_id");
          CREATE INDEX IF NOT EXISTS "enrollments_course_idx" ON "enrollments" ("course_id");

          CREATE TABLE IF NOT EXISTS "certificate_settings" (
            "id" serial PRIMARY KEY,
            "signature_instructor_id" integer,
            "signature_coordinator_id" integer,
            "signature_student_coordinator_id" integer,
            "sender_email" varchar DEFAULT 'cuhcodingclub@gmail.com',
            "auto_send_email_on_issue" boolean DEFAULT true,
            "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
            "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
          );

          ALTER TABLE "certificate_settings" ADD COLUMN IF NOT EXISTS "smtp_user" varchar DEFAULT 'cuhcodingclub@gmail.com';
          ALTER TABLE "certificate_settings" ADD COLUMN IF NOT EXISTS "smtp_pass" varchar;
          ALTER TABLE "certificate_settings" ADD COLUMN IF NOT EXISTS "smtp_host" varchar DEFAULT 'smtp.gmail.com';
          ALTER TABLE "certificate_settings" ADD COLUMN IF NOT EXISTS "smtp_port" numeric DEFAULT 465;

          ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "department" varchar;
          ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "course" varchar;
          ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "semester" varchar;
          DO $$
          BEGIN
            ALTER TABLE "certificates" ALTER COLUMN "department" TYPE varchar USING "department"::varchar;
            ALTER TABLE "certificates" ALTER COLUMN "course" TYPE varchar USING "course"::varchar;
            ALTER TABLE "certificates" ALTER COLUMN "semester" TYPE varchar USING "semester"::varchar;
          EXCEPTION
            WHEN others THEN null;
          END $$;

          CREATE TABLE IF NOT EXISTS "site_settings" (
            "id" serial PRIMARY KEY,
            "maintenance_mode" boolean DEFAULT false,
            "maintenance_message" text DEFAULT 'The student portal is currently undergoing scheduled maintenance. Student login is temporarily disabled. Please check back later!',
            "allow_admin_bypass" boolean DEFAULT true,
            "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
            "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
          );
          INSERT INTO "site_settings" ("maintenance_mode", "allow_admin_bypass")
            SELECT false, true WHERE NOT EXISTS (SELECT 1 FROM "site_settings");

          CREATE TABLE IF NOT EXISTS "students" (
            "id" serial PRIMARY KEY,
            "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
            "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
          );
          INSERT INTO "students" ("id")
            SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM "students" LIMIT 1);

          DO $$
          BEGIN
            CREATE TYPE "public"."enum_events_image_orientation" AS ENUM('landscape', 'portrait', 'square');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
          ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "image_orientation" "enum_events_image_orientation" DEFAULT 'landscape';
          ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "folder" varchar DEFAULT 'gallery/2026';
        `;
      if (db?.pool?.query) {
        await db.pool.query(schemaSql);
      } else if (db?.drizzle?.execute) {
        const { sql } = await import('@payloadcms/db-postgres/drizzle');
        await db.drizzle.execute(sql.raw(schemaSql));
      }
    } catch (err) {
      payload.logger.warn(`Notice on database columns check: ${err}`);
    }
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true;

        // If there is no logged in user, then check
        // for the Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get("authorization");
        return authHeader === `Bearer ${process.env.CRON_SECRET}`;
      },
    },
    tasks: [],
  },
});
