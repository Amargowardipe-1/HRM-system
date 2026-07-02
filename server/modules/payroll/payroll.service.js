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

    const employeeData =
    await Employee.findOne({
      _id: employee,
    })
      .populate("department", "name")
      .populate("designation", "title");

  if (!employeeData) {
    throw new Error(
      PAYROLL_MESSAGES.EMPLOYEE_NOT_FOUND
    );
  }

    const existingPayroll =
    await Payroll.findOne({
      employee,
      month,
      year,
      isDeleted: false,
    });

  if (existingPayroll) {
    throw new Error(
      PAYROLL_MESSAGES.ALREADY_EXISTS
    );
  }

  const basicSalary = employeeData.salary;

  // Fetch Attendance Settings
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

  // Calculate Attendance Metrics dynamically for the month/year
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const Attendance = require("../attendance/attendance.model");
  const attendanceRecords = await Attendance.find({
    employee,
    date: { $gte: startDate, $lte: endDate },
    isDeleted: false,
  });

  let presentDays = 0;
  let absentDays = 0;
  let leaveDays = 0;
  let lateMarksCount = 0;
  let overtimeHours = 0;

  attendanceRecords.forEach((record) => {
    if (record.status === "Present") {
      presentDays += 1;
    } else if (record.status === "Late") {
      presentDays += 1;
      lateMarksCount += 1;
    } else if (record.status === "Half Day") {
      presentDays += 0.5;
      absentDays += 0.5;
    } else if (record.status === "Leave") {
      leaveDays += 1;
    } else if (record.status === "Absent") {
      absentDays += 1;
    }

    const fullDayLimit = settings.fullDayHours || 8;
    if (settings.overtimeEnabled && record.workingHours > fullDayLimit) {
      overtimeHours += (record.workingHours - fullDayLimit);
    }
  });

  // Calculate working days in that month (excluding weekends)
  let workingDays = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(year, month - 1, d);
    const dayName = dayDate.toLocaleDateString("en-US", { weekday: "long" });
    if (!settings.weekend.includes(dayName)) {
      workingDays++;
    }
  }

  const attendanceSummary = {
    workingDays,
    presentDays,
    absentDays,
    leaveDays,
    overtimeHours: Number(overtimeHours.toFixed(2)),
  };

  // Late mark deductions calculation
  let lateDeductionAmount = 0;
  const allowedLates = settings.allowedLateMarks !== undefined ? settings.allowedLateMarks : 3;
  const deductionMultiplier = settings.deductionPerLateMark !== undefined ? settings.deductionPerLateMark : 0.5;
  
  if (lateMarksCount > allowedLates) {
    const extraLate = lateMarksCount - allowedLates;
    const dailyRate = basicSalary / 26;
    lateDeductionAmount = extraLate * deductionMultiplier * dailyRate;
  }

  const finalDeduction = Number(deduction) + Number(lateDeductionAmount.toFixed(2));
  const fullDayLimit = settings.fullDayHours || 8;
  const hourlyRate = basicSalary / (26 * fullDayLimit);

  const overtimeAmount = calculateOvertimeAmount({
    overtimeHours: attendanceSummary.overtimeHours,
    hourlyRate,
  });

  const grossSalary = calculateGrossSalary({
    basicSalary,
    allowance,
    bonus,
    overtimeAmount,
  });

  const pf = calculatePF(basicSalary);
  const esic = calculateESIC(grossSalary);
  const tax = calculateTax(grossSalary);

  const netSalary = calculateNetSalary({
    grossSalary,
    deduction: finalDeduction,
    tax,
    pf,
    esic,
  });

  const payroll = await Payroll.create({
    employee,
    month,
    year,
    employeeSnapshot: {
      employeeCode: employeeData.employeeCode || "",
      name: employeeData.name,
      department: employeeData.department?.name || "",
      designation: employeeData.designation?.title || "",
    },
    attendanceSummary,
    basicSalary,
    allowance,
    bonus,
    overtimeAmount,
    deduction: finalDeduction,
    tax,
    pf,
    esic,
    grossSalary,
    netSalary,
    status: PAYROLL_STATUS.GENERATED,
    generatedBy: userId,
    remarks,
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
  const activeEmployees = await Employee.find({ status: "Active" });
  let count = 0;

  for (const emp of activeEmployees) {
    const exists = await Payroll.findOne({
      employee: emp._id,
      month: Number(month),
      year: Number(year),
      isDeleted: false,
    });

    if (!exists) {
      // Create default payroll period with 0 allowance/bonus/deductions
      await generatePayroll(userId, {
        employee: emp._id,
        month: Number(month),
        year: Number(year),
        allowance: 0,
        bonus: 0,
        deduction: 0,
        remarks: "Auto-generated by system scheduler",
      });
      count++;
    }
  }

  return {
    message: `Payroll auto-generation completed. Generated ${count} payroll records.`,
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