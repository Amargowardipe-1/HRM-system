import { cookies } from "next/headers";
import { getCurrentUserProfile, getDocuments, getUsers } from "@/lib/api";
import { DocumentDashboard } from "@/components/document/DocumentDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DocumentsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  let user = null;
  let documentsList = [];
  let employeesList = [];

  try {
    if (token) {
      const userProfile = await getCurrentUserProfile(token);
      user = userProfile;

      const hasViewAll = user?.permissions?.includes("documents:view_all") || false;
      const isAdmin = user?.role === "Admin";
      
      if (hasViewAll) {
        const [list, emps] = await Promise.all([
          getDocuments(token),
          isAdmin ? getUsers(token) : Promise.resolve([]),
        ]);
        documentsList = list;
        employeesList = emps;
      } else {
        documentsList = await getDocuments(token);
      }
    }
  } catch (err) {
    console.error("Failed to load documents data on server:", err.message);
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center text-brand-muted font-medium">
        Access Denied or Session Expired. Please log in.
      </div>
    );
  }

  return (
    <DocumentDashboard
      initialDocuments={documentsList}
      employees={employeesList}
      currentUser={user}
      token={token}
    />
  );
}
