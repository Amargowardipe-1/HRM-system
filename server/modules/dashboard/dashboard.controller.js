const Employee = require("../employee/employee.model");
const Department = require("../department/department.model");
const Attendance = require("../attendance/attendance.model");
const Leave = require("../leave/leave.model");
const Holiday = require("../holiday/holiday.model");
const RolePermission = require("../role/rolePermission.model");

const getDashboardStats = async (req, res) => {
  try {
    const requesterRole = req.user.role;
    const requesterId = req.user.id || req.user._id;

    // Today's date boundary
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDay = new Date(today);
    nextDay.setDate(nextDay.getDate() + 1);

    // Dynamic permission check instead of hardcoded roles
    const rolePermission = await RolePermission.findOne({ role: requesterRole });
    const hasCompanyStats = rolePermission?.permissions.includes("dashboard:view_stats") || false;

    if (hasCompanyStats) {
      // =========================================================
      // ORGANIZATIONAL DASHBOARD (Admin / HR)
      // =========================================================
      
      // 1. Core Counters
      const [totalEmployees, totalDepartments, presentToday, pendingLeaves] = await Promise.all([
        Employee.countDocuments({}),
        Department.countDocuments({}),
        Attendance.countDocuments({ date: { $gte: today, $lt: nextDay }, status: "Present", isDeleted: false }),
        Leave.countDocuments({ status: "Pending" }),
      ]);

      // 2. Attendance Status Breakdown for Today
      const todayAttendance = await Attendance.find({
        date: { $gte: today, $lt: nextDay },
        isDeleted: false,
      });

      const attendanceBreakdown = {
        Present: 0,
        Late: 0,
        HalfDay: 0,
        Absent: 0,
      };

      todayAttendance.forEach((rec) => {
        if (rec.status === "Present") attendanceBreakdown.Present += 1;
        else if (rec.status === "Late") attendanceBreakdown.Late += 1;
        else if (rec.status === "Half Day") attendanceBreakdown.HalfDay += 1;
        else if (rec.status === "Absent") attendanceBreakdown.Absent += 1;
      });

      // Fill in Absent for employees who haven't checked in today
      const checkedInEmployeeIds = todayAttendance.map((rec) => rec.employee.toString());
      const absentCount = await Employee.countDocuments({
        _id: { $nin: checkedInEmployeeIds },
      });
      attendanceBreakdown.Absent = absentCount;

      // 3. Department Wise Employee Distribution
      const departmentDistribution = await Employee.aggregate([
        { $group: { _id: "$department", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "departments",
            localField: "_id",
            foreignField: "_id",
            as: "deptInfo",
          },
        },
        { $unwind: { path: "$deptInfo", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: { $ifNull: ["$deptInfo.name", "Unassigned"] },
            count: 1,
          },
        },
      ]);

      // 4. Gender Distribution
      const genderDistribution = await Employee.aggregate([
        { $group: { _id: "$gender", count: { $sum: 1 } } },
      ]);

      // 5. Employment Type Distribution
      const employmentTypeDistribution = await Employee.aggregate([
        { $group: { _id: "$employmentType", count: { $sum: 1 } } },
      ]);

      // 6. Upcoming Birthdays this month (using Javascript filtering for compatibility across MongoDB versions)
      const currentMonth = new Date().getMonth();
      const allEmployees = await Employee.find().select("firstName lastName dob");
      const upcomingBirthdays = allEmployees
        .filter((emp) => emp.dob && new Date(emp.dob).getMonth() === currentMonth)
        .slice(0, 5)
        .map((emp) => ({
          _id: emp._id,
          name: `${emp.firstName} ${emp.lastName}`,
          dob: emp.dob,
        }));

      // 7. Recent Activities (Recent 5 check-ins + Recent 5 leaves) + Upcoming Holidays
      const [recentAttendance, recentLeaves, upcomingHolidays] = await Promise.all([
        Attendance.find({ isDeleted: false })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate({
            path: "employee",
            select: "firstName lastName employeeCode",
            populate: { path: "department", select: "name" },
          }),
        Leave.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate({
            path: "employeeId",
            select: "firstName lastName employeeCode",
            populate: { path: "department", select: "name" },
          }),
        Holiday.find({ date: { $gte: today }, isDeleted: false })
          .sort({ date: 1 })
          .limit(4),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          role: requesterRole,
          summary: {
            totalEmployees,
            totalDepartments,
            presentToday,
            pendingLeaves,
          },
          attendanceBreakdown,
          departmentDistribution,
          genderDistribution,
          employmentTypeDistribution,
          upcomingBirthdays,
          upcomingHolidays,
          recentActivities: {
            attendance: recentAttendance,
            leaves: recentLeaves,
          },
        },
      });
    } else {
      // =========================================================
      // PERSONAL DASHBOARD (Employee)
      // =========================================================
      const employee = await Employee.findOne({ userId: requesterId });
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee profile not found.",
        });
      }

      const employeeId = employee._id;

      // 1. Personal Stats (Attendance summary this month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [myAttendance, myPendingLeaves, myApprovedLeaves] = await Promise.all([
        Attendance.find({ employee: employeeId, date: { $gte: startOfMonth }, isDeleted: false }),
        Leave.countDocuments({ employeeId, status: "Pending" }),
        Leave.countDocuments({ employeeId, status: "Approved" }),
      ]);

      const mySummary = {
        presentDays: 0,
        lateDays: 0,
        halfDays: 0,
        absentDays: 0,
        avgWorkingHours: 0,
      };

      let totalHours = 0;
      myAttendance.forEach((rec) => {
        if (rec.status === "Present") mySummary.presentDays += 1;
        else if (rec.status === "Late") mySummary.lateDays += 1;
        else if (rec.status === "Half Day") mySummary.halfDays += 1;
        else if (rec.status === "Absent") mySummary.absentDays += 1;
        totalHours += rec.workingHours || 0;
      });

      mySummary.avgWorkingHours = myAttendance.length
        ? Number((totalHours / myAttendance.length).toFixed(2))
        : 0;

      // 2. Recent Personal Activities + Upcoming Holidays
      const [myRecentAttendance, myRecentLeaves, upcomingHolidays] = await Promise.all([
        Attendance.find({ employee: employeeId, isDeleted: false })
          .sort({ date: -1 })
          .limit(5),
        Leave.find({ employeeId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("approvedBy", "name email"),
        Holiday.find({ date: { $gte: today }, isDeleted: false })
          .sort({ date: 1 })
          .limit(4),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          role: requesterRole,
          summary: {
            presentDays: mySummary.presentDays + mySummary.lateDays + mySummary.halfDays,
            pendingLeaves: myPendingLeaves,
            approvedLeaves: myApprovedLeaves,
            avgWorkingHours: mySummary.avgWorkingHours,
            totalAllowedLeaves: 15, // standard annual leave allowance
          },
          attendanceBreakdown: {
            Present: mySummary.presentDays,
            Late: mySummary.lateDays,
            HalfDay: mySummary.halfDays,
            Absent: mySummary.absentDays,
          },
          upcomingHolidays,
          recentActivities: {
            attendance: myRecentAttendance,
            leaves: myRecentLeaves,
          },
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve dashboard stats.",
    });
  }
};

module.exports = {
  getDashboardStats,
};
