const Payroll = require("./payroll.model");
const Employee = require("../employee/employee.model");

const {
  PAYROLL_STATUS,
  PAYROLL_MESSAGES,
} = require("./payroll.constants");

const {
  calculateGrossSalary,
  calculateNetSalary,
  calculatePF,
  calculateESIC,
  calculateTax,
  calculateOvertimeAmount,
} = require("./payroll.helper");

// Helper: Calculate complete attendance metrics, deductions, and salary components
const calculatePayrollDetails = async ({
  employeeData,
  month,
  year,
  allowance = 0,
  bonus = 0,
  deduction = 0,
}) => {
  const employeeId = employeeData._id;
  const basicSalary = Number(employeeData.salary) || 0;

  // 1. Fetch Attendance Settings
  const AttendanceSetting = require("../settings/attendanceSetting.model");
  let settings = await AttendanceSetting.findOne();
  if (!settings) {
    settings = {
      officeStartTime: "09:00",
      officeEndTime: "18:00",
      graceTime: 15,
      halfDayHours: 4,
      fullDayHours: 8,
      weekend: ["Saturday", "Sunday"],
      allowedLateMarks: 3,
      deductionPerLateMark: 0.5,
      overtimeEnabled: true,
    };
  }

  const weekendDays =
    settings.weekend && Array.isArray(settings.weekend)
      ? settings.weekend
      : ["Saturday", "Sunday"];
  const fullDayLimit = settings.fullDayHours || 8;

  // 2. Month Date Range
  const numYear = Number(year);
  const numMonth = Number(month);
  const startDate = new Date(numYear, numMonth - 1, 1);
  const endDate = new Date(numYear, numMonth, 0, 23, 59, 59, 999);
  const daysInMonth = new Date(numYear, numMonth, 0).getDate();

  // If calculating for current ongoing month, evaluate up to today's date
  const now = new Date();
  const isCurrentMonth =
    now.getFullYear() === numYear && now.getMonth() + 1 === numMonth;
  const isFutureMonth =
    numYear > now.getFullYear() ||
    (numYear === now.getFullYear() && numMonth > now.getMonth() + 1);
  const maxDayToEvaluate = isCurrentMonth
    ? Math.min(now.getDate(), daysInMonth)
    : isFutureMonth
    ? 0
    : daysInMonth;

  // 3. Fetch Holidays in Month
  const Holiday = require("../holiday/holiday.model");
  const holidays = await Holiday.find({
    date: { $gte: startDate, $lte: endDate },
    isDeleted: { $ne: true },
  });
  const holidayDates = new Set();
  holidays.forEach((h) => {
    if (h.date) {
      const hd = new Date(h.date);
      holidayDates.add(`${hd.getFullYear()}-${hd.getMonth() + 1}-${hd.getDate()}`);
    }
  });

  // 4. Fetch Approved Leaves
  const Leave = require("../leave/leave.model");
  const approvedLeaves = await Leave.find({
    employeeId,
    status: "Approved",
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  });

  const paidLeaveDates = new Set();
  const unpaidLeaveDates = new Set();

  approvedLeaves.forEach((leave) => {
    const cur = new Date(Math.max(new Date(leave.startDate).getTime(), startDate.getTime()));
    const last = new Date(Math.min(new Date(leave.endDate).getTime(), endDate.getTime()));
    cur.setHours(0, 0, 0, 0);
    last.setHours(0, 0, 0, 0);

    while (cur <= last) {
      const curYear = cur.getFullYear();
      const curMonth = cur.getMonth() + 1;
      const curDate = cur.getDate();
      const key = `${curYear}-${curMonth}-${curDate}`;
      const dayName = cur.toLocaleDateString("en-US", { weekday: "long" });

      if (!weekendDays.includes(dayName) && !holidayDates.has(key)) {
        if (leave.leaveType === "Unpaid Leave") {
          unpaidLeaveDates.add(key);
        } else {
          paidLeaveDates.add(key);
        }
      }
      cur.setDate(cur.getDate() + 1);
    }
  });

  // 5. Fetch Attendance Records
  const Attendance = require("../attendance/attendance.model");
  const attendanceRecords = await Attendance.find({
    employee: employeeId,
    date: { $gte: startDate, $lte: endDate },
    isDeleted: false,
  });

  const attendanceMap = new Map();
  let overtimeHours = 0;

  attendanceRecords.forEach((record) => {
    if (record.date) {
      const rd = new Date(record.date);
      const key = `${rd.getFullYear()}-${rd.getMonth() + 1}-${rd.getDate()}`;
      attendanceMap.set(key, record);

      if (settings.overtimeEnabled && record.workingHours > fullDayLimit) {
        overtimeHours += record.workingHours - fullDayLimit;
      }
    }
  });

  // 6. Day-by-Day Evaluation
  let totalWorkingDaysInMonth = 0;
  let presentDays = 0;
  let halfDays = 0;
  let leaveDays = 0;
  let absentDays = 0;
  let lateMarksCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(numYear, numMonth - 1, d);
    const dayName = dayDate.toLocaleDateString("en-US", { weekday: "long" });
    const key = `${numYear}-${numMonth}-${d}`;

    const isWeekend = weekendDays.includes(dayName);
    const isHoliday = holidayDates.has(key);

    if (!isWeekend && !isHoliday) {
      totalWorkingDaysInMonth++;

      if (d <= maxDayToEvaluate) {
        const record = attendanceMap.get(key);

        if (record) {
          if (record.status === "Present") {
            presentDays += 1;
          } else if (record.status === "Late") {
            presentDays += 1;
            lateMarksCount += 1;
          } else if (record.status === "Half Day") {
            presentDays += 0.5;
            halfDays += 1;
            absentDays += 0.5; // Half day pay deduction
          } else if (record.status === "Leave") {
            if (unpaidLeaveDates.has(key)) {
              absentDays += 1;
            } else {
              leaveDays += 1;
            }
          } else if (record.status === "Absent") {
            absentDays += 1;
          } else {
            presentDays += 1;
          }
        } else {
          // No record on this working day
          if (paidLeaveDates.has(key)) {
            leaveDays += 1; // Approved paid leave
          } else if (unpaidLeaveDates.has(key)) {
            absentDays += 1; // Unpaid leave / LOP
          } else {
            absentDays += 1; // Unapproved absence / Chhutti
          }
        }
      }
    }
  }

  const workingDays = Math.max(1, totalWorkingDaysInMonth);
  // Per day basic rate
  const dailyRate = Number((basicSalary / workingDays).toFixed(2));

  // Attendance deductions: absent days + half days (already 0.5 per half day in absentDays)
  let attendanceDeduction = 0;
  if (absentDays >= workingDays) {
    attendanceDeduction = basicSalary;
  } else {
    attendanceDeduction = Number((absentDays * dailyRate).toFixed(2));
    attendanceDeduction = Math.min(basicSalary, attendanceDeduction);
  }

  // Late mark deductions calculation
  let lateDeductionAmount = 0;
  const allowedLates =
    settings.allowedLateMarks !== undefined ? settings.allowedLateMarks : 3;
  const deductionMultiplier =
    settings.deductionPerLateMark !== undefined ? settings.deductionPerLateMark : 0.5;

  if (lateMarksCount > allowedLates) {
    const extraLate = lateMarksCount - allowedLates;
    lateDeductionAmount = Number((extraLate * deductionMultiplier * dailyRate).toFixed(2));
  }

  // Overtime Amount
  const hourlyRate = Number((dailyRate / fullDayLimit).toFixed(2));
  const overtimeAmount = calculateOvertimeAmount({
    overtimeHours,
    hourlyRate,
  });

  const grossSalary = calculateGrossSalary({
    basicSalary,
    allowance: Number(allowance) || 0,
    bonus: Number(bonus) || 0,
    overtimeAmount,
  });

  // Total deduction includes manual deduction + attendance deduction (chhutti & half-day) + late deduction
  const totalAttendanceDeduction = Number((attendanceDeduction + lateDeductionAmount).toFixed(2));
  const finalDeduction = Number(((Number(deduction) || 0) + totalAttendanceDeduction).toFixed(2));

  // Statutory: PF on earned basic, ESIC/Tax on effective gross
  const earnedBasic = Math.max(0, basicSalary - attendanceDeduction);
  const pf = calculatePF(earnedBasic);
  const effectiveGross = Math.max(0, grossSalary - totalAttendanceDeduction);
  const esic = calculateESIC(effectiveGross);
  const tax = calculateTax(effectiveGross);

  const netSalary = Math.max(
    0,
    calculateNetSalary({
      grossSalary,
      deduction: finalDeduction,
      tax,
      pf,
      esic,
    })
  );

  return {
    attendanceSummary: {
      workingDays,
      presentDays,
      absentDays,
      halfDays,
      leaveDays,
      overtimeHours: Number(overtimeHours.toFixed(2)),
    },
    basicSalary,
    allowance: Number(allowance) || 0,
    bonus: Number(bonus) || 0,
    overtimeAmount,
    deduction: finalDeduction,
    tax,
    pf,
    esic,
    grossSalary,
    netSalary: grossSalary <= finalDeduction ? 0 : netSalary,
  };
};

