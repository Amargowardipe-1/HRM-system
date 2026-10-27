"use client";

import { useAuth } from "@/context/AuthContext";
import { DocumentDashboard } from "@/components/document/DocumentDashboard";

export default function DocumentsPage() {
  const { user, token } = useAuth() || {};

  return (
    <DocumentDashboard
      currentUser={user || {}}
      token={token}
    />
  );
}
