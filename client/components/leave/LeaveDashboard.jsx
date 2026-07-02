"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { applyLeaveRequest, getLeaveRequests, updateLeaveRequestStatus } from "@/lib/api";
import { LeaveTable } from "./LeaveTable";
import { LeaveForm } from "./LeaveForm";
import { DesignationModal as LeaveModal } from "@/components/designation/DesignationModal";
import { Plus, RefreshCw, Filter, User, X } from "lucide-react";

export function LeaveDashboard({
  initialLeaves = [],
  employees = [],
  currentUser = {},
  token = null,
}) {
  const router = useRouter();
  const isAdmin = currentUser.role === "Admin";
  const hasLeaveViewAll = currentUser.permissions?.includes("leave:view_all") || false;
  const showFilters = hasLeaveViewAll;

  const [leaves, setLeaves] = useState(initialLeaves);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [error, setError] = useState("");

  // Re-fetch leaves when filters change
  useEffect(() => {
    const fetchFilteredLeaves = async () => {
      setError("");
      try {
        const data = await getLeaveRequests(
          {
            status: selectedStatus,
            employeeId: selectedEmployee,
          },
          token
        );
        setLeaves(data);
      } catch (err) {
        setError(err.message || "Failed to load leave requests.");
      }
    };

    if (selectedStatus !== "" || selectedEmployee !== "") {
      fetchFilteredLeaves();
    }
  }, [selectedStatus, selectedEmployee]);

  const loadAllLeaves = async () => {
    setError("");
    try {
      const data = await getLeaveRequests(
        {
          status: selectedStatus,
          employeeId: selectedEmployee,
        },
        token
      );
      setLeaves(data);
    } catch (err) {
      setError(err.message || "Failed to refresh leave requests.");
    }
  };

  const handleApplyLeave = async (formData) => {
    setIsSubmitting(true);
    setError("");
    try {
      await applyLeaveRequest(formData, token);
      await loadAllLeaves();
      setShowApplyModal(false);
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to submit leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (leaveId) => {
    setIsActioning(true);
    setError("");
    try {
      await updateLeaveRequestStatus(leaveId, "Approved", token);
      await loadAllLeaves();
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to approve leave request.");
    } finally {
      setIsActioning(false);
    }
  };

  const handleReject = async (leaveId) => {
    setIsActioning(true);
    setError("");
    try {
      await updateLeaveRequestStatus(leaveId, "Rejected", token);
      await loadAllLeaves();
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to reject leave request.");
    } finally {
      setIsActioning(false);
    }
  };

  return (
    <main className="grid gap-6 p-8 max-md:p-4 max-sm:p-3 max-w-[1280px] mx-auto w-full">
      {/* Page Header */}
      <section className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start" aria-label="Page title">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text tracking-tight">Leave Management</h1>
          <p className="text-sm text-brand-muted mt-1">
            Apply for leave, track status, and manage employee leave requests.
          </p>
        </div>
        <div className="flex gap-3 max-sm:w-full">
          {currentUser.permissions?.includes("leave:apply") && (
            <button
              onClick={() => setShowApplyModal(true)}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold px-4.5 transition-all shadow-md shadow-brand-primary/10 active:scale-98 cursor-pointer max-sm:flex-1"
            >
              <Plus size={18} />
              Apply for Leave
            </button>
          )}
          <button
            onClick={loadAllLeaves}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 border border-slate-200 bg-white text-brand-text rounded-lg font-semibold px-4.5 transition-all hover:bg-slate-50 active:scale-98 cursor-pointer max-sm:w-12 max-sm:px-0"
            title="Refresh list"
          >
            <RefreshCw size={17} />
            <span className="max-sm:hidden">Refresh</span>
          </button>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Filters (Status and Employee Select for Admin/HR) */}
      <section
        className="grid grid-cols-[1fr_auto_auto] max-md:grid-cols-1 gap-4 items-center border border-slate-200/80 rounded-xl bg-white shadow-sm p-4.5"
        aria-label="Leave filters"
      >
        <div className="text-sm font-bold text-brand-text flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          Filter Requests
        </div>

        <div className="flex gap-3 max-md:grid max-md:grid-cols-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary text-sm transition-all cursor-pointer text-slate-600"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {showFilters && (
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary text-sm transition-all cursor-pointer text-slate-600 max-w-[220px]"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          )}
        </div>
      </section>

      {/* Leave Log Table */}
      <LeaveTable
        records={leaves}
        showEmployeeColumn={showFilters}
        isAdminOrHR={showFilters}
        onApprove={handleApprove}
        onReject={handleReject}
        isActioning={isActioning}
      />

      {/* APPLY LEAVE MODAL */}
      <LeaveModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Apply for Leave"
        subtitle="Submit a new leave application for approval."
      >
        <LeaveForm onSubmit={handleApplyLeave} isSubmitting={isSubmitting} error={error} />
      </LeaveModal>
    </main>
  );
}