const generatePayroll = async (
  userId,
  payload
) => {
  const {
    employee,
    month,
    year,
    allowance = 0,
    bonus = 0,
    deduction = 0,
    remarks = "",
  } = payload;

  const employeeData = await Employee.findOne({
    _id: employee,
  })
    .populate("department", "name")
    .populate("designation", "title");

  if (!employeeData) {
    throw new Error(PAYROLL_MESSAGES.EMPLOYEE_NOT_FOUND);
  }

  const existingPayroll = await Payroll.findOne({
    employee,
    month: Number(month),
    year: Number(year),
    isDeleted: false,
  });

  if (existingPayroll) {
    throw new Error(PAYROLL_MESSAGES.ALREADY_EXISTS);
  }

  const details = await calculatePayrollDetails({
    employeeData,
    month: Number(month),
    year: Number(year),
    allowance,
    bonus,
    deduction,
  });

  const payroll = await Payroll.create({
    employee,
    month: Number(month),
    year: Number(year),
    employeeSnapshot: {
      employeeCode: employeeData.employeeCode || "",
      name: employeeData.name,
      department: employeeData.department?.name || "",
      designation: employeeData.designation?.title || "",
    },
    ...details,
    status: PAYROLL_STATUS.GENERATED,
    generatedBy: userId,
    remarks: remarks || `Attendance: ${details.attendanceSummary.presentDays} Present, ${details.attendanceSummary.halfDays} Half Day, ${details.attendanceSummary.absentDays} Absent`,
  });

  return payroll;
};

