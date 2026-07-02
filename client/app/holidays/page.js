import { cookies } from "next/headers";
import { getCurrentUserProfile, getHolidays } from "@/lib/api";
import { HolidayDashboard } from "@/components/holiday/HolidayDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HolidaysPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  let user = null;
  let holidaysList = [];

  try {
    if (token) {
      const [userProfile, list] = await Promise.all([
        getCurrentUserProfile(token),
        getHolidays(token),
      ]);
      user = userProfile;
      holidaysList = list;
    }
  } catch (err) {
    console.error("Failed to load holiday data on server:", err.message);
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center text-brand-muted font-medium">
        Access Denied or Session Expired. Please log in.
      </div>
    );
  }

  return (
    <HolidayDashboard
      initialHolidays={holidaysList}
      currentUser={user}
      token={token}
    />
  );
}
