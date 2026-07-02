"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getPayrolls,
  generatePayroll,
  updatePayroll,
  markPayrollAsPaid,
  deletePayroll,
  getEmployeePayrollHistory,
  getMonthlyPayrollReport,
  autoGeneratePayroll,
  getUsers,
} from "@/lib/api";
import {
  Coins,
  Plus,
  Zap,
  Filter,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Edit2,
  Calendar,
  IndianRupee,
  Building,
  User,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  ChevronRight,
} from "lucide-react";
import { PayslipModal } from "./PayslipModal";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function PayrollDashboard() {
  const { user, token } = useAuth() || {};
  const isAdminOrHR = user?.permissions?.includes("payroll:view_all") || false;
  const canGenerate = user?.permissions?.includes("payroll:generate") || false;
  const canUpdate = user?.permissions?.includes("payroll:update") || false;
  const canMarkPaid = user?.permissions?.includes("payroll:mark_paid") || false;
  const canDelete = user?.permissions?.includes("payroll:delete") || false;

  // State
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  // Form States
  const [generateForm, setGenerateForm] = useState({
    employee: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    allowance: 0,
    bonus: 0,
    deduction: 0,
    remarks: "",
  });

  const [editForm, setEditForm] = useState({
    allowance: 0,
    bonus: 0,
    deduction: 0,
    remarks: "",
  });

  const [payForm, setPayForm] = useState({
    paymentMethod: "Bank Transfer",
  });

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (isAdminOrHR) {
        // Fetch payroll list for Admin/HR
        const filters = {
          month: selectedMonth,
          year: selectedYear,
          status: statusFilter,
          search: searchQuery,
        };
        const data = await getPayrolls(filters, token);
        setPayrolls(data.payrolls || []);

        // Fetch monthly report
        const reportData = await getMonthlyPayrollReport(selectedMonth, selectedYear, token);
        setReport(reportData);

        // Fetch employees list for dropdown (only if not loaded)
        if (employees.length === 0) {
          const empData = await getUsers(token);
          setEmployees(empData || []);
        }
      } else {
        // Fetch history for logged in Employee
        // First we need to find their employee ID. If user has employeeProfile, use it.
        // We will fetch their history by employeeId.
        if (user?.employeeId) {
          const data = await getEmployeePayrollHistory(user.employeeId, token);
          setPayrolls(data || []);
        } else {
          // Fallback: If employeeId is not directly on user, search by user._id or let backend handle
          // For now, getEmployeePayrollHistory handles this.
          const data = await getEmployeePayrollHistory("me", token);
          setPayrolls(data || []);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load payroll data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, selectedMonth, selectedYear, statusFilter, searchQuery]);

  // Handle Auto Generation
  const handleAutoGenerate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      const result = await autoGeneratePayroll(selectedMonth, selectedYear, token);
      setSuccessMsg(result.message || "Payroll auto-generation completed!");
      setShowAutoModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to run auto payroll generator.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Individual Generation
  const handleIndividualGenerate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await generatePayroll(generateForm, token);
      setSuccessMsg("Payroll generated successfully for the employee!");
      setShowGenerateModal(false);
      // Reset form
      setGenerateForm({
        employee: "",
        month: selectedMonth,
        year: selectedYear,
        allowance: 0,
        bonus: 0,
        deduction: 0,
        remarks: "",
      });
      fetchData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to generate payroll.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Payroll
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await updatePayroll(selectedPayroll._id, editForm, token);
      setSuccessMsg("Payroll record updated successfully!");
      setShowEditModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to update payroll.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Pay Payroll
  const handlePaySubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await markPayrollAsPaid(selectedPayroll._id, payForm.paymentMethod, token);
      setSuccessMsg("Payroll marked as PAID successfully!");
      setShowPayModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to process payment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Payroll
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payroll record?")) return;
    try {
      setLoading(true);
      setError("");
      await deletePayroll(id, token);
      setSuccessMsg("Payroll record deleted successfully.");
      fetchData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to delete payroll.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Toast Success Message */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 font-semibold border border-emerald-400/20 animate-bounce">
          <CheckCircle2 size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <Coins className="text-brand-primary" size={28} />
            Payroll Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isAdminOrHR
              ? "Process salaries, generate payslips, track deductions, and view monthly payroll analytics."
              : "View your monthly salary slips, deductions, bonuses, and payment history."}
          </p>
        </div>

        {canGenerate && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAutoModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm px-4.5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <Zap size={16} />
              Run Auto Payroll
            </button>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-sm px-4.5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <Plus size={16} />
              Generate Payroll
            </button>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Analytics widgets for Admin/HR */}
      {isAdminOrHR && report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl" />
            <span className="p-3 bg-blue-50 text-blue-600 rounded-xl inline-block">
              <IndianRupee size={20} />
            </span>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4">Total Payroll Cost</h3>
            <p className="text-2xl font-black text-slate-800 mt-1">
              ₹{(report.totals?.netSalary || 0).toLocaleString("en-IN")}
            </p>
            <div className="text-[10px] text-slate-400 font-semibold mt-2">
              Gross: ₹{(report.totals?.grossSalary || 0).toLocaleString("en-IN")}
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl" />
            <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl inline-block">
              <CheckCircle2 size={20} />
            </span>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4">Paid Salaries</h3>
            <p className="text-2xl font-black text-slate-800 mt-1">{report.paidCount}</p>
            <div className="text-[10px] text-slate-400 font-semibold mt-2">
              Total processed: {report.headcount} employees
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl" />
            <span className="p-3 bg-amber-50 text-amber-600 rounded-xl inline-block">
              <Clock size={20} />
            </span>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4">Pending Payments</h3>
            <p className="text-2xl font-black text-slate-800 mt-1">{report.pendingCount}</p>
            <div className="text-[10px] text-slate-400 font-semibold mt-2">
              Awaiting bank transfers
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl" />
            <span className="p-3 bg-purple-50 text-purple-600 rounded-xl inline-block">
              <TrendingUp size={20} />
            </span>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4">Deductions & PF</h3>
            <p className="text-2xl font-black text-slate-800 mt-1">
              ₹{((report.totals?.deduction || 0) + (report.totals?.pf || 0) + (report.totals?.tax || 0)).toLocaleString("en-IN")}
            </p>
            <div className="text-[10px] text-slate-400 font-semibold mt-2">
              PF: ₹{(report.totals?.pf || 0).toLocaleString("en-IN")} | Tax: ₹{(report.totals?.tax || 0).toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      )}

      {/* Filters & Control Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Month Selector */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl pl-4 pr-10 py-2.5 outline-none focus:border-brand-primary"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
            <Calendar size={16} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Year Selector */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl pl-4 pr-10 py-2.5 outline-none focus:border-brand-primary"
            >
              {[2025, 2026, 2027, 2028].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            <Calendar size={16} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
          </div>

          {isAdminOrHR && (
            <>
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl pl-4 pr-10 py-2.5 outline-none focus:border-brand-primary"
                >
                  <option value="">All Statuses</option>
                  <option value="Generated">Generated</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <Filter size={16} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </>
          )}
        </div>

        {isAdminOrHR && (
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-brand-primary placeholder-slate-400"
            />
            <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          </div>
        )}
      </div>

      {/* Main Table Listing */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-500 font-semibold">Loading payroll records...</span>
          </div>
        ) : payrolls.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <Coins size={48} className="text-slate-300 mb-4" />
            <h3 className="text-base font-extrabold text-slate-700">No Payroll Records Found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              {isAdminOrHR
                ? "No payroll records exist for the selected month and year. Click 'Run Auto Payroll' to generate records."
                : "You do not have any salary slips generated for this period."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4">Basic Salary</th>
                  <th className="px-6 py-4">Allowances / Bonus</th>
                  <th className="px-6 py-4">Deductions / Tax</th>
                  <th className="px-6 py-4">Net Salary</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150/50 text-slate-700 text-sm font-medium">
                {payrolls.map((payroll) => (
                  <tr key={payroll._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-primary/8 text-brand-primary font-bold flex items-center justify-center text-sm uppercase">
                          {payroll.employeeSnapshot?.name?.slice(0, 2) || "EM"}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-800">
                            {payroll.employeeSnapshot?.name || payroll.employee?.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                            {payroll.employeeSnapshot?.employeeCode || payroll.employee?.employeeCode} • {payroll.employeeSnapshot?.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-slate-600">
                      {MONTH_NAMES[payroll.month - 1]} {payroll.year}
                    </td>
                    <td className="px-6 py-4.5 font-mono">
                      ₹{payroll.basicSalary.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4.5 text-emerald-600">
                      <div className="font-mono">
                        +₹{(payroll.allowance + payroll.bonus).toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        A: ₹{payroll.allowance} | B: ₹{payroll.bonus}
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-rose-500">
                      <div className="font-mono">
                        -₹{(payroll.deduction + payroll.pf + payroll.tax).toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        D: ₹{payroll.deduction} | PF: ₹{payroll.pf} | Tax: ₹{payroll.tax}
                      </div>
                    </td>
                    <td className="px-6 py-4.5 font-extrabold text-slate-800 font-mono">
                      ₹{payroll.netSalary.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold leading-none ${
                          payroll.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : payroll.status === "Generated"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            payroll.status === "Paid"
                              ? "bg-emerald-500"
                              : payroll.status === "Generated"
                              ? "bg-blue-500"
                              : "bg-amber-500"
                          }`}
                        />
                        {payroll.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => {
                            setSelectedPayroll(payroll);
                            setShowPayslipModal(true);
                          }}
                          title="View Payslip"
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Eye size={16} />
                        </button>

                        {payroll.status !== "Paid" && (
                          <>
                            {canUpdate && (
                              <button
                                onClick={() => {
                                  setSelectedPayroll(payroll);
                                  setEditForm({
                                    allowance: payroll.allowance,
                                    bonus: payroll.bonus,
                                    deduction: payroll.deduction,
                                    remarks: payroll.remarks || "",
                                  });
                                  setShowEditModal(true);
                                }}
                                title="Edit Salary"
                                className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            {canMarkPaid && (
                              <button
                                onClick={() => {
                                  setSelectedPayroll(payroll);
                                  setShowPayModal(true);
                                }}
                                title="Process Payment"
                                className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(payroll._id)}
                                title="Delete Payroll"
                                className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Auto Payroll Scheduler Modal */}
      {showAutoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 animate-scale-up">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Zap className="text-violet-600" size={22} />
              Run Auto Payroll
            </h3>
            <p className="text-slate-500 text-xs mt-1.5">
              This will automatically calculate and generate pending payroll records for all **Active** employees in the selected period.
            </p>

            <form onSubmit={handleAutoGenerate} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl p-3 outline-none"
                  >
                    {MONTH_NAMES.map((name, i) => (
                      <option key={i + 1} value={i + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl p-3 outline-none"
                  >
                    {[2025, 2026, 2027, 2028].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAutoModal(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-sm py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? "Generating..." : "Run Scheduler"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Payroll Generation Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full p-6 animate-scale-up">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Plus className="text-brand-primary" size={22} />
              Generate Individual Payroll
            </h3>
            <p className="text-slate-500 text-xs mt-1.5">
              Select an employee and fill in their monthly bonus, allowance, and deductions.
            </p>

            <form onSubmit={handleIndividualGenerate} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Employee</label>
                <select
                  required
                  value={generateForm.employee}
                  onChange={(e) => setGenerateForm({ ...generateForm, employee: e.target.value })}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl p-3 outline-none"
                >
                  <option value="">Select Employee...</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Month</label>
                  <select
                    value={generateForm.month}
                    onChange={(e) => setGenerateForm({ ...generateForm, month: Number(e.target.value) })}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl p-3 outline-none"
                  >
                    {MONTH_NAMES.map((name, i) => (
                      <option key={i + 1} value={i + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Year</label>
                  <select
                    value={generateForm.year}
                    onChange={(e) => setGenerateForm({ ...generateForm, year: Number(e.target.value) })}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl p-3 outline-none"
                  >
                    {[2025, 2026, 2027, 2028].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Allowance (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={generateForm.allowance}
                    onChange={(e) => setGenerateForm({ ...generateForm, allowance: Number(e.target.value) })}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl p-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Bonus (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={generateForm.bonus}
                    onChange={(e) => setGenerateForm({ ...generateForm, bonus: Number(e.target.value) })}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl p-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Deduction (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={generateForm.deduction}
                    onChange={(e) => setGenerateForm({ ...generateForm, deduction: Number(e.target.value) })}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl p-3 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Remarks</label>
                <textarea
                  value={generateForm.remarks}
                  onChange={(e) => setGenerateForm({ ...generateForm, remarks: e.target.value })}
                  placeholder="e.g. Special festival bonus added"
                  rows="2"
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl p-3 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-sm py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-sm py-3 rounded-xl transition-all"
                >
                  {submitting ? "Processing..." : "Generate Payroll"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Payroll Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 animate-scale-up">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Edit2 className="text-blue-500" size={20} />
              Adjust Salary Components
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Modify the earnings and deductions for **{selectedPayroll?.employeeSnapshot?.name}** for **{MONTH_NAMES[selectedPayroll?.month - 1]} {selectedPayroll?.year}**.
            </p>

            <form onSubmit={handleEditSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Allowance (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.allowance}
                    onChange={(e) => setEditForm({ ...editForm, allowance: Number(e.target.value) })}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl p-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Bonus (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.bonus}
                    onChange={(e) => setEditForm({ ...editForm, bonus: Number(e.target.value) })}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl p-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Deduction (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.deduction}
                    onChange={(e) => setEditForm({ ...editForm, deduction: Number(e.target.value) })}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl p-3 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Remarks</label>
                <textarea
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  placeholder="Reason for adjustment..."
                  rows="2"
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl p-3 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-sm py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm py-3 rounded-xl transition-all"
                >
                  {submitting ? "Updating..." : "Save Adjustments"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Payroll Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 animate-scale-up">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-600" size={22} />
              Process Payment
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Mark this salary of **₹{selectedPayroll?.netSalary.toLocaleString("en-IN")}** for **{selectedPayroll?.employeeSnapshot?.name}** as paid.
            </p>

            <form onSubmit={handlePaySubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Payment Method</label>
                <select
                  value={payForm.paymentMethod}
                  onChange={(e) => setPayForm({ paymentMethod: e.target.value })}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl p-3 outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-sm py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-xl transition-all"
                >
                  {submitting ? "Processing..." : "Mark as Paid"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Detail Modal */}
      {showPayslipModal && selectedPayroll && (
        <PayslipModal
          payroll={selectedPayroll}
          onClose={() => {
            setSelectedPayroll(null);
            setShowPayslipModal(false);
          }}
        />
      )}
    </div>
  );
}