// =========================================
// Get All Payrolls
// =========================================

const getAllPayrolls = async (query) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    month,
    year,
    status,
  } = query;

  // Pagination
  const currentPage = Math.max(parseInt(page, 10), 1);
  const pageSize = Math.max(parseInt(limit, 10), 1);
  const skip = (currentPage - 1) * pageSize;

  // Filters
  const filter = {
    isDeleted: false,
  };

  if (month) {
    filter.month = Number(month);
  }

  if (year) {
    filter.year = Number(year);
  }

  if (status) {
    filter.status = status;
  }

  // Fetch Payrolls
  let payrolls = await Payroll.find(filter)
    .populate({
      path: "employee",
      select:
        "firstName lastName employeeCode salary",
      populate: [
        {
          path: "department",
          select: "name",
        },
        {
          path: "designation",
          select: "title",
        },
      ],
    })
    .populate(
      "generatedBy",
      "name email"
    )
    .sort({
      createdAt: -1,
    });

  // Search by Employee Name
  if (search.trim()) {
    const searchLower = search.toLowerCase();
    payrolls = payrolls.filter((payroll) => {
      const snapshotName = payroll.employeeSnapshot?.name || "";
      const empFirstName = payroll.employee?.firstName || "";
      const empLastName = payroll.employee?.lastName || "";
      const fullName = `${empFirstName} ${empLastName}`.trim();

      return (
        snapshotName.toLowerCase().includes(searchLower) ||
        fullName.toLowerCase().includes(searchLower)
      );
    });
  }

  // Total Records
  const total = payrolls.length;

  // Pagination
  const paginatedPayrolls =
    payrolls.slice(
      skip,
      skip + pageSize
    );

  return {
    payrolls: paginatedPayrolls,

    pagination: {
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(
        total / pageSize
      ),
    },
  };
};


