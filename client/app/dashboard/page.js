"use client";

import { useAuth } from "@/context/AuthContext";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default function DashboardPage() {
  const { user } = useAuth() || {};

  return <DashboardClient />;
}
