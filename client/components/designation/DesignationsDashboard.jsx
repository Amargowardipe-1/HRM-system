"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "@/lib/api";
import { Plus, RefreshCw } from "lucide-react";
import { DesignationFilters } from "./DesignationFilters";
import { DesignationTable } from "./DesignationTable";
import { DesignationModal } from "./DesignationModal";
import { DesignationForm } from "./DesignationForm";

export function DesignationsDashboard({
  initialDesignations = [],
  initialPagination = { total: 0, page: 1, limit: 8, pages: 1 },
  departments = [],
  token = null,
  searchParams = { search: "", department: "", status: "", page: "1" },
}) {
  const router = useRouter();
  const { user: currentUser } = useAuth() || {};
  const isAdmin = currentUser?.role === "Admin";

  const [searchTerm, setSearchTerm] = useState(searchParams.search || "");
  const [selectedDept, setSelectedDept] = useState(searchParams.department || "");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.status || "");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with URL search params when they change
  const searchVal = searchParams.search;
  const deptVal = searchParams.department;
  const statusVal = searchParams.status;

  useEffect(() => {
    setSearchTerm(searchVal || "");
    setSelectedDept(deptVal || "");
    setSelectedStatus(statusVal || "");
  }, [searchVal, deptVal, statusVal]);

  // Push new query params to URL to trigger server-side re-fetch
  const updateUrlParams = (search, dept, status, pageNum) => {
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    if (dept) query.append("department", dept);
    if (status) query.append("status", status);
    if (pageNum && pageNum !== 1) query.append("page", pageNum);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    router.push(`/designations${queryString}`);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    updateUrlParams(val, selectedDept, selectedStatus, 1);
  };

  const handleDeptChange = (val) => {
    setSelectedDept(val);
    updateUrlParams(searchTerm, val, selectedStatus, 1);
  };

  const handleStatusChange = (val) => {
    setSelectedStatus(val);
    updateUrlParams(searchTerm, selectedDept, val, 1);
  };

  const handlePageChange = (pageNum) => {
    updateUrlParams(searchTerm, selectedDept, selectedStatus, pageNum);
  };

  const handleRefresh = () => {
    router.refresh();
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormError("");
    setShowCreateModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (desig) => {
    setSelectedDesignation(desig);
    setFormError("");
    setShowEditModal(true);
  };

  // Create Submit
  const handleCreateSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError("");
    try {
      await createDesignation(formData, token);
      setShowCreateModal(false);
      router.refresh();
    } catch (err) {
      setFormError(err.message || "Failed to create designation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Submit
  const handleEditSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError("");
    try {
      await updateDesignation(selectedDesignation._id, formData, token);
      setShowEditModal(false);
      router.refresh();
    } catch (err) {
      setFormError(err.message || "Failed to update designation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Designation
  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete designation "${title}"?`)) {
      try {
        await deleteDesignation(id, token);
        router.refresh();
      } catch (err) {
        alert(err.message || "Failed to delete designation.");
      }
    }
  };

  return (
    <main className="grid gap-6 p-8 max-md:p-4 max-sm:p-3 max-w-[1280px] mx-auto w-full">
      {/* Header section */}
      <section className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start" aria-label="Page title">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text tracking-tight">Designations</h1>
          <p className="text-sm text-brand-muted mt-1">
            Configure and manage corporate titles, levels, and department linkages.
          </p>
        </div>
        <div className="flex gap-3 max-sm:w-full">
          {isAdmin && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold px-4.5 transition-all shadow-md shadow-brand-primary/10 active:scale-98 cursor-pointer max-sm:flex-1"
            >
              <Plus size={18} />
              Add Designation
            </button>
          )}
          <button
            onClick={handleRefresh}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 border border-slate-200 bg-white text-brand-text rounded-lg font-semibold px-4.5 transition-all hover:bg-slate-50 active:scale-98 cursor-pointer max-sm:w-12 max-sm:px-0"
            title="Refresh list"
          >
            <RefreshCw size={17} />
            <span className="max-sm:hidden">Refresh</span>
          </button>
        </div>
      </section>

      {/* Filter toolbar */}
      <DesignationFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedDept={selectedDept}
        onDeptChange={handleDeptChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        departments={departments}
      />

      {/* Table Section */}
      <DesignationTable
        designations={initialDesignations}
        isLoading={false}
        isAdmin={isAdmin}
        onEditClick={handleOpenEdit}
        onDeleteClick={handleDelete}
        pagination={initialPagination}
        page={Number(searchParams.page || 1)}
        onPageChange={handlePageChange}
      />

      {/* CREATE MODAL */}
      <DesignationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Designation"
        subtitle="Define a new designation and map it to a department."
      >
        <DesignationForm
          departments={departments}
          onSubmit={handleCreateSubmit}
          isSubmitting={isSubmitting}
          buttonText="Add Designation"
          error={formError}
        />
      </DesignationModal>

      {/* EDIT MODAL */}
      <DesignationModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Designation"
        subtitle="Modify designation parameters and level."
      >
        <DesignationForm
          initialData={selectedDesignation}
          departments={departments}
          onSubmit={handleEditSubmit}
          isSubmitting={isSubmitting}
          buttonText="Save Changes"
          error={formError}
        />
      </DesignationModal>
    </main>
  );
}