// Get Payroll By Id
// =========================================

const getPayrollById = async (payrollId) => {
  const payroll = await Payroll.findOne({
    _id: payrollId,
    isDeleted: false,
  })
    .populate({
      path: "employee",
      select: "firstName lastName employeeCode salary email",
      populate: [
        {
          path: "department",
          select: "name",
        },
        {
          path: "designation",
          select: "title",
        },
      ],
    })
    .populate("generatedBy", "name email");

  if (!payroll) {
    throw new Error(
      PAYROLL_MESSAGES.NOT_FOUND
    );
  }

  return payroll;
}

// =========================================
// Update Payroll
// =========================================

const updatePayroll = async (
  payrollId,
  payload
) => {
  const {
    allowance,
    bonus,
    deduction,
    remarks,
  } = payload;

  const payroll = await Payroll.findOne({
    _id: payrollId,
    isDeleted: false,
  });

  if (!payroll) {
    throw new Error(
      PAYROLL_MESSAGES.NOT_FOUND
    );
  }

  if (
  payroll.status ===
  PAYROLL_STATUS.PAID
) {
  throw new Error(
    "Paid payroll cannot be updated."
  );
}

  // Update Salary Components
  payroll.allowance =
    allowance ?? payroll.allowance;

  payroll.bonus =
    bonus ?? payroll.bonus;

  payroll.deduction =
    deduction ?? payroll.deduction;

  payroll.remarks =
    remarks ?? payroll.remarks;

  // Recalculate Gross Salary
  payroll.grossSalary =
    calculateGrossSalary({
      basicSalary: payroll.basicSalary,
      allowance: payroll.allowance,
      bonus: payroll.bonus,
      overtimeAmount:
        payroll.overtimeAmount,
    });

  // Recalculate PF
  payroll.pf = calculatePF(
    payroll.basicSalary
  );

  // Recalculate ESIC
  payroll.esic = calculateESIC(
    payroll.grossSalary
  );

  // Recalculate Tax
  payroll.tax = calculateTax(
    payroll.grossSalary
  );

  // Recalculate Net Salary
  payroll.netSalary =
    calculateNetSalary({
      grossSalary:
        payroll.grossSalary,
      deduction:
        payroll.deduction,
      tax: payroll.tax,
      pf: payroll.pf,
      esic: payroll.esic,
    });

  await payroll.save();

  return payroll;
};

const markPayrollAsPaid = async (
  payrollId,
  payload
) => {
  const { paymentMethod } = payload;

  const payroll = await Payroll.findOne({
    _id: payrollId,
    isDeleted: false,
  });

  if (!payroll) {
    throw new Error(
      PAYROLL_MESSAGES.NOT_FOUND
    );
  }

  if (
    payroll.status ===
    PAYROLL_STATUS.PAID
  ) {
    throw new Error(
      "Payroll is already marked as paid."
    );
  }

  payroll.status =
    PAYROLL_STATUS.PAID;

  payroll.paymentMethod =
    paymentMethod;

  payroll.paidAt = new Date();

  await payroll.save();

  return payroll;
};

const deletePayroll = async (payrollId) => {
  const payroll = await Payroll.findOne({ _id: payrollId, isDeleted: false });
  if (!payroll) {
    throw new Error(PAYROLL_MESSAGES.NOT_FOUND);
  }
  if (payroll.status === PAYROLL_STATUS.PAID) {
    throw new Error("Paid payroll records cannot be deleted.");
  }
  payroll.isDeleted = true;
  await payroll.save();
  return { message: "Payroll deleted successfully." };
};

