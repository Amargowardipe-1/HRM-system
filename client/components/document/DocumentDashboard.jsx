"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument, updateDocument, verifyDocument, deleteDocument, getDocuments } from "@/lib/api";
import { DocumentTable } from "./DocumentTable";
import { DocumentUploadForm } from "./DocumentUploadForm";
import { DocumentVerifyModal } from "./DocumentVerifyModal";
import { DesignationModal as DocumentModal } from "@/components/designation/DesignationModal";
import { Plus, RefreshCw, Search, Download, ExternalLink, FileText } from "lucide-react";

export function DocumentDashboard({ initialDocuments = [], employees = [], currentUser = {}, token = null }) {
  const router = useRouter();
  const isAdminOrHR = currentUser.permissions?.includes("documents:view_all") || false;
  const isAdmin = currentUser.role === "Admin";

  const [documents, setDocuments] = useState(initialDocuments);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState("All");

  const loadAllDocuments = async () => {
    setError("");
    try {
      const data = await getDocuments(token);
      setDocuments(data);
    } catch (err) {
      setError(err.message || "Failed to refresh document list.");
    }
  };

  const handleUpload = async (formData) => {
    setIsSubmitting(true);
    setError("");
    try {
      await uploadDocument(formData, token);
      await loadAllDocuments();
      setShowUploadModal(false);
      router.refresh();
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
      await updateDocument(selectedDocument._id, formData, token);
      await loadAllDocuments();
      setShowEditModal(false);
      router.refresh();
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
      await verifyDocument(selectedDocument._id, status, remarks, token);
      await loadAllDocuments();
      setShowVerifyModal(false);
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to verify document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (confirm(`Are you sure you want to delete your ${type}?`)) {
      try {
        await deleteDocument(id, token);
        await loadAllDocuments();
        router.refresh();
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

  // Filter & Search Logic
  const filteredRecords = documents.filter((rec) => {
    const matchesStatus = statusFilter === "All" || rec.status === statusFilter;
    
    // Filter by selected employee ID
    const recEmployeeId = rec.employee?._id || rec.employee;
    const matchesEmployee = selectedEmployee === "All" || recEmployeeId?.toString() === selectedEmployee;

    const empName = rec.employee
      ? `${rec.employee.firstName} ${rec.employee.lastName}`.toLowerCase()
      : "";
    const docType = rec.documentType.toLowerCase();
    const fileName = rec.fileName.toLowerCase();
    const matchesSearch =
      empName.includes(searchQuery.toLowerCase()) ||
      docType.includes(searchQuery.toLowerCase()) ||
      fileName.includes(searchQuery.toLowerCase());

    return matchesStatus && matchesEmployee && matchesSearch;
  });

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
      console.error("Fetch download failed, falling back to new window:", err.message);
      window.open(fileUrl, "_blank");
    }
  };

  const getInlineUrl = (url) => {
    if (!url) return "";
    if (url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/fl_inline/");
    }
    return url;
  };

  const isPdf = selectedDocument && (
    selectedDocument.fileName?.toLowerCase().includes(".pdf") ||
    selectedDocument.fileUrl?.toLowerCase().includes(".pdf") ||
    selectedDocument.mimeType?.toLowerCase().includes("pdf")
  );

  const isImage = selectedDocument && (
    selectedDocument.mimeType?.toLowerCase().includes("image") ||
    /\.(png|jpe?g|gif|webp)$/i.test(selectedDocument.fileName || "") ||
    /\.(png|jpe?g|gif|webp)$/i.test(selectedDocument.fileUrl || "")
  );

  return (
    <main className="grid gap-6 p-8 max-md:p-4 max-sm:p-3 max-w-[1200px] mx-auto w-full">
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      {/* Page Header */}
      <section className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start animate-fade-in-up" style={{ animationDelay: "0ms" }} aria-label="Page title">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text tracking-tight">Documents Directory</h1>
          <p className="text-sm text-brand-muted mt-1">
            {isAdminOrHR
              ? "Manage, verify, and review employee verification documents."
              : "Upload and manage your official credentials and identity documents."}
          </p>
        </div>
        <div className="flex gap-3 max-sm:w-full">
          {!isAdminOrHR && (
            <button
              onClick={() => {
                setError("");
                setShowUploadModal(true);
              }}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold px-4.5 transition-all shadow-md shadow-brand-primary/10 active:scale-98 cursor-pointer max-sm:flex-1"
            >
              <Plus size={18} />
              Upload Document
            </button>
          )}
          <button
            onClick={loadAllDocuments}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 border border-slate-200 bg-white text-brand-text rounded-lg font-semibold px-4.5 transition-all hover:bg-slate-50 active:scale-98 cursor-pointer max-sm:w-12 max-sm:px-0"
            title="Refresh list"
          >
            <RefreshCw size={17} />
            <span className="max-sm:hidden">Refresh</span>
          </button>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: "75ms" }}>
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={isAdminOrHR ? "Search by employee, document type, file name..." : "Search by document type, file name..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[40px] pl-10 pr-4 border border-slate-200 rounded-lg outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-4 flex-wrap max-md:w-full">
          {isAdmin && (
            <div className="flex items-center gap-2.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="min-h-[38px] border border-slate-200 rounded-lg bg-white px-3 outline-none focus:border-brand-primary text-xs font-bold transition-all cursor-pointer text-slate-600 max-w-[200px] max-md:max-w-full"
              >
                <option value="All">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-150">
              {["All", "Pending", "Verified", "Rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`min-h-[30px] rounded-md px-3 text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === status
                      ? "bg-white text-brand-text shadow-sm"
                      : "text-slate-500 hover:text-brand-text"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          {error}
        </div>
      )}

      {/* Documents Table */}
      <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <DocumentTable
          records={filteredRecords}
          isAdminOrHR={isAdminOrHR}
          onEditClick={handleOpenEdit}
          onDeleteClick={handleDelete}
          onVerifyClick={handleOpenVerify}
          onPreviewClick={handleOpenPreview}
          onDownloadClick={handleDownload}
        />
      </div>

      {/* UPLOAD MODAL */}
      <DocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
        subtitle="Upload official identity credentials or letters."
      >
        <DocumentUploadForm onSubmit={handleUpload} isSubmitting={isSubmitting} error={error} />
      </DocumentModal>

      {/* EDIT/RE-UPLOAD MODAL */}
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
                    className="inline-flex min-h-[38px] items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg px-4.5 transition-all"
                  >
                    <ExternalLink size={14} />
                    Open Fullscreen
                  </a>
                )}

                {/* Download Button (Only visible to Admin or HR) */}
                {isAdminOrHR && (
                  <button
                    type="button"
                    onClick={() => handleDownload(selectedDocument.fileUrl, selectedDocument.fileName)}
                    className="inline-flex min-h-[38px] items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs rounded-lg px-4.5 transition-all shadow-md shadow-brand-primary/10 cursor-pointer"
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
