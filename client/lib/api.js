export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Helper to construct headers with JWT authorization token
function getHeaders(customHeaders = {}, token = null) {
  const headers = { ...customHeaders };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (typeof window !== "undefined") {
    const clientToken = localStorage.getItem("token");
    if (clientToken) {
      headers["Authorization"] = `Bearer ${clientToken}`;
    }
  }
  return headers;
}

export async function getUsers(token = null) {
  const response = await fetch(`${API_BASE_URL}/api/employees`, {
    cache: "no-store",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load employees");
  }

  return payload.data || [];
}

export async function createUser(userData) {
  const response = await fetch(`${API_BASE_URL}/api/employees`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(userData),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to create employee");
  }

  return payload.data;
}

export async function getUserById(id) {
  const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
    cache: "no-store",
    headers: getHeaders(),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load employee details");
  }

  return payload.data;
}

export async function updateUser(id, userData) {
  const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
    method: "PUT",
    headers: getHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(userData),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to update employee");
  }

  return payload.data;
}

export async function deleteUser(id) {
  const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to delete employee");
  }

  return payload.data;
}

export async function getDepartments(token = null) {
  const response = await fetch(`${API_BASE_URL}/api/departments`, {
    cache: "no-store",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load departments");
  }

  return payload.data || [];
}

export async function getDepartmentById(id) {
  const response = await fetch(`${API_BASE_URL}/api/departments/${id}`, {
    cache: "no-store",
    headers: getHeaders(),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load department details");
  }

  return payload.data;
}

export async function createDepartment(departmentData) {
  const response = await fetch(`${API_BASE_URL}/api/departments`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(departmentData),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to create department");
  }

  return payload.data;
}

export async function updateDepartment(id, departmentData) {
  const response = await fetch(`${API_BASE_URL}/api/departments/${id}`, {
    method: "PUT",
    headers: getHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(departmentData),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to update department");
  }

  return payload.data;
}

export async function deleteDepartment(id) {
  const response = await fetch(`${API_BASE_URL}/api/departments/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to delete department");
  }

  return payload.message || "Deleted successfully";
}

export async function getDesignations(params = {}, token = null) {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);
  if (params.department) query.append("department", params.department);
  if (params.status) query.append("status", params.status);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const response = await fetch(`${API_BASE_URL}/api/designations${queryString}`, {
    cache: "no-store",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load designations");
  }

  return {
    data: payload.data || [],
    pagination: payload.pagination || null,
  };
}

export async function getDesignationsByDepartment(departmentId) {
  const response = await fetch(`${API_BASE_URL}/api/designations/department/${departmentId}`, {
    cache: "no-store",
    headers: getHeaders(),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load department designations");
  }

  return payload.data || [];
}

export async function createDesignation(designationData) {
  const response = await fetch(`${API_BASE_URL}/api/designations`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(designationData),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to create designation");
  }

  return payload.data;
}

export async function updateDesignation(id, designationData) {
  const response = await fetch(`${API_BASE_URL}/api/designations/${id}`, {
    method: "PUT",
    headers: getHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(designationData),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to update designation");
  }

  return payload.data;
}

export async function deleteDesignation(id) {
  const response = await fetch(`${API_BASE_URL}/api/designations/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to delete designation");
  }

  return payload.message || "Deleted successfully";
}

export async function getCurrentUserProfile(token) {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    cache: "no-store",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load profile");
  }

  return payload.data;
}

export async function checkInAttendance(remarks = "", token = null) {
  const response = await fetch(`${API_BASE_URL}/api/attendance/check-in`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json",
    }, token),
    body: JSON.stringify({ remarks }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to check in");
  }

  return payload.data;
}

export async function checkOutAttendance(remarks = "", token = null) {
  const response = await fetch(`${API_BASE_URL}/api/attendance/check-out`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json",
    }, token),
    body: JSON.stringify({ remarks }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to check out");
  }

  return payload.data;
}

export async function getAttendanceRecords(params = {}, token = null) {
  const query = new URLSearchParams();
  if (params.date) query.append("date", params.date);
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.employeeId) query.append("employeeId", params.employeeId);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const response = await fetch(`${API_BASE_URL}/api/attendance${queryString}`, {
    cache: "no-store",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load attendance records");
  }

  return payload.data || [];
}

export async function applyLeaveRequest(leaveData, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/leaves`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json",
    }, token),
    body: JSON.stringify(leaveData),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to submit leave request");
  }

  return payload.data;
}

export async function getLeaveRequests(params = {}, token = null) {
  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);
  if (params.employeeId) query.append("employeeId", params.employeeId);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const response = await fetch(`${API_BASE_URL}/api/leaves${queryString}`, {
    cache: "no-store",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load leave requests");
  }

  return payload.data || [];
}

export async function updateLeaveRequestStatus(leaveId, status, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/leaves/${leaveId}/status`, {
    method: "PATCH",
    headers: getHeaders({
      "Content-Type": "application/json",
    }, token),
    body: JSON.stringify({ status }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to update leave status");
  }

  return payload.data;
}

export async function getDashboardStats(token = null) {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
    cache: "no-store",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load dashboard stats");
  }

  return payload.data;
}