const getEmployeePayrollHistory = async (employeeId) => {
  return await Payroll.find({ employee: employeeId, isDeleted: false })
    .sort({ year: -1, month: -1 })
    .populate("generatedBy", "name email");
};

const getMonthlyPayrollReport = async (month, year) => {
  const filter = { isDeleted: false };
  if (month) filter.month = Number(month);
  if (year) filter.year = Number(year);

  const payrolls = await Payroll.find(filter);

  const totalGross = payrolls.reduce((sum, p) => sum + p.grossSalary, 0);
  const totalNet = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalBasic = payrolls.reduce((sum, p) => sum + p.basicSalary, 0);
  const totalAllowances = payrolls.reduce((sum, p) => sum + p.allowance, 0);
  const totalBonus = payrolls.reduce((sum, p) => sum + p.bonus, 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + p.deduction, 0);
  const totalPF = payrolls.reduce((sum, p) => sum + p.pf, 0);
  const totalTax = payrolls.reduce((sum, p) => sum + p.tax, 0);
  const totalESIC = payrolls.reduce((sum, p) => sum + p.esic, 0);
  const totalOvertime = payrolls.reduce((sum, p) => sum + p.overtimeAmount, 0);

  const headcount = payrolls.length;
  const paidCount = payrolls.filter((p) => p.status === PAYROLL_STATUS.PAID).length;
  const pendingCount = headcount - paidCount;

  return {
    month: Number(month) || null,
    year: Number(year) || null,
    headcount,
    paidCount,
    pendingCount,
    totals: {
      basicSalary: totalBasic,
      allowance: totalAllowances,
      bonus: totalBonus,
      overtimeAmount: totalOvertime,
      deduction: totalDeductions,
      pf: totalPF,
      tax: totalTax,
      esic: totalESIC,
      grossSalary: totalGross,
      netSalary: totalNet,
    },
  };
};

const autoGenerateMonthlyPayroll = async (userId, month, year) => {
  const activeEmployees = await Employee.find({ status: "Active" })
    .populate("department", "name")
    .populate("designation", "title");
  let count = 0;

  for (const emp of activeEmployees) {
    const exists = await Payroll.findOne({
      employee: emp._id,
      month: Number(month),
      year: Number(year),
      isDeleted: false,
    });

    const details = await calculatePayrollDetails({
      employeeData: emp,
      month: Number(month),
      year: Number(year),
      allowance: 0,
      bonus: 0,
      deduction: 0,
    });

    const employeeSnapshot = {
      employeeCode: emp.employeeCode || "",
      name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.name || "Employee",
      department: emp.department?.name || "",
      designation: emp.designation?.title || "",
    };

    const remarksText = `Auto-generated: ${details.attendanceSummary.presentDays} Present, ${details.attendanceSummary.halfDays} Half Day, ${details.attendanceSummary.absentDays} Absent`;

    if (!exists) {
      await Payroll.create({
        employee: emp._id,
        month: Number(month),
        year: Number(year),
        employeeSnapshot,
        ...details,
        status: PAYROLL_STATUS.GENERATED,
        generatedBy: userId,
        remarks: remarksText,
      });
      count++;
    } else if (exists.status !== PAYROLL_STATUS.PAID) {
      // Recalculate and update existing generated payroll with latest attendance and deduction calculations
      Object.assign(exists, details);
      exists.employeeSnapshot = employeeSnapshot;
      exists.remarks = remarksText;
      exists.generatedBy = userId;
      await exists.save();
      count++;
    }
  }

  return {
    message: `Payroll auto-generation completed. Processed ${count} employee payroll records with attendance-based deductions.`,
    generatedCount: count,
  };
};

module.exports = {
  generatePayroll,
  getAllPayrolls,
  getPayrollById,
  updatePayroll,
  markPayrollAsPaid,
  deletePayroll,
  getEmployeePayrollHistory,
  getMonthlyPayrollReport,
  autoGenerateMonthlyPayroll,
};