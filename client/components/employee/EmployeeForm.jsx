"use client";

import { useState, useEffect } from "react";
import { getDesignations, getDesignationsByDepartment, getSystemSettings } from "@/lib/api";

const DEFAULT_INITIAL_DATA = {};

export function EmployeeForm({
  initialData = DEFAULT_INITIAL_DATA,
  onSubmit,
  isSubmitting = false,
  buttonText = "Save",
  showIsActive = false,
  isEdit = false,
  isSelfEdit = false,
  departments = [],
}) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "Employee",
    isActive: true,
    employeeCode: "",
    firstName: "",
    lastName: "",
    phone: "",
    gender: "Male",
    dob: "",
    department: "",
    designation: "",
    joiningDate: new Date().toISOString().split("T")[0],
    employmentType: "Full-time",
    salary: 0,
    status: "Active",
  });

  const [designations, setDesignations] = useState([]);
  const [allDesignations, setAllDesignations] = useState([]);
  const [roles, setRoles] = useState(["Employee", "HR", "Admin"]);

  // Load all active designations on mount for grouped dropdown options
  useEffect(() => {
    getDesignations({ status: "Active" })
      .then((res) => {
        setAllDesignations(res.data || []);
      })
      .catch((err) => console.error("Failed to load all designations:", err));

    // Fetch dynamic roles list
    getSystemSettings()
      .then((data) => {
        if (data && data.roles) {
          const roleNames = data.roles.map((r) => r.role);
          setRoles(roleNames);
        }
      })
      .catch((err) => console.error("Failed to load dynamic roles:", err));
  }, []);

  // Populate form with initial data when it changes (only in edit mode)
  useEffect(() => {
    if (isEdit && initialData && Object.keys(initialData).length > 0) {
      setForm({
        email: initialData.userId?.email || initialData.email || "",
        password: "", // Always start with empty password
        role: initialData.userId?.role || initialData.role || "Employee",
        isActive: typeof initialData.userId?.isActive !== "undefined" ? initialData.userId.isActive : true,
        employeeCode: initialData.employeeCode || "",
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        phone: initialData.phone || "",
        gender: initialData.gender || "Male",
        dob: initialData.dob ? new Date(initialData.dob).toISOString().split("T")[0] : "",
        department: initialData.department?._id || initialData.department || "",
        designation: initialData.designation?._id || initialData.designation || "",
        joiningDate: initialData.joiningDate ? new Date(initialData.joiningDate).toISOString().split("T")[0] : "",
        employmentType: initialData.employmentType || "Full-time",
        salary: initialData.salary || 0,
        status: initialData.status || "Active",
      });
    }
  }, [initialData, isEdit]);

  // Fetch designations for the selected department dynamically
  useEffect(() => {
    if (form.department) {
      getDesignationsByDepartment(form.department)
        .then((data) => {
          setDesignations(data || []);
          // Reset selected designation if it doesn't belong to the newly selected department
          if (form.designation && !data.some((d) => d._id === form.designation)) {
            setForm((prev) => ({ ...prev, designation: "" }));
          }
        })
        .catch((err) => {
          console.error("Failed to load department designations:", err);
          setDesignations([]);
        });
    } else {
      setDesignations([]);
    }
  }, [form.department]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleDesignationChange(event) {
    const designationId = event.target.value;
    setForm((prev) => {
      const updated = { ...prev, designation: designationId };
      if (designationId && !prev.department) {
        // Find the designation in allDesignations to get its department
        const selected = allDesignations.find((d) => d._id === designationId);
        if (selected && selected.department) {
          updated.department = selected.department._id || selected.department;
        }
      }
      return updated;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    
    // Prepare payload matching Decoupled Architecture
    const payload = {
      email: form.email,
      role: form.role,
      employeeCode: form.employeeCode,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      gender: form.gender,
      dob: form.dob || null,
      department: form.department || null,
      designation: form.designation || null,
      joiningDate: form.joiningDate || null,
      employmentType: form.employmentType,
      salary: Number(form.salary) || 0,
      status: form.status,
    };

    if (showIsActive) {
      payload.isActive = form.isActive;
    }

    // Only include password if it is entered
    if (form.password && form.password.trim() !== "") {
      payload.password = form.password;
    }

    onSubmit(payload);
  }

  // Group designations by department for when no department is selected
  const groupedDesignations = allDesignations.reduce((groups, des) => {
    const deptName = des.department?.name || "Unassigned";
    if (!groups[deptName]) {
      groups[deptName] = [];
    }
    groups[deptName].push(des);
    return groups;
  }, {});

  return (
    <form className="grid gap-4.5 p-6 max-w-[650px] w-full" onSubmit={handleSubmit}>
      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        {/* Personal Details */}
        <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
          First Name
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="Amit"
            required
            className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
          />
        </label>

        <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
          Last Name
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Kumar"
            required
            className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
          />
        </label>

        {!isSelfEdit && (
          <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
            Employee Code
            <input
              name="employeeCode"
              value={form.employeeCode}
              onChange={handleChange}
              placeholder="EMP001"
              required
              disabled={isEdit}
              className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all disabled:opacity-75 disabled:cursor-not-allowed"
            />
          </label>
        )}

        <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
          Phone Number
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
          />
        </label>

        <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
          Gender
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all cursor-pointer"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
          Date of Birth
          <input
            name="dob"
            type="date"
            value={form.dob}
            onChange={handleChange}
            className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
          />
        </label>

        {/* Credentials */}
        <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
          Email Address
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="amit@company.com"
            required
            className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
          />
        </label>

        <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={isEdit ? "Leave blank to keep current" : "Minimum 6 characters"}
            required={!isEdit}
            minLength={isEdit ? undefined : 6}
            className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
          />
        </label>

        {!isSelfEdit && (
          <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
            Role
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all cursor-pointer"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Organization / Job Details */}
        {!isSelfEdit && (
          <>
            <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
              Department
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all cursor-pointer"
              >
                <option value="">No Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
              Designation
              <select
                name="designation"
                value={form.designation}
                onChange={handleDesignationChange}
                className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all cursor-pointer"
              >
                <option value="">Select Designation</option>
                {form.department ? (
                  designations.map((des) => (
                    <option key={des._id} value={des._id}>
                      {des.title} ({des.level})
                    </option>
                  ))
                ) : (
                  Object.entries(groupedDesignations).map(([deptName, items]) => (
                    <optgroup key={deptName} label={deptName}>
                      {items.map((des) => (
                        <option key={des._id} value={des._id}>
                          {des.title} ({des.level})
                        </option>
                      ))}
                    </optgroup>
                  ))
                )}
              </select>
            </label>

            <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
              Employment Type
              <select
                name="employmentType"
                value={form.employmentType}
                onChange={handleChange}
                className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all cursor-pointer"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
              Joining Date
              <input
                name="joiningDate"
                type="date"
                value={form.joiningDate}
                onChange={handleChange}
                className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
              />
            </label>

            <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
              Salary ($ / year)
              <input
                name="salary"
                type="number"
                min="0"
                value={form.salary}
                onChange={handleChange}
                placeholder="55000"
                className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
              />
            </label>

            <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
              Employment Status
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </label>
          </>
        )}
      </div>

      {showIsActive && !isSelfEdit ? (
        <label className="flex flex-row items-center gap-2.5 mt-2 cursor-pointer text-slate-700 text-xs font-semibold">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="w-4 h-4 rounded border-slate-200 text-brand-primary focus:ring-brand-primary cursor-pointer"
          />
          <span>Active Account Credentials</span>
        </label>
      ) : null}

      <button
        disabled={isSubmitting}
        className="mt-4 w-full min-h-[42px] bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md shadow-brand-primary/10 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
      >
        {buttonText}
      </button>
    </form>
  );
}
