import { cookies } from "next/headers";
import { getCurrentUserProfile, getDepartments } from "@/lib/api";
import { ProfileDashboard } from "@/components/profile/ProfileDashboard";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  let user = null;
  let departments = [];

  try {
    if (token) {
      const [userProfile, depts] = await Promise.all([
        getCurrentUserProfile(token),
        getDepartments(token),
      ]);
      user = userProfile;
      departments = depts;
    }
  } catch (err) {
    console.error("Failed to load profile data on server:", err.message);
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center text-brand-muted font-medium">
        Access Denied or Session Expired. Please log in.
      </div>
    );
  }

  return (
    <ProfileDashboard
      initialUser={user}
      departments={departments}
      token={token}
    />
  );
}
