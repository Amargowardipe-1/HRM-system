"use client";

import { useAuth } from "@/context/AuthContext";
import { AttendanceDashboard } from "@/components/attendance/AttendanceDashboard";

export default function AttendancePage() {
  const { user, token } = useAuth() || {};

  return (
    <AttendanceDashboard
      currentUser={user || {}}
      token={token}
    />
  );
}