export async function getHolidays(token = null) {
  const response = await fetch(`${API_BASE_URL}/api/holidays`, {
    cache: "no-store",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load holidays");
  }

  return payload.data || [];
}

export async function createHoliday(holidayData, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/holidays`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json",
    }, token),
    body: JSON.stringify(holidayData),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to create holiday");
  }

  return payload.data;
}

export async function updateHoliday(id, holidayData, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/holidays/${id}`, {
    method: "PUT",
    headers: getHeaders({
      "Content-Type": "application/json",
    }, token),
    body: JSON.stringify(holidayData),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to update holiday");
  }

  return payload.data;
}

export async function deleteHoliday(id, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/holidays/${id}`, {
    method: "DELETE",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to delete holiday");
  }

  return payload.message || "Deleted successfully";
}

export async function getDocuments(token = null) {
  const response = await fetch(`${API_BASE_URL}/api/documents`, {
    cache: "no-store",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load documents");
  }

  return payload.data || [];
}

export async function uploadDocument(formData, token = null) {
  // Omit Content-Type header so the browser sets it with the boundary
  const headers = getHeaders({}, token);
  delete headers["Content-Type"];

  const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const validationMessage = payload.errors?.map((error) => error.msg).join(" ");
    throw new Error(validationMessage || payload.message || "Unable to upload document");
  }

  return payload.data;
}

export async function updateDocument(id, formData, token = null) {
  const headers = getHeaders({}, token);
  delete headers["Content-Type"];

  const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
    method: "PUT",
    headers,
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to update document");
  }

  return payload.data;
}

export async function verifyDocument(id, status, remarks, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/documents/${id}/verify`, {
    method: "PATCH",
    headers: getHeaders({
      "Content-Type": "application/json",
    }, token),
    body: JSON.stringify({ status, remarks }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to verify document");
  }

  return payload.data;
}

export async function deleteDocument(id, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
    method: "DELETE",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to delete document");
  }

  return payload.message || "Deleted successfully";
}

export async function getNotifications(token = null) {
  const response = await fetch(`${API_BASE_URL}/api/notifications`, {
    cache: "no-store",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load notifications");
  }

  return payload.data || [];
}

export async function markAsRead(id, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
    method: "PATCH",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to mark notification as read");
  }

  return payload.data;
}

export async function markAllAsRead(token = null) {
  const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
    method: "PATCH",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to mark all notifications as read");
  }

  return payload.message;
}

export async function deleteNotification(id, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
    method: "DELETE",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to delete notification");
  }

  return payload.message;
}

// =========================================
// Payroll API Helpers
// =========================================

export async function getPayrolls(filters = {}, token = null) {
  const queryParams = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    if (filters[key]) queryParams.append(key, filters[key]);
  });

  const response = await fetch(`${API_BASE_URL}/api/payroll?${queryParams.toString()}`, {
    cache: "no-store",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load payroll list");
  }

  return payload.data;
}

export async function getPayrollById(id, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/payroll/${id}`, {
    cache: "no-store",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load payroll record");
  }

  return payload.data;
}

export async function generatePayroll(data, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/payroll/generate`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }, token),
    body: JSON.stringify(data),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to generate payroll");
  }

  return payload.data;
}

export async function updatePayroll(id, data, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/payroll/${id}`, {
    method: "PUT",
    headers: getHeaders({ "Content-Type": "application/json" }, token),
    body: JSON.stringify(data),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to update payroll");
  }

  return payload.data;
}

export async function markPayrollAsPaid(id, paymentMethod, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/payroll/${id}/pay`, {
    method: "PATCH",
    headers: getHeaders({ "Content-Type": "application/json" }, token),
    body: JSON.stringify({ paymentMethod }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to mark payroll as paid");
  }

  return payload.data;
}

export async function deletePayroll(id, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/payroll/${id}`, {
    method: "DELETE",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to delete payroll record");
  }

  return payload.data;
}

export async function getEmployeePayrollHistory(employeeId, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/payroll/employee/${employeeId}`, {
    cache: "no-store",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load payroll history");
  }

  return payload.data;
}

export async function getMonthlyPayrollReport(month, year, token = null) {
  const queryParams = new URLSearchParams();
  if (month) queryParams.append("month", month);
  if (year) queryParams.append("year", year);

  const response = await fetch(`${API_BASE_URL}/api/payroll/report?${queryParams.toString()}`, {
    cache: "no-store",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load payroll report");
  }

  return payload.data;
}

export async function autoGeneratePayroll(month, year, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/payroll/auto-generate`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }, token),
    body: JSON.stringify({ month, year }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to run auto payroll generator");
  }

  return payload.data;
}

// =========================================
// Settings API Helpers
// =========================================

export async function getSystemSettings(token = null) {
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    cache: "no-store",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load system settings");
  }

  return payload.data;
}

export async function updateRolePermissions(role, permissions, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/settings/roles/${role}/permissions`, {
    method: "PUT",
    headers: getHeaders({ "Content-Type": "application/json" }, token),
    body: JSON.stringify({ permissions }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to update role permissions");
  }

  return payload.data;
}

export async function forgotPassword(email) {
  const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to send reset password email");
  }

  return payload;
}

export async function resetPassword(token, password, confirmPassword) {
  const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password, confirmPassword }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to reset password");
  }

  return payload;
}

export async function getAttendanceSettings(token = null) {
  const response = await fetch(`${API_BASE_URL}/api/settings/attendance`, {
    cache: "no-store",
    headers: getHeaders({}, token),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to load attendance settings");
  }

  return payload.data;
}

export async function updateAttendanceSettings(data, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/settings/attendance`, {
    method: "PUT",
    headers: getHeaders({ "Content-Type": "application/json" }, token),
    body: JSON.stringify(data),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to update attendance settings");
  }

  return payload.data;
}

export async function createRole(roleName, token = null) {
  const response = await fetch(`${API_BASE_URL}/api/settings/roles`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }, token),
    body: JSON.stringify({ roleName }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to create new role");
  }

  return payload.data;
}
