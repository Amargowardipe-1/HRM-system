"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  FolderTree,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  createDepartment,
  deleteDepartment,
  getDepartmentById,
  getDepartments,
  getUsers,
  updateDepartment,
} from "@/lib/api";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export default function DepartmentsPage() {
  const { user: currentUser } = useAuth() || {};

  // Permissions based on user role
  const canCreate = currentUser?.role === "Admin";
  const canEdit = currentUser?.role === "Admin" || currentUser?.role === "HR";
  const canDelete = currentUser?.role === "Admin";

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal visibility states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Selected department details
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptDetails, setDeptDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formManager, setFormManager] = useState("");
  const [formParentDepartment, setFormParentDepartment] = useState("");
  const [formCostCenter, setFormCostCenter] = useState("");
  const [formBudget, setFormBudget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Load all departments and users
  async function loadData() {
    setIsLoading(true);
    setError("");
    try {
      const [depts, allUsers] = await Promise.all([getDepartments(), getUsers()]);
      setDepartments(depts);
      setUsers(allUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filtered departments based on search term
  const filteredDepartments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return departments.filter(
      (dept) =>
        dept.name?.toLowerCase().includes(term) ||
        dept.description?.toLowerCase().includes(term)
    );
  }, [departments, searchTerm]);

  // Open details modal and fetch detailed department members
  async function handleOpenDetails(dept) {
    setSelectedDept(dept);
    setActiveTab("overview");
    setShowDetailModal(true);
    setIsLoadingDetails(true);
    try {
      const details = await getDepartmentById(dept._id);
      setDeptDetails(details);
    } catch (err) {
      setError(`Failed to load members: ${err.message}`);
    } finally {
      setIsLoadingDetails(false);
    }
  }

  // Open edit modal and prepopulate form
  function handleOpenEdit(dept, event) {
    if (event) event.stopPropagation();
    setSelectedDept(dept);
    setFormName(dept.name || "");
    setFormDescription(dept.description || "");
    setFormManager(dept.manager?._id || dept.manager || "");
    setFormParentDepartment(dept.parentDepartment?._id || dept.parentDepartment || "");
    setFormCostCenter(dept.costCenterCode || "GEN-CORP");
    setFormBudget(dept.allocatedBudget || 0);
    setFormError("");
    setShowEditModal(true);
  }

  // Open create modal
  function handleOpenCreate() {
    setFormName("");
    setFormDescription("");
    setFormManager("");
    setFormParentDepartment("");
    setFormCostCenter("GEN-CORP");
    setFormBudget(0);
    setFormError("");
    setShowCreateModal(true);
  }

  // Open delete confirm modal
  function handleOpenDelete(dept, event) {
    if (event) event.stopPropagation();
    setSelectedDept(dept);
    setShowDeleteConfirm(true);
  }

  // Create department submit handler
  async function handleCreateSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    try {
      await createDepartment({
        name: formName,
        description: formDescription,
        manager: formManager || null,
        parentDepartment: formParentDepartment || null,
        costCenterCode: formCostCenter || "GEN-CORP",
        allocatedBudget: Number(formBudget) || 0,
      });
      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Edit department submit handler
  async function handleEditSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    try {
      await updateDepartment(selectedDept._id, {
        name: formName,
        description: formDescription,
        manager: formManager || null,
        parentDepartment: formParentDepartment || null,
        costCenterCode: formCostCenter || "GEN-CORP",
        allocatedBudget: Number(formBudget) || 0,
      });
      setShowEditModal(false);
      await loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Delete department handler
  async function handleDeleteConfirm() {
    try {
      setError("");
      await deleteDepartment(selectedDept._id);
      setShowDeleteConfirm(false);
      setSelectedDept(null);
      await loadData();
    } catch (err) {
      setError(err.message);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="grid gap-5.5">
      {/* Page Header */}
      <section className="flex items-start justify-between gap-4 max-sm:grid max-sm:gap-3">
        <div>
          <p className="text-brand-primary text-[11px] font-bold uppercase tracking-widest leading-none mb-1.5">Organization</p>
          <h1 className="text-3xl max-sm:text-2xl font-extrabold text-brand-text mb-2">Departments</h1>
          <p className="text-sm text-brand-muted">
            Manage your company departments, assign managers, and view active members.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 justify-end max-sm:w-full">
          {canCreate && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold px-4.5 transition-all active:scale-98 shadow-md shadow-brand-primary/10 cursor-pointer max-sm:w-full"
            >
              <Plus size={17} />
              Add Department
            </button>
          )}
          <button
            onClick={loadData}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 border border-slate-200 bg-white text-brand-text rounded-lg font-semibold px-4.5 transition-all hover:bg-slate-50 active:scale-98 cursor-pointer max-sm:w-full"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </section>

      {/* Filter toolbar */}
      <section className="grid grid-cols-[1fr_auto] max-sm:grid-cols-1 gap-3.5 items-center border border-slate-200/80 rounded-xl bg-white shadow-sm p-4.5" aria-label="Department filters">
        <div className="flex min-h-[40px] items-center gap-2.5 border border-slate-200 rounded-lg bg-slate-50 px-3 text-slate-400 focus-within:border-brand-primary focus-within:bg-white focus-within:ring-3 focus-within:ring-brand-primary/8 transition-all">
          <Search size={18} />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search departments by name or description..."
            className="w-full border-0 outline-none bg-transparent text-brand-text text-sm placeholder:text-slate-400"
          />
        </div>
        <div className="text-right max-sm:text-left text-brand-muted text-sm font-semibold whitespace-nowrap px-1">
          {filteredDepartments.length} of {departments.length} departments
        </div>
      </section>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold">
          {error}
        </div>
      ) : null}

      {/* Card Grid */}
      {isLoading ? (
        <div className="grid h-[240px] place-items-center text-brand-muted font-medium bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin" size={20} />
            Loading departments data...
          </div>
        </div>
      ) : filteredDepartments.length ? (
        <div className="grid grid-cols-3 max-xl:grid-cols-2 max-md:grid-cols-1 gap-5">
          {filteredDepartments.map((dept) => (
            <div
              key={dept._id}
              onClick={() => handleOpenDetails(dept)}
              className="border border-slate-200 rounded-xl bg-white p-5 hover:-translate-y-1 hover:shadow-md transition-all shadow-sm flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div className="grid w-[44px] h-[44px] place-items-center rounded-xl bg-[#e7f3f1] text-brand-primary border border-slate-100">
                    <FolderTree size={20} />
                  </div>
                  {/* Actions for authorized users */}
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    {canEdit && (
                      <button
                        onClick={(e) => handleOpenEdit(dept, e)}
                        className="grid w-[28px] h-[28px] place-items-center border border-slate-200 rounded-md bg-white text-slate-500 hover:text-brand-primary hover:border-slate-300 transition-all active:scale-95"
                        title="Edit department"
                      >
                        <Plus size={12} className="rotate-45" /> {/* placeholder for edit icon or just use standard text */}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={(e) => handleOpenDelete(dept, e)}
                        className="grid w-[28px] h-[28px] place-items-center border border-slate-200 rounded-md bg-white text-red-400 hover:text-red-500 hover:border-red-200 transition-all active:scale-95"
                        title="Delete department"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-brand-text mt-4 flex items-center gap-1.5 flex-wrap">
                  {dept.name}
                  {dept.parentDepartment && (
                    <span className="text-[9px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                      Sub of {dept.parentDepartment.name || dept.parentDepartment}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-brand-muted mt-1 leading-relaxed line-clamp-2 h-[40px]">
                  {dept.description || "No description provided."}
                </p>
              </div>

              <div className="border-t border-slate-100 mt-5 pt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid w-[26px] h-[26px] place-items-center rounded-full bg-slate-100 text-[10px] font-bold text-brand-primary-dark shrink-0">
                    {dept.manager?.name?.slice(0, 1).toUpperCase() || <User size={10} />}
                  </div>
                  <div className="leading-none">
                    <small className="text-[10px] text-brand-muted uppercase font-bold tracking-wider">Manager</small>
                    <p className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">
                      {dept.manager?.name || "Unassigned"}
                    </p>
                  </div>
                </div>
                <span className="inline-flex min-h-[24px] items-center rounded-full bg-slate-100 px-3 text-[11px] font-bold text-brand-primary uppercase tracking-wider">
                  <Users size={12} className="mr-1 shrink-0" />
                  {dept.employeeCount || 0} members
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid h-[180px] place-items-center text-brand-muted font-medium bg-white rounded-xl border border-slate-200/80 shadow-sm">
          No departments found matching your search.
        </div>
      )}

      {/* CREATE Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-900/40 p-6 backdrop-blur-xs max-sm:items-end max-sm:p-3" role="presentation" onMouseDown={() => setShowCreateModal(false)}>
          <section
            className="w-full max-w-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-dept-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3.5 border-b border-slate-200 p-5 relative">
              <div className="grid w-[42px] h-[42px] place-items-center rounded-xl bg-[#e7f3f1] text-brand-primary">
                <FolderTree size={19} />
              </div>
              <div>
                <h2 id="create-dept-title" className="text-lg font-bold text-brand-text">Create Department</h2>
                <p className="text-sm text-brand-muted mt-0.5">Define a new corporate department.</p>
              </div>
              <button className="absolute top-4.5 right-4.5 grid w-[34px] h-[34px] place-items-center border border-slate-200 rounded-lg bg-white text-brand-text hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-98 cursor-pointer" onClick={() => setShowCreateModal(false)} aria-label="Close form">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="grid gap-4.5 p-6">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold">
                  {formError}
                </div>
              )}

              <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
                Department Name
                <input
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Finance, Product Development"
                  className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
                />
              </label>

              <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
                Description
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summarize the core focus of this department..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg bg-white p-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all resize-none"
                />
              </label>

              <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
                Department Manager
                <select
                  value={formManager}
                  onChange={(e) => setFormManager(e.target.value)}
                  className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all cursor-pointer"
                >
                  <option value="">Select Manager (Optional)</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
                Parent Department
                <select
                  value={formParentDepartment}
                  onChange={(e) => setFormParentDepartment(e.target.value)}
                  className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all cursor-pointer"
                >
                  <option value="">No Parent (Top-level)</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3.5">
                <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
                  Cost Center Code
                  <input
                    value={formCostCenter}
                    onChange={(e) => setFormCostCenter(e.target.value)}
                    placeholder="e.g. ENG-HQ"
                    className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
                  />
                </label>

                <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
                  Allocated Budget ($)
                  <input
                    type="number"
                    min="0"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    placeholder="e.g. 150000"
                    className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
                  />
                </label>
              </div>

              <button
                disabled={isSubmitting}
                className="mt-2.5 w-full min-h-[42px] bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md shadow-brand-primary/10 cursor-pointer disabled:opacity-75"
              >
                {isSubmitting ? "Creating..." : "Create Department"}
              </button>
            </form>
          </section>
        </div>
      )}

      {/* EDIT Department Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-900/40 p-6 backdrop-blur-xs max-sm:items-end max-sm:p-3" role="presentation" onMouseDown={() => setShowEditModal(false)}>
          <section
            className="w-full max-w-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-dept-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3.5 border-b border-slate-200 p-5 relative">
              <div className="grid w-[42px] h-[42px] place-items-center rounded-xl bg-[#e7f3f1] text-brand-primary">
                <FolderTree size={19} />
              </div>
              <div>
                <h2 id="edit-dept-title" className="text-lg font-bold text-brand-text">Edit Department</h2>
                <p className="text-sm text-brand-muted mt-0.5">Modify department properties and manager.</p>
              </div>
              <button className="absolute top-4.5 right-4.5 grid w-[34px] h-[34px] place-items-center border border-slate-200 rounded-lg bg-white text-brand-text hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-98 cursor-pointer" onClick={() => setShowEditModal(false)} aria-label="Close form">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="grid gap-4.5 p-6">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold">
                  {formError}
                </div>
              )}

              <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
                Department Name
                <input
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Finance, Product Development"
                  className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
                />
              </label>

              <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
                Description
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summarize the core focus of this department..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg bg-white p-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all resize-none"
                />
              </label>

              <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
                Department Manager
                <select
                  value={formManager}
                  onChange={(e) => setFormManager(e.target.value)}
                  className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all cursor-pointer"
                >
                  <option value="">Select Manager (Optional)</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
                Parent Department
                <select
                  value={formParentDepartment}
                  onChange={(e) => setFormParentDepartment(e.target.value)}
                  className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all cursor-pointer"
                >
                  <option value="">No Parent (Top-level)</option>
                  {departments
                    .filter((d) => d._id !== selectedDept?._id)
                    .map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3.5">
                <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
                  Cost Center Code
                  <input
                    value={formCostCenter}
                    onChange={(e) => setFormCostCenter(e.target.value)}
                    placeholder="e.g. ENG-FE"
                    className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
                  />
                </label>

                <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
                  Allocated Budget ($)
                  <input
                    type="number"
                    min="0"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    placeholder="e.g. 100000"
                    className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
                  />
                </label>
              </div>

              <button
                disabled={isSubmitting}
                className="mt-2.5 w-full min-h-[42px] bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md shadow-brand-primary/10 cursor-pointer disabled:opacity-75"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>
        </div>
      )}

      {/* DETAIL View Right Sidebar Drawer */}
      {showDetailModal && selectedDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end" role="presentation" onMouseDown={() => {
          setShowDetailModal(false);
          setDeptDetails(null);
          setSelectedDept(null);
        }}>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideLeft {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .drawer-animate {
              animation: slideLeft 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}} />
          <section
            className="w-full max-w-[760px] h-screen bg-white shadow-2xl border-l border-slate-200/80 flex flex-col drawer-animate"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-dept-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3.5 border-b border-slate-200 p-5 relative">
              <div className="grid w-[42px] h-[42px] place-items-center rounded-xl bg-[#e7f3f1] text-brand-primary">
                <Building2 size={19} />
              </div>
              <div>
                <h2 id="detail-dept-title" className="text-lg font-bold text-brand-text">Department Info</h2>
                <p className="text-sm text-brand-muted mt-0.5">View department characteristics and active members.</p>
              </div>
              <button className="absolute top-4.5 right-4.5 grid w-[34px] h-[34px] place-items-center border border-slate-200 rounded-lg bg-white text-brand-text hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-98 cursor-pointer" onClick={() => {
                setShowDetailModal(false);
                setDeptDetails(null);
                setSelectedDept(null);
              }} aria-label="Close details">
                <X size={18} />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200 px-6">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`py-3 px-4 font-semibold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "border-brand-primary text-brand-primary font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("members")}
                className={`py-3 px-4 font-semibold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "members"
                    ? "border-brand-primary text-brand-primary font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Members ({deptDetails?.members?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("insights")}
                className={`py-3 px-4 font-semibold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "insights"
                    ? "border-brand-primary text-brand-primary font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Insights
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {activeTab === "overview" && (
                <div className="grid gap-4.5">
                  <div className="pb-4.5 border-b border-slate-200/80">
                    <h3 className="text-xl font-extrabold text-brand-text mb-1">{selectedDept.name}</h3>
                    <p className="text-sm text-brand-muted leading-relaxed">
                      {selectedDept.description || "No description provided."}
                    </p>
                  </div>

                  <div>
                    <small className="block text-brand-muted text-[10px] font-bold uppercase tracking-widest leading-none mb-2">Department Manager</small>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                      <div className="grid w-[40px] h-[40px] place-items-center rounded-full bg-[#e7f3f1] text-[#0f766e] text-sm font-extrabold shrink-0">
                        {selectedDept.manager?.name?.slice(0, 1).toUpperCase() || <User size={16} />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-brand-text leading-tight">{selectedDept.manager?.name || "Unassigned"}</h4>
                        <p className="text-xs text-brand-muted mt-0.5">{selectedDept.manager?.email || "No email linked"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "members" && (
                <div>
                  <small className="block text-brand-muted text-[10px] font-bold uppercase tracking-widest leading-none mb-3">
                    Active Department Members
                  </small>
                  
                  {isLoadingDetails ? (
                    <div className="flex items-center justify-center h-[160px] text-brand-muted text-sm font-semibold">
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Loading members list...
                    </div>
                  ) : deptDetails?.members?.length ? (
                    <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                      {deptDetails.members.map((member) => (
                        <div key={member._id} className="flex flex-col justify-between border border-slate-100 rounded-xl p-4 hover:border-brand-primary/20 hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-start gap-3 justify-between">
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="grid w-[32px] h-[32px] place-items-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-700 uppercase shrink-0">{member.name.slice(0, 1)}</span>
                              <div className="truncate">
                                <span className="block text-sm font-bold text-brand-text truncate leading-tight">{member.name}</span>
                                <span className="block text-[10px] text-brand-muted truncate mt-0.5">{member.email}</span>
                              </div>
                            </div>
                            <span className={`inline-flex min-h-[22px] items-center rounded-full px-2.5 text-[9px] font-bold uppercase tracking-wider ${
                              member.role === "Admin"
                                ? "bg-purple-50 text-purple-600 border border-purple-100"
                                : member.role === "HR"
                                ? "bg-sky-50 text-sky-600 border border-sky-100"
                                : "bg-orange-50 text-orange-600 border border-orange-100"
                            }`}>
                              {member.role}
                            </span>
                          </div>

                          <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between">
                            <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">Salary: ${member.salary ? member.salary.toLocaleString() : "0"}/yr</span>
                            <span className={`inline-flex min-h-[18px] items-center rounded-full px-2 text-[8px] font-bold uppercase tracking-wider ${
                              member.isActive
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-slate-50 text-slate-400 border border-slate-200"
                            }`}>
                              {member.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[120px] border border-dashed border-slate-200 rounded-xl text-brand-muted text-xs font-semibold">
                      No employees are currently assigned to this department.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "insights" && (() => {
                const budget = selectedDept.allocatedBudget || 0;
                const payroll = deptDetails?.totalPayroll || 0;
                const utilization = budget > 0 ? Math.min(Math.round((payroll / budget) * 100), 200) : 0;
                const utilizationColor = utilization > 100 ? "text-red-500" : "text-emerald-600";
                const barColor = utilization > 100 ? "bg-red-500" : "bg-emerald-500";

                return (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                        <small className="block text-brand-muted text-[9px] font-bold uppercase tracking-widest leading-none mb-1">Budget Utilization</small>
                        <span className={`text-xl font-extrabold ${utilizationColor}`}>{utilization}%</span>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className={`${barColor} h-full rounded-full`} style={{ width: `${Math.min(utilization, 100)}%` }}></div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                        <small className="block text-brand-muted text-[9px] font-bold uppercase tracking-widest leading-none mb-1">Headcount</small>
                        <span className="text-xl font-extrabold text-brand-text">{deptDetails?.members?.length || 0} active</span>
                        <p className="text-[10px] text-brand-muted mt-1 leading-none">Cost Center: {selectedDept.costCenterCode || "GEN-CORP"}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center justify-between">
                      <div>
                        <small className="block text-brand-muted text-[9px] font-bold uppercase tracking-widest leading-none mb-1">Total Payroll Cost</small>
                        <span className="text-sm font-bold text-slate-700">${payroll.toLocaleString()}/yr</span>
                      </div>
                      <span className="inline-flex min-h-[22px] items-center rounded-full bg-slate-100 px-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200">
                        Payroll Cost
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center justify-between">
                      <div>
                        <small className="block text-brand-muted text-[9px] font-bold uppercase tracking-widest leading-none mb-1">Allocated Budget</small>
                        <span className="text-sm font-bold text-slate-700">${budget.toLocaleString()}/yr</span>
                      </div>
                      <span className="inline-flex min-h-[22px] items-center rounded-full bg-slate-100 px-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200">
                        Allocated
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>
        </div>
      )}

      {/* DELETE Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          title="Delete Department"
          message={`Are you sure you want to delete ${selectedDept?.name}? This will permanently delete the department records. This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedDept(null);
          }}
          isDangerous={true}
        />
      )}
    </div>
  );
}
