"use client";

import { useAuth } from "@/context/AuthContext";
import { HolidayDashboard } from "@/components/holiday/HolidayDashboard";

export default function HolidaysPage() {
  const { user, token } = useAuth() || {};

  return (
    <HolidayDashboard
      currentUser={user || {}}
      token={token}
    />
  );
}
