"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  getUsers, 
  getUserById, 
  updateUser 
} from "@/lib/api";
import { 
  Landmark, 
  Edit, 
  Search, 
  CreditCard, 
  Hash, 
  MapPin, 
  User, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

export function BankDetailsDashboard() {
  const { user } = useAuth() || {};
  const isAdminOrHR = user?.role === "Admin" || user?.role === "HR";
  
  const [employees, setEmployees] = useState([]);
  const [personalDetails, setPersonalDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    ifsc: "",
    branch: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchBankData = async () => {
    setLoading(true);
    setError("");
    try {
      if (isAdminOrHR) {
        // Admins/HR fetch all employees to manage bank details
        const data = await getUsers();
        setEmployees(data || []);
      } else if (user?.employeeId) {
        // Employees fetch their own profile details
        const data = await getUserById(user.employeeId);
        setPersonalDetails(data);
      } else {
        // Fallback if employee ID is not present
        const data = await getUserById("me");
        setPersonalDetails(data);
      }
    } catch (err) {
      setError(err.message || "Failed to load bank details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBankData();
    }
  }, [user]);

  // Filter employees for Admin/HR view
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim().toLowerCase();
      const code = (emp.employeeCode || "").toLowerCase();
      const bank = (emp.bankDetails?.bankName || "").toLowerCase();
      const search = searchTerm.toLowerCase();

      return fullName.includes(search) || code.includes(search) || bank.includes(search);
    });
  }, [employees, searchTerm]);

  // Open Edit Modal
  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      bankName: emp.bankDetails?.bankName || "",
      accountNumber: emp.bankDetails?.accountNumber || "",
      ifsc: emp.bankDetails?.ifsc || "",
      branch: emp.bankDetails?.branch || "",
    });
    setShowEditModal(true);
  };

  // Submit Edit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      const targetId = isAdminOrHR ? selectedEmployee._id : user?.employeeId;
      if (!targetId) throw new Error("Employee ID not found.");

      await updateUser(targetId, {
        bankDetails: {
          bankName: formData.bankName.trim(),
          accountNumber: formData.accountNumber.trim(),
          ifsc: formData.ifsc.trim().toUpperCase(),
          branch: formData.branch.trim(),
        }
      });

      setSuccessMsg("Bank details updated successfully!");
      setShowEditModal(false);
      
      // Refresh data
      await fetchBankData();

      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to update bank details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
        <p className="text-slate-500 font-bold text-sm">Loading bank details dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1 max-sm:p-0">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2.5">
          <Landmark className="text-brand-primary" size={26} />
          Bank Details Management
        </h1>
        <p className="text-slate-500 text-xs">
          {isAdminOrHR 
            ? "Manage and audit official bank accounts and payment channels for all corporate staff." 
            : "Review and update your official bank account details for salary disbursement."}
        </p>
      </div>

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-sm font-semibold animate-fade-in">
          <CheckCircle size={18} />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-sm font-semibold animate-fade-in">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Dynamic Render based on Role */}
      {isAdminOrHR ? (
        // ==========================================
        // ADMIN / HR VIEW
        // ==========================================
        <div className="space-y-6">
          {/* Search bar & Stats */}
          <div className="grid grid-cols-[1fr_auto] max-md:grid-cols-1 gap-4 items-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex min-h-[40px] items-center gap-2.5 border border-slate-200 rounded-lg bg-slate-50 px-3 text-slate-400 focus-within:border-brand-primary focus-within:bg-white focus-within:ring-3 focus-within:ring-brand-primary/8 transition-all">
              <Search size={18} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by employee name, code, or bank..."
                className="w-full border-0 outline-none bg-transparent text-brand-text text-sm placeholder:text-slate-400"
              />
            </div>
            <div className="text-sm font-bold text-slate-500 px-2">
              Total Staff: {filteredEmployees.length}
            </div>
          </div>

          {/* Employees Table */}
          <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">Employee</th>
                    <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">Code</th>
                    <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">Bank Name</th>
                    <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">Account Number</th>
                    <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">IFSC</th>
                    <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">Branch</th>
                    <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-center w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.length ? (
                    filteredEmployees.map((emp) => (
                      <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 align-middle font-bold text-slate-800">
                          {emp.firstName} {emp.lastName}
                        </td>
                        <td className="p-4 align-middle font-mono text-xs text-slate-500 font-bold">
                          {emp.employeeCode}
                        </td>
                        <td className="p-4 align-middle text-slate-600 font-semibold">
                          {emp.bankDetails?.bankName || <span className="text-slate-300 font-normal">Not Configured</span>}
                        </td>
                        <td className="p-4 align-middle font-mono text-sm text-slate-600">
                          {emp.bankDetails?.accountNumber || "-"}
                        </td>
                        <td className="p-4 align-middle font-mono text-sm text-slate-600">
                          {emp.bankDetails?.ifsc || "-"}
                        </td>
                        <td className="p-4 align-middle text-slate-600">
                          {emp.bankDetails?.branch || "-"}
                        </td>
                        <td className="p-4 align-middle text-center">
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 text-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary-dark rounded-lg transition-colors cursor-pointer"
                            title="Edit Bank Details"
                          >
                            <Edit size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                        No employees found matching the search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        // ==========================================
        // EMPLOYEE VIEW
        // ==========================================
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Glassmorphism Card */}
          <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200 rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full filter blur-xl translate-x-8 -translate-y-8" />
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <CreditCard size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Salary Account Details</h3>
                  <p className="text-slate-500 text-xs font-semibold">Active Disbursement Account</p>
                </div>
              </div>
              
              <button
                onClick={() => handleOpenEdit(personalDetails)}
                className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs py-2 px-3 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Edit size={13} />
                Update Account
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Landmark size={11} />
                  Bank Name
                </span>
                <p className="text-slate-700 font-bold text-sm">
                  {personalDetails?.bankDetails?.bankName || <span className="text-slate-300 font-normal">Not Provided</span>}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Hash size={11} />
                  Account Number
                </span>
                <p className="text-slate-700 font-mono font-bold text-sm">
                  {personalDetails?.bankDetails?.accountNumber || <span className="text-slate-300 font-normal">Not Provided</span>}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Hash size={11} />
                  IFSC Code
                </span>
                <p className="text-slate-700 font-mono font-bold text-sm">
                  {personalDetails?.bankDetails?.ifsc || <span className="text-slate-300 font-normal">Not Provided</span>}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <MapPin size={11} />
                  Branch Address
                </span>
                <p className="text-slate-700 font-bold text-sm">
                  {personalDetails?.bankDetails?.branch || <span className="text-slate-300 font-normal">Not Provided</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice Card */}
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-5 flex gap-3.5 items-start">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Disbursement Security Notice</h4>
              <p className="text-amber-700/80 text-xs mt-1 leading-normal">
                Please verify your bank details carefully. Future payroll payouts, direct transfers, and bonuses will be disbursed exclusively to this account. Contact People Ops support for any bank branch verification issues.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bank Details Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 animate-scale-up">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Landmark className="text-brand-primary" size={22} />
              {isAdminOrHR ? "Edit Bank Details" : "Update Bank Details"}
            </h3>
            {isAdminOrHR && (
              <p className="text-slate-500 text-xs mt-1.5 font-semibold">
                Updating account for: <span className="text-slate-700 font-extrabold">{selectedEmployee?.firstName} {selectedEmployee?.lastName}</span>
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Bank Name</label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank, ICICI Bank"
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl p-3 outline-none focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/8 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Account Number</label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{9,18}"
                  title="Account number must be between 9 and 18 digits long"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, "") })}
                  placeholder="e.g. 50100293847583"
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-mono font-semibold rounded-xl p-3 outline-none focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/8 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">IFSC Code</label>
                <input
                  type="text"
                  required
                  pattern="^[A-Za-z]{4}0[A-Za-z0-9]{6}$"
                  title="IFSC must be an 11-character alphanumeric code (e.g. HDFC0000123)"
                  value={formData.ifsc}
                  onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                  placeholder="e.g. HDFC0000123"
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-mono font-semibold rounded-xl p-3 outline-none focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/8 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Branch Name / Address</label>
                <input
                  type="text"
                  required
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  placeholder="e.g. Sector 62, Noida Branch"
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl p-3 outline-none focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/8 transition-all"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-sm py-3 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary text-white font-bold text-sm py-3 rounded-xl shadow-md shadow-brand-primary/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
