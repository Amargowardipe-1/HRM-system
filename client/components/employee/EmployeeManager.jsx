"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { createUser, getUsers, updateUser, deleteUser, getDepartments, getSystemSettings } from "@/lib/api";
import { EmployeeCreateModal } from "./EmployeeCreateModal";
import { EmployeeEditModal } from "./EmployeeEditModal";
import { EmployeeDetailModal } from "./EmployeeDetailModal";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { EmployeeFilters } from "./EmployeeFilters";
import { EmployeeTable } from "./EmployeeTable";

export function EmployeeManager() {
  const { user } = useAuth() || {};
  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || "";

  // Permissions based on user role
  const canEdit = user?.role === "Admin" || user?.role === "HR";
  const canDelete = user?.role === "Admin" || user?.role === "HR";

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState(["Employee", "HR", "Admin"]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [roleFilter, setRoleFilter] = useState("All");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Update searchTerm when URL search parameter changes (e.g. from Navbar)
  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  // Detail view state
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Edit state
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Delete state
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return employees.filter((employee) => {
      // Resolve full name, email, and code paths
      const fullName = `${employee.firstName || ""} ${employee.lastName || ""}`.trim().toLowerCase();
      const email = (employee.userId?.email || "").toLowerCase();
      const code = (employee.employeeCode || "").toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        code.includes(normalizedSearch);

      // Resolve role path (stored under user profile userId.role)
      const role = employee.userId?.role || "Employee";
      const matchesRole = roleFilter === "All" || role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [employees, roleFilter, searchTerm]);

  async function loadEmployees() {
    setIsLoading(true);
    setError("");

    try {
      const [users, depts] = await Promise.all([getUsers(), getDepartments()]);
      setEmployees(users);
      setDepartments(depts);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
    getSystemSettings()
      .then((data) => {
        if (data && data.roles) {
          setRoles(data.roles.map((r) => r.role));
        }
      })
      .catch((err) => console.error("Failed to load dynamic roles:", err));
  }, []);

  async function handleCreateUser(userData) {
    await createUser(userData);
    await loadEmployees();
  }

  // Handle opening details
  function handleRowClick(employee) {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  }

  // Handle opening edit
  function handleEditClick(employee) {
    setEmployeeToEdit(employee);
    setShowEditModal(true);
  }

  // Handle opening delete confirmation
  function handleDeleteClick(employee) {
    setEmployeeToDelete(employee);
    setShowDeleteConfirm(true);
  }

  // API Call to edit employee
  async function handleEditUser(id, updatedData) {
    await updateUser(id, updatedData);
    await loadEmployees();
    
    // Update selected employee in detail modal if it is active
    if (selectedEmployee && selectedEmployee._id === id) {
      setSelectedEmployee((prev) => ({ ...prev, ...updatedData }));
    }
  }

  // API Call to delete employee
  async function handleDeleteUser() {
    if (!employeeToDelete) return;
    try {
      setError("");
      await deleteUser(employeeToDelete._id);
      
      // Close detail modal if the deleted user is being viewed
      if (selectedEmployee && selectedEmployee._id === employeeToDelete._id) {
        setShowDetailModal(false);
        setSelectedEmployee(null);
      }
      
      setShowDeleteConfirm(false);
      setEmployeeToDelete(null);
      await loadEmployees();
    } catch (err) {
      setError(err.message);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="grid gap-5.5">
      <section className="flex items-start justify-between gap-4 max-sm:grid max-sm:gap-3">
        <div>
          <p className="text-brand-primary text-[11px] font-bold uppercase tracking-widest leading-none mb-1.5">Employee Directory</p>
          <h1 className="text-3xl max-sm:text-2xl font-extrabold text-brand-text mb-2">Employees</h1>
          <p className="text-sm text-brand-muted">
            {canEdit
              ? "Create, view, edit, and manage HRM user profiles and roles."
              : "Browse the corporate directory and view employee profiles."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 justify-end max-sm:w-full">
          {canEdit && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold px-4.5 transition-all active:scale-98 shadow-md shadow-brand-primary/10 cursor-pointer max-sm:w-full"
            >
              <UserPlus size={17} />
              Create User
            </button>
          )}
          <button
            onClick={loadEmployees}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 border border-slate-200 bg-white text-brand-text rounded-lg font-semibold px-4.5 transition-all hover:bg-slate-50 active:scale-98 cursor-pointer max-sm:w-full"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </section>

      <EmployeeFilters
        searchTerm={searchTerm}
        roleFilter={roleFilter}
        filteredCount={filteredEmployees.length}
        totalCount={employees.length}
        onSearchChange={setSearchTerm}
        onRoleChange={setRoleFilter}
        roles={roles}
      />

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold">
          {error}
        </div>
      ) : null}

      <div className="grid min-w-0">
        <EmployeeTable
          employees={filteredEmployees}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          canEdit={canEdit}
          canDelete={canDelete}
          currentUser={user}
        />
      </div>

      {/* Create Modal */}
      {canEdit && (
        <EmployeeCreateModal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onCreate={handleCreateUser}
          departments={departments}
        />
      )}

      {/* Detail View Modal */}
      <EmployeeDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onEditClick={(employee) => {
          setShowDetailModal(false);
          handleEditClick(employee);
        }}
        onDeleteClick={(employee) => {
          setShowDetailModal(false);
          handleDeleteClick(employee);
        }}
        canEdit={canEdit}
        canDelete={canDelete}
        currentUser={user}
      />

      {/* Edit Modal */}
      {canEdit && (
        <EmployeeEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEmployeeToEdit(null);
          }}
          employee={employeeToEdit}
          onEdit={handleEditUser}
          departments={departments}
        />
      )}

      {/* Delete Confirmation Modal */}
      {canDelete && (
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          title="Delete Employee"
          message={`Are you sure you want to delete ${employeeToDelete?.name}? This will permanently remove their login and records. This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteUser}
          onClose={() => {
            setShowDeleteConfirm(false);
            setEmployeeToDelete(null);
          }}
          isDangerous={true}
        />
      )}
    </div>
  );
}
