import { cookies } from "next/headers";
import { getCurrentUserProfile, getLeaveRequests, getUsers } from "@/lib/api";
import { LeaveDashboard } from "@/components/leave/LeaveDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LeavesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  let user = null;
  let leaveRequests = [];
  let employees = [];

  try {
    if (token) {
      // Fetch user profile and leave requests
      const [userProfile, leaves] = await Promise.all([
        getCurrentUserProfile(token),
        getLeaveRequests({}, token),
      ]);
      user = userProfile;
      leaveRequests = leaves;

      // If authorized to view all leaves, fetch employees list for filtering
      const hasLeaveViewAll = user?.permissions?.includes("leave:view_all") || false;
      if (hasLeaveViewAll) {
        const allEmployees = await getUsers(token);

        if (user.role === "Admin") {
          employees = allEmployees;
        } else {
          // HR can only see themselves, employees they created, or employees they manage
          const currentUserId = user.id || user._id;
          const currentEmployeeId = user.employeeId;

          employees = allEmployees.filter((emp) => {
            const empCreatorId = emp.createdBy?._id || emp.createdBy;
            const empManagerId = emp.manager?._id || emp.manager;
            const empUserId = emp.userId?._id || emp.userId;

            const isCreator = empCreatorId && empCreatorId.toString() === currentUserId.toString();
            const isManager = empManagerId && empManagerId.toString() === currentEmployeeId.toString();
            const isSelf = empUserId && empUserId.toString() === currentUserId.toString();

            return isCreator || isManager || isSelf;
          });
        }
      }
    }
  } catch (err) {
    console.error("Failed to load leave data on server:", err.message);
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center text-brand-muted font-medium">
        Access Denied or Session Expired. Please log in.
      </div>
    );
  }

  return (
    <LeaveDashboard
      initialLeaves={leaveRequests}
      employees={employees}
      currentUser={user}
      token={token}
    />
  );
}
