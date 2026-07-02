import { cookies } from "next/headers";
import { getCurrentUserProfile, getAttendanceRecords, getUsers } from "@/lib/api";
import { AttendanceDashboard } from "@/components/attendance/AttendanceDashboard";

export default async function AttendancePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  let user = null;
  let attendanceRecords = [];
  let employees = [];

  try {
    if (token) {
      // Fetch user profile and attendance records
      const [userProfile, records] = await Promise.all([
        getCurrentUserProfile(token),
        getAttendanceRecords({}, token),
      ]);
      user = userProfile;
      attendanceRecords = records;

      // If authorized to view all attendance, fetch employees list for filtering
      const hasAttendanceViewAll = user?.permissions?.includes("attendance:view_all") || false;
      if (hasAttendanceViewAll) {
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
    console.error("Failed to load attendance data on server:", err.message);
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center text-brand-muted font-medium">
        Access Denied or Session Expired. Please log in.
      </div>
    );
  }

  return (
    <AttendanceDashboard
      initialRecords={attendanceRecords}
      employees={employees}
      currentUser={user}
      token={token}
    />
  );
}
