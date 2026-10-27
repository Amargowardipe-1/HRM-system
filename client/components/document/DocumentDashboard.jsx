"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  uploadDocument,
  updateDocument,
  verifyDocument,
  deleteDocument,
  getDocuments,
} from "@/lib/api";
import { fetchEmployees } from "@/store/slices/employeeSlice";
import { DocumentTable } from "./DocumentTable";
import { DocumentUploadForm } from "./DocumentUploadForm";
import { DocumentVerifyModal } from "./DocumentVerifyModal";
import { EmployeeDocumentDrawer } from "./EmployeeDocumentDrawer";
import { DesignationModal as DocumentModal } from "@/components/designation/DesignationModal";
import {
  Plus,
  RefreshCw,
  Search,
  Download,
  ExternalLink,
  FileText,
  Shield,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Building2,
  Layers,
  List,
  Filter,
  Users,
  Eye,
  Check,
} from "lucide-react";

function getDepartmentName(dept) {
  if (!dept) return "General";
  if (typeof dept === "string") return dept;
  if (typeof dept === "object") {
    if (typeof dept.name === "string") return dept.name;
    if (dept.name && typeof dept.name === "object") return getDepartmentName(dept.name);
    return dept.title || "General";
  }
  return "General";
}

export function DocumentDashboard({
  initialDocuments = [],
  employees: initialEmployees = [],
  currentUser = {},
  token = null,
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const reduxEmployees = useSelector((state) => state.employees.employees);
  const employeesLoaded = useSelector((state) => state.employees.isLoaded);
  const employees = reduxEmployees.length > 0 || employeesLoaded ? reduxEmployees : initialEmployees;

  const isAdminOrHR =
    currentUser.role === "Admin" ||
    currentUser.role === "HR" ||
    currentUser.permissions?.includes("documents:view_all") ||
    false;
  const isAdmin = currentUser.role === "Admin";

  const [documents, setDocuments] = useState(initialDocuments);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Drawer state for Employee Document Dossier
  const [drawerEmployee, setDrawerEmployee] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // View Mode: "vault" (Employee-Centric) or "files" (Flat Table)
  const [viewMode, setViewMode] = useState("vault");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const loadAllDocuments = async () => {
    setError("");
    try {
      const activeToken =
        token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
      const data = await getDocuments(activeToken);
      setDocuments(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err.message || "Failed to refresh document list.");
    }
  };

  // Initial load
  useEffect(() => {
    const activeToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    if (!employeesLoaded && isAdminOrHR) {
      dispatch(fetchEmployees(activeToken));
    }
  }, [dispatch, employeesLoaded, isAdminOrHR, token]);

  useEffect(() => {
    loadAllDocuments();
  }, [token]);

  const handleUpload = async (formData) => {
    setIsSubmitting(true);
    setError("");
    try {
      const activeToken =
        token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
      await uploadDocument(formData, activeToken);
      await loadAllDocuments();
      setShowUploadModal(false);
    } catch (err) {
      setError(err.message || "Failed to upload document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (formData) => {
    setIsSubmitting(true);
    setError("");
    try {
      const activeToken =
        token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
      await updateDocument(selectedDocument._id, formData, activeToken);
      await loadAllDocuments();
      setShowEditModal(false);
    } catch (err) {
      setError(err.message || "Failed to update document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (status, remarks) => {
    setIsSubmitting(true);
    setError("");
    try {
      const activeToken =
        token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
      await verifyDocument(selectedDocument._id, status, remarks, activeToken);
      await loadAllDocuments();
      setShowVerifyModal(false);
    } catch (err) {
      setError(err.message || "Failed to verify document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (confirm(`Are you sure you want to delete your ${type}?`)) {
      try {
        const activeToken =
          token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
        await deleteDocument(id, activeToken);
        await loadAllDocuments();
      } catch (err) {
        alert(err.message || "Failed to delete document.");
      }
    }
  };

  const handleOpenEdit = (doc) => {
    setSelectedDocument(doc);
    setError("");
    setShowEditModal(true);
  };

  const handleOpenVerify = (doc) => {
    setSelectedDocument(doc);
    setError("");
    setShowVerifyModal(true);
  };

  const handleOpenPreview = (doc) => {
    setSelectedDocument(doc);
    setShowPreviewModal(true);
  };

  const handleOpenDrawer = (emp) => {
    setDrawerEmployee(emp);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setDrawerEmployee(null);
  };

  // Group documents by employee
  const employeeVaultList = useMemo(() => {
    // If Admin/HR, list all employees; if regular employee, show only self
    let list = [];
    if (isAdminOrHR && employees.length > 0) {
      list = employees;
    } else if (currentUser) {
      const currentUserId = currentUser._id || currentUser.id;
      const matched = employees.find(
        (e) =>
          e.userId?._id === currentUserId ||
          e.userId === currentUserId ||
          e._id === currentUser.employeeId
      );
      if (matched) {
        list = [matched];
      } else {
        const deptStr = getDepartmentName(currentUser.department);
        list = [
          {
            _id: currentUser.employeeId || currentUserId,
            firstName: currentUser.firstName || currentUser.name || "My",
            lastName: currentUser.lastName || "Profile",
            employeeCode: currentUser.employeeCode || "EMP-ME",
            department: { name: deptStr },
            userId: { email: currentUser.email, role: currentUser.role },
          },
        ];
      }
    }

    // Filter by Search & Department
    const filteredEmployees = list.filter((emp) => {
      const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim().toLowerCase();
      const code = (emp.employeeCode || "").toLowerCase();
      const q = searchQuery.trim().toLowerCase();

      const matchesSearch = !q || fullName.includes(q) || code.includes(q);
      const empDeptId = emp.department?._id || emp.department;
      const matchesDept = !selectedDepartment || empDeptId === selectedDepartment;

      return matchesSearch && matchesDept;
    });

    // Map each employee with their documents and stats
    return filteredEmployees.map((emp) => {
      const empId = emp._id?.toString() || emp.id?.toString();
      const empUserId = emp.userId?._id?.toString() || emp.userId?.toString();

      const empDocs = documents.filter((doc) => {
        const docEmpId = doc.employee?._id?.toString() || doc.employee?.toString();
        const docUserId = doc.employee?.userId?._id?.toString() || doc.employee?.userId?.toString();
        const docUploadedBy = doc.uploadedBy?._id?.toString() || doc.uploadedBy?.toString();
        return (
          (empId && docEmpId === empId) ||
          (empUserId && (docEmpId === empUserId || docUserId === empUserId || docUploadedBy === empUserId))
        );
      });

      const verifiedCount = empDocs.filter((d) => d.status === "Verified").length;
      const pendingCount = empDocs.filter((d) => d.status === "Pending" || !d.status).length;
      const rejectedCount = empDocs.filter((d) => d.status === "Rejected").length;

      // Check which required docs are present
      const docTypes = empDocs.map((d) => d.documentType);
      const hasAadhar = docTypes.includes("Aadhar Card");
      const hasPan = docTypes.includes("PAN Card");
      const hasResume = docTypes.includes("Resume");
      const hasOfferLetter = docTypes.includes("Offer Letter");

      return {
        employee: emp,
        documents: empDocs,
        totalDocs: empDocs.length,
        verifiedCount,
        pendingCount,
        rejectedCount,
        hasAadhar,
        hasPan,
        hasResume,
        hasOfferLetter,
      };
    });
  }, [employees, currentUser, isAdminOrHR, documents, searchQuery, selectedDepartment]);

  // Overall Statistics for Metrics Strip
  const metrics = useMemo(() => {
    const totalDocs = documents.length;
    const verified = documents.filter((d) => d.status === "Verified").length;
    const pending = documents.filter((d) => d.status === "Pending" || !d.status).length;
    const rejected = documents.filter((d) => d.status === "Rejected").length;

    return {
      totalEmployees: employeeVaultList.length,
      totalDocs,
      verified,
      pending,
      rejected,
    };
  }, [documents, employeeVaultList]);

  // Filter for Flat Table View
  const filteredFlatRecords = useMemo(() => {
    return documents.filter((rec) => {
      const matchesStatus = statusFilter === "All" || rec.status === statusFilter;
      const empName = rec.employee
        ? `${rec.employee.firstName} ${rec.employee.lastName}`.toLowerCase()
        : "";
      const docType = (rec.documentType || "").toLowerCase();
      const fileName = (rec.fileName || "").toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch =
        empName.includes(q) || docType.includes(q) || fileName.includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [documents, statusFilter, searchQuery]);

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(fileUrl, "_blank");
    }
  };

  const isPdf =
    selectedDocument &&
    (selectedDocument.fileName?.toLowerCase().includes(".pdf") ||
      selectedDocument.fileUrl?.toLowerCase().includes(".pdf") ||
      selectedDocument.mimeType?.toLowerCase().includes("pdf"));

  const isImage =
    selectedDocument &&
    (selectedDocument.mimeType?.toLowerCase().includes("image") ||
      /\.(png|jpe?g|gif|webp)$/i.test(selectedDocument.fileName || "") ||
      /\.(png|jpe?g|gif|webp)$/i.test(selectedDocument.fileUrl || ""));

  // Documents of the currently opened drawer employee
  const drawerDocuments = useMemo(() => {
    if (!drawerEmployee) return [];
    const empId = drawerEmployee._id?.toString() || drawerEmployee.id?.toString();
    const empUserId = drawerEmployee.userId?._id?.toString() || drawerEmployee.userId?.toString();

    return documents.filter((doc) => {
      const docEmpId = doc.employee?._id?.toString() || doc.employee?.toString();
      const docUserId = doc.employee?.userId?._id?.toString() || doc.employee?.userId?.toString();
      const docUploadedBy = doc.uploadedBy?._id?.toString() || doc.uploadedBy?.toString();
      return (
        (empId && docEmpId === empId) ||
        (empUserId && (docEmpId === empUserId || docUserId === empUserId || docUploadedBy === empUserId))
      );
    });
  }, [drawerEmployee, documents]);

  return (
    <main className="grid gap-6 p-8 max-md:p-4 max-sm:p-3 max-w-[1280px] mx-auto w-full">
      {/* Page Header */}
      <section className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start" aria-label="Page title">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text tracking-tight">Documents Directory</h1>
          <p className="text-sm text-brand-muted mt-1">
            {isAdminOrHR
              ? "Browse all staff profiles, inspect uploaded credentials, and verify compliance files."
              : "Upload and manage your official credentials and identity documents."}
          </p>
        </div>
        <div className="flex gap-3 max-sm:w-full">
          <button
            onClick={() => {
              setError("");
              setShowUploadModal(true);
            }}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl font-semibold px-4.5 transition-all shadow-md shadow-brand-primary/10 active:scale-98 cursor-pointer max-sm:flex-1"
          >
            <Plus size={18} />
            Upload Document
          </button>
          <button
            onClick={loadAllDocuments}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 border border-slate-200 bg-white text-brand-text rounded-xl font-semibold px-4.5 transition-all hover:bg-slate-50 active:scale-98 cursor-pointer max-sm:w-12 max-sm:px-0 shadow-xs"
            title="Refresh list"
          >
            <RefreshCw size={17} />
            <span className="max-sm:hidden">Refresh</span>
          </button>
        </div>
      </section>

      {/* Top Metrics Cards Strip */}
      <section className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <Users size={20} />
          </div>
          <div>
            <small className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Staff Members
            </small>
            <span className="text-xl font-extrabold text-slate-900">
              {metrics.totalEmployees}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <FileText size={20} />
          </div>
          <div>
            <small className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Documents
            </small>
            <span className="text-xl font-extrabold text-slate-900">
              {metrics.totalDocs} Files
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <small className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Verified Documents
            </small>
            <span className="text-xl font-extrabold text-emerald-600">
              {metrics.verified}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <AlertCircle size={20} />
          </div>
          <div>
            <small className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Pending Review
            </small>
            <span className="text-xl font-extrabold text-amber-600">
              {metrics.pending}
            </span>
          </div>
        </div>
      </section>

      {/* Toolbar & Filters */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4 flex-wrap">
        {/* View Switcher Toggle */}
        {isAdminOrHR && (
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("vault")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "vault"
                  ? "bg-white text-brand-primary shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers size={14} />
              Employee Document Vault
            </button>
            <button
              type="button"
              onClick={() => setViewMode("files")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "files"
                  ? "bg-white text-brand-primary shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List size={14} />
              All Uploaded Files
            </button>
          </div>
        )}

        {/* Search Input */}
        <div className="flex-1 min-w-[260px] flex items-center gap-2.5 border border-slate-200 rounded-xl bg-slate-50/50 px-3.5 py-2 focus-within:bg-white focus-within:border-brand-primary transition-all">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder={
              viewMode === "vault"
                ? "Search employee by name or code..."
                : "Search by employee, document type, file name..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-0 outline-none bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Status Filters for Flat Table */}
        {viewMode === "files" && (
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {["All", "Pending", "Verified", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW MODE 1: EMPLOYEE-CENTRIC DOCUMENT VAULT TABLE (DEFAULT) */}
      {/* ============================================================ */}
      {viewMode === "vault" && (
        <section className="border border-slate-200/90 rounded-2xl bg-white shadow-xs overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80">
                  <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">
                    Employee
                  </th>
                  <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-center">
                    Uploaded Documents
                  </th>
                  <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-center">
                    Verified
                  </th>
                  <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-center">
                    Pending
                  </th>
                  <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-center">
                    Rejected
                  </th>
                  <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">
                    Compliance Checklist
                  </th>
                  <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employeeVaultList.length ? (
                  employeeVaultList.map((item) => {
                    const emp = item.employee;
                    const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Employee";

                    return (
                      <tr
                        key={emp._id || emp.id}
                        onClick={() => handleOpenDrawer(emp)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      >
                        {/* Employee Identity */}
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong className="block text-sm font-bold text-slate-900">
                                {fullName}
                              </strong>
                              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.2 rounded">
                                  {emp.employeeCode || "EMP"}
                                </span>
                                <span>•</span>
                                <span>{getDepartmentName(emp.department)}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Uploaded Documents Count */}
                        <td className="p-4 text-center align-middle">
                          <span className="inline-flex items-center justify-center min-w-[70px] px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                            {item.totalDocs} Files
                          </span>
                        </td>

                        {/* Verified Count */}
                        <td className="p-4 text-center align-middle">
                          <span
                            className={`inline-flex items-center justify-center min-w-[65px] px-2.5 py-1 rounded-full text-xs font-black border ${
                              item.verifiedCount > 0
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-50 text-slate-400 border-slate-200"
                            }`}
                          >
                            {item.verifiedCount}
                          </span>
                        </td>

                        {/* Pending Count */}
                        <td className="p-4 text-center align-middle">
                          <span
                            className={`inline-flex items-center justify-center min-w-[65px] px-2.5 py-1 rounded-full text-xs font-black border ${
                              item.pendingCount > 0
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-50 text-slate-400 border-slate-200"
                            }`}
                          >
                            {item.pendingCount}
                          </span>
                        </td>

                        {/* Rejected Count */}
                        <td className="p-4 text-center align-middle">
                          <span
                            className={`inline-flex items-center justify-center min-w-[65px] px-2.5 py-1 rounded-full text-xs font-black border ${
                              item.rejectedCount > 0
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-slate-50 text-slate-400 border-slate-200"
                            }`}
                          >
                            {item.rejectedCount}
                          </span>
                        </td>

                        {/* Checklist Tags Preview */}
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                                item.hasAadhar
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-400 border border-slate-200"
                              }`}
                            >
                              {item.hasAadhar ? <Check size={11} /> : "✕"} Aadhar
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                                item.hasPan
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-400 border border-slate-200"
                              }`}
                            >
                              {item.hasPan ? <Check size={11} /> : "✕"} PAN
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                                item.hasResume
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-400 border border-slate-200"
                              }`}
                            >
                              {item.hasResume ? <Check size={11} /> : "✕"} Resume
                            </span>
                          </div>
                        </td>

                        {/* Action: Open Drawer */}
                        <td className="p-4 text-right align-middle">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDrawer(emp);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-primary hover:text-white text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                          >
                            <Eye size={13} />
                            View Documents
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="h-40 text-center text-slate-400 font-medium p-6">
                      No employees matched the search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* VIEW MODE 2: FLAT ALL DOCUMENTS TABLE                        */}
      {/* ============================================================ */}
      {viewMode === "files" && (
        <section className="animate-fade-in-up">
          <DocumentTable
            records={filteredFlatRecords}
            isAdminOrHR={isAdminOrHR}
            onEditClick={handleOpenEdit}
            onDeleteClick={handleDelete}
            onVerifyClick={handleOpenVerify}
            onPreviewClick={handleOpenPreview}
            onDownloadClick={handleDownload}
          />
        </section>
      )}

      {/* ============================================================ */}
      {/* SLIDE-OVER DRAWER (User's Uploaded Documents)                */}
      {/* ============================================================ */}
      <EmployeeDocumentDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        employee={drawerEmployee}
        documents={drawerDocuments}
        isAdminOrHR={isAdminOrHR}
        onPreviewClick={handleOpenPreview}
        onDownloadClick={handleDownload}
        onVerifyClick={handleOpenVerify}
        onEditClick={handleOpenEdit}
        onDeleteClick={handleDelete}
        onUploadClick={() => {
          setShowUploadModal(true);
        }}
      />

      {/* ============================================================ */}
      {/* MODALS                                                       */}
      {/* ============================================================ */}

      {/* UPLOAD MODAL */}
      <DocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
        subtitle="Upload official identity credentials or verification letters."
      >
        <DocumentUploadForm onSubmit={handleUpload} isSubmitting={isSubmitting} error={error} />
      </DocumentModal>

      {/* EDIT MODAL */}
      <DocumentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Re-upload Document"
        subtitle="Replace the existing file with a new document upload."
      >
        <DocumentUploadForm
          initialData={selectedDocument}
          onSubmit={handleUpdate}
          isSubmitting={isSubmitting}
          error={error}
        />
      </DocumentModal>

      {/* VERIFY MODAL */}
      <DocumentModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Verify Document"
        subtitle="Review document credentials and set verification status."
      >
        <DocumentVerifyModal
          documentInfo={selectedDocument}
          onVerify={handleVerify}
          isSubmitting={isSubmitting}
          error={error}
        />
      </DocumentModal>

      {/* PREVIEW MODAL */}
      <DocumentModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={selectedDocument?.documentType || "Document Preview"}
        subtitle={selectedDocument?.fileName || ""}
        maxWidthClass="max-w-[960px]"
      >
        {!selectedDocument ? (
          <div className="p-12 flex flex-col items-center justify-center text-brand-muted text-sm font-semibold gap-3 min-h-[300px]">
            <span className="w-8 h-8 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin" />
            Loading preview...
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-4 w-full min-h-[500px]">
            {/* File Rendering */}
            <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-50 min-h-[400px] flex items-center justify-center">
              {isPdf ? (
                <div className="w-full flex flex-col gap-2.5">
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2.5 px-3.5 flex items-center justify-between">
                    <span>If the PDF preview doesn't load in your browser, click here to view it directly:</span>
                    <a
                      href={selectedDocument.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline ml-2 shrink-0"
                    >
                      <ExternalLink size={12} />
                      Open PDF
                    </a>
                  </div>
                  <iframe
                    src={selectedDocument.fileUrl}
                    className="w-full h-[600px] border-0 rounded-lg bg-white shadow-inner"
                    title={selectedDocument.fileName}
                  />
                </div>
              ) : isImage ? (
                <img
                  src={selectedDocument.fileUrl}
                  alt={selectedDocument.fileName}
                  className="max-w-full max-h-[600px] object-contain rounded-lg p-2"
                />
              ) : (
                <div className="text-center p-6 flex flex-col items-center gap-3">
                  <FileText size={48} className="text-slate-400" />
                  <span className="text-sm font-semibold text-slate-600">
                    Preview not available for this file type
                  </span>
                  <a
                    href={selectedDocument.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
                  >
                    <ExternalLink size={13} />
                    Open in new window
                  </a>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-2">
              <span className="text-xs text-slate-500 font-medium">
                Uploaded by: {selectedDocument.employee ? `${selectedDocument.employee.firstName} ${selectedDocument.employee.lastName}` : "Employee"}
              </span>

              <div className="flex gap-2">
                {isPdf && (
                  <a
                    href={selectedDocument.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[38px] items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl px-4.5 transition-all"
                  >
                    <ExternalLink size={14} />
                    Open Fullscreen
                  </a>
                )}

                {isAdminOrHR && (
                  <button
                    type="button"
                    onClick={() => handleDownload(selectedDocument.fileUrl, selectedDocument.fileName)}
                    className="inline-flex min-h-[38px] items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs rounded-xl px-4.5 transition-all shadow-md shadow-brand-primary/10 cursor-pointer"
                  >
                    <Download size={14} />
                    Download Document
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </DocumentModal>
    </main>
  );
}
