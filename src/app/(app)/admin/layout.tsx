import React from "react";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/payload/utilities/getAuthUser";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = await getAuthUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdmin) {
    redirect("/student");
  }

  return <>{children}</>;
}
