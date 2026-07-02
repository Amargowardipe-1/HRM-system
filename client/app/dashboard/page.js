import { cookies } from "next/headers";
import { getDashboardStats } from "@/lib/api";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  let stats = {};

  try {
    if (token) {
      stats = await getDashboardStats(token);
    }
  } catch (err) {
    console.error("Failed to load dashboard stats on server:", err.message);
  }

  if (!stats || Object.keys(stats).length === 0) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center text-brand-muted font-medium">
        Access Denied or Session Expired. Please log in.
      </div>
    );
  }

  return <DashboardClient stats={stats} />;
}
