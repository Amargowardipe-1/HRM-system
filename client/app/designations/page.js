"use client";

import { useAuth } from "@/context/AuthContext";
import { DesignationsDashboard } from "@/components/designation/DesignationsDashboard";

export default function DesignationsPage() {
  const { user, token } = useAuth() || {};

  return (
    <DesignationsDashboard
      token={token}
    />
  );
}
