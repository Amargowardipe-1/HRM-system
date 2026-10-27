"use client";

import { useAuth } from "@/context/AuthContext";
import { LeaveDashboard } from "@/components/leave/LeaveDashboard";

export default function LeavesPage() {
  const { user, token } = useAuth() || {};

  return (
    <LeaveDashboard
      currentUser={user || {}}
      token={token}
    />
  );
}
