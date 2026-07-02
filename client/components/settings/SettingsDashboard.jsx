"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import EmailSettings from "./EmailSettings/EmailSettings";
import { getSystemSettings, updateRolePermissions, getAttendanceSettings, updateAttendanceSettings, createRole } from "@/lib/api";
import {
  AlertTriangle,
  Check,
  Database,
  KeyRound,
  Loader2,
  Lock,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UsersRound,
  Plus,
} from "lucide-react";

const ROLE_STYLES = {
  Admin: "bg-emerald-50 text-emerald-700 border-emerald-200",
  HR: "bg-amber-50 text-amber-700 border-amber-200",
  Employee: "bg-sky-50 text-sky-700 border-sky-200",
};

function normalizeRolePermissions(roles = []) {
  return roles.reduce((acc, role) => {
    acc[role.role] = role.permissions || [];
    return acc;
  }, {});
}

export function SettingsDashboard() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [settings, setSettings] = useState(null);
  const [rolePermissions, setRolePermissions] = useState({});
  const [activeRole, setActiveRole] = useState("Admin");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isAdmin = user?.role === "Admin";

  const [activeTab, setActiveTab] = useState("permissions");
  const [attendanceSettings, setAttendanceSettings] = useState(null);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const [isAttendanceSaving, setIsAttendanceSaving] = useState(false);

  async function loadSettings() {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await getSystemSettings(token);
      setSettings(data);
      setRolePermissions(normalizeRolePermissions(data.roles));
    } catch (err) {
      setError(err.message || "Unable to load settings.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAttendanceSettings() {
    setIsAttendanceLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await getAttendanceSettings(token);
      setAttendanceSettings(data);
    } catch (err) {
      setError(err.message || "Unable to load attendance settings.");
    } finally {
      setIsAttendanceLoading(false);
    }
  }

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === "permissions") {
      loadSettings();
    } else if (activeTab === "attendance") {
      loadAttendanceSettings();
    }
  }, [isAdmin, activeTab]);

  async function handleSaveAttendance(e) {
    e.preventDefault();
    setIsAttendanceSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await updateAttendanceSettings(attendanceSettings, token);
      setAttendanceSettings(updated);
      setMessage("Attendance settings saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save attendance settings.");
    } finally {
      setIsAttendanceSaving(false);
    }
  }

  const handleWeekendToggle = (day) => {
    setMessage("");
    setError("");
    setAttendanceSettings((prev) => {
      const currentWeekend = prev?.weekend || [];
      const exists = currentWeekend.includes(day);
      const updatedWeekend = exists
        ? currentWeekend.filter((d) => d !== day)
        : [...currentWeekend, day];
      return { ...prev, weekend: updatedWeekend };
    });
  };

  const handleAttendanceChange = (key, value) => {
    setAttendanceSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const filteredGroups = useMemo(() => {
    const search = query.trim().toLowerCase();
    const groups = settings?.permissionGroups || [];

    if (!search) return groups;

    return groups
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (permission) =>
            permission.key.toLowerCase().includes(search) ||
            permission.label.toLowerCase().includes(search) ||
            group.label.toLowerCase().includes(search)
        ),
      }))
      .filter((group) => group.permissions.length);
  }, [query, settings]);

  const activePermissions = rolePermissions[activeRole] || [];
  const totalPermissions = settings?.allPermissions?.length || 0;
  const enabledPercent = totalPermissions
    ? Math.round((activePermissions.length / totalPermissions) * 100)
    : 0;

  function togglePermission(permissionKey) {
    setMessage("");
    setError("");

    if (activeRole === "Admin" && ["settings:view", "settings:update"].includes(permissionKey)) {
      setError("Admin settings permissions cannot be disabled.");
      return;
    }

    setRolePermissions((current) => {
      const currentPermissions = current[activeRole] || [];
      const exists = currentPermissions.includes(permissionKey);

      return {
        ...current,
        [activeRole]: exists
          ? currentPermissions.filter((permission) => permission !== permissionKey)
          : [...currentPermissions, permissionKey],
      };
    });
  }

  function setGroupPermissions(group, shouldEnable) {
    setMessage("");
    setError("");

    setRolePermissions((current) => {
      const currentPermissions = current[activeRole] || [];
      const groupKeys = group.permissions.map((permission) => permission.key);
      const next = new Set(currentPermissions);

      groupKeys.forEach((permission) => {
        if (activeRole === "Admin" && ["settings:view", "settings:update"].includes(permission)) {
          next.add(permission);
          return;
        }

        if (shouldEnable) {
          next.add(permission);
        } else {
          next.delete(permission);
        }
      });

      return {
        ...current,
        [activeRole]: [...next],
      };
    });
  }

  async function handleSave() {
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const updated = await updateRolePermissions(activeRole, activePermissions, token);
      setRolePermissions((current) => ({
        ...current,
        [activeRole]: updated.permissions || [],
      }));
      setMessage(`${activeRole} permissions saved successfully.`);
    } catch (err) {
      setError(err.message || "Unable to save permissions.");
    } finally {
      setIsSaving(false);
    }
  }

  const [newRoleName, setNewRoleName] = useState("");
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  async function handleCreateRole(e) {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setIsCreatingRole(true);
    setError("");
    setMessage("");

    try {
      const createdRole = await createRole(newRoleName.trim(), token);
      
      setSettings((prev) => {
        if (!prev) return prev;
        const updatedRoles = [...(prev.roles || []), createdRole];
        return {
          ...prev,
          roles: updatedRoles,
          system: {
            ...prev.system,
            roles: updatedRoles.length,
          },
        };
      });

      setRolePermissions((prev) => ({
        ...prev,
        [createdRole.role]: [],
      }));

      setActiveRole(createdRole.role);
      setMessage(`Role "${createdRole.role}" created successfully.`);
      setNewRoleName("");
    } catch (err) {
      setError(err.message || "Unable to create new role.");
    } finally {
      setIsCreatingRole(false);
    }
  }

  if (!isAdmin) {
    return (
      <main className="min-h-[70vh] grid place-items-center p-6">
        <section className="w-full max-w-xl rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600">
            <Lock size={26} />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-brand-text">Admin access required</h1>
          <p className="mt-2 text-sm text-brand-muted">
            Settings contain role permissions and system-wide controls. Login with an Admin account to continue.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 inline-flex min-h-[42px] items-center justify-center rounded-xl bg-brand-primary px-5 text-sm font-bold text-white shadow-lg shadow-brand-primary/15"
          >
            Back to dashboard
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-[1380px] gap-6 p-8 max-md:p-4 max-sm:p-3">
      <section className="relative overflow-hidden rounded-[28px] border border-white bg-emerald-950 p-7 text-white shadow-2xl shadow-slate-300/70">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_20%,rgba(18,108,101,0.45),transparent_35%),radial-gradient(circle_at_40%_70%,rgba(192,111,45,0.28),transparent_34%)]" />
        <div className="relative flex items-start justify-between gap-5 max-lg:flex-col">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-emerald-100">
              <ShieldCheck size={14} />
              Admin Control Center
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight max-sm:text-3xl">
              System Settings
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Manage role based access, review the HRM data modules, and keep permissions aligned with how your team actually works.
            </p>
          </div>

          <button
            onClick={loadSettings}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/15"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </section>

      {isLoading ? (
        <section className="grid min-h-[360px] place-items-center rounded-3xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-sm font-bold text-brand-muted">
            <Loader2 className="animate-spin text-brand-primary" size={20} />
            Loading system settings...
          </div>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
            <SummaryCard icon={UsersRound} label="Roles" value={settings?.system?.roles || 0} tone="emerald" />
            <SummaryCard icon={KeyRound} label="Permissions" value={settings?.system?.permissions || 0} tone="amber" />
            <SummaryCard icon={Database} label="Data Modules" value={settings?.system?.modules || 0} tone="sky" />
            <SummaryCard icon={Settings2} label="Active Role" value={activeRole} tone="slate" />
          </section>

          {/* Tabs for switching between Permissions, Attendance, and Email */}
          <div className="flex border-b border-slate-200/80 mt-2">
            <button
              onClick={() => {
                setActiveTab("permissions");
                setMessage("");
                setError("");
              }}
              className={`pb-3 px-6 text-sm font-extrabold border-b-3 transition-all cursor-pointer ${
                activeTab === "permissions"
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-slate-500 hover:text-brand-text"
              }`}
            >
              Role Permissions
            </button>
            <button
              onClick={() => {
                setActiveTab("attendance");
                setMessage("");
                setError("");
              }}
              className={`pb-3 px-6 text-sm font-extrabold border-b-3 transition-all cursor-pointer ${
                activeTab === "attendance"
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-slate-500 hover:text-brand-text"
              }`}
            >
              Attendance Settings
            </button>
            <button
              onClick={() => {
                setActiveTab("email");
                setMessage("");
                setError("");
              }}
              className={`pb-3 px-6 text-sm font-extrabold border-b-3 transition-all cursor-pointer ${
                activeTab === "email"
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-slate-500 hover:text-brand-text"
              }`}
            >
              Email Settings
            </button>
          </div>

          {(error || message) && (
            <div
              className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold ${
                error
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {error ? <AlertTriangle size={17} /> : <Check size={17} />}
              {error || message}
            </div>
          )}

          {activeTab === "permissions" ? (
            <section className="grid grid-cols-[340px_1fr] gap-5 max-xl:grid-cols-1">
            <aside className="grid gap-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-brand-text">Role Access</h2>
                    <p className="mt-1 text-xs font-medium text-brand-muted">Select a role to manage permissions.</p>
                  </div>
                  <SlidersHorizontal className="text-brand-primary" size={20} />
                </div>

                <div className="mt-5 grid gap-2">
                  {(settings?.roles || []).map((role) => (
                    <button
                      key={role.role}
                      onClick={() => setActiveRole(role.role)}
                      className={`flex items-center justify-between rounded-2xl border p-3 text-left transition ${
                        activeRole === role.role
                          ? "border-brand-primary bg-brand-primary/8 shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <span>
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-extrabold ${ROLE_STYLES[role.role] || ROLE_STYLES.Employee}`}>
                          {role.role}
                        </span>
                        <span className="mt-2 block text-xs font-semibold text-brand-muted">
                          {settings?.roleCounts?.[role.role] || 0} users assigned
                        </span>
                      </span>
                      <span className="text-lg font-extrabold text-brand-text">
                        {(rolePermissions[role.role] || []).length}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Create Custom Role</h3>
                  <form onSubmit={handleCreateRole} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Manager"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      required
                      disabled={isCreatingRole}
                      className="flex-1 min-h-[38px] border border-slate-200 rounded-xl px-3 text-xs font-semibold outline-none focus:border-brand-primary bg-slate-50/50"
                    />
                    <button
                      type="submit"
                      disabled={isCreatingRole || !newRoleName.trim()}
                      className="min-h-[38px] px-3.5 rounded-xl bg-brand-primary text-xs font-bold text-white shadow-md shadow-brand-primary/10 hover:bg-brand-primary/95 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1"
                    >
                      {isCreatingRole ? <Loader2 className="animate-spin" size={13} /> : <Plus size={13} />}
                      Add
                    </button>
                  </form>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-brand-text">Coverage</h2>
                    <p className="text-xs font-medium text-brand-muted">{enabledPercent}% enabled for {activeRole}</p>
                  </div>
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-primary transition-all"
                    style={{ width: `${enabledPercent}%` }}
                  />
                </div>
              </div>
            </aside>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-extrabold text-brand-text">{activeRole} Permissions</h2>
                  <p className="mt-1 text-sm text-brand-muted">
                    {activePermissions.length} permissions enabled from {totalPermissions}.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search permissions..."
                      className="min-h-[42px] w-[260px] rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-brand-primary focus:bg-white max-sm:w-full"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-bold text-white shadow-lg shadow-brand-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
                    Save
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                {filteredGroups.map((group) => {
                  const groupKeys = group.permissions.map((permission) => permission.key);
                  const enabledCount = groupKeys.filter((permission) => activePermissions.includes(permission)).length;
                  const allEnabled = enabledCount === groupKeys.length;

                  return (
                    <article key={group.key} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-extrabold text-brand-text">{group.label}</h3>
                          <p className="mt-1 text-xs font-medium text-brand-muted">{group.description}</p>
                        </div>
                        <button
                          onClick={() => setGroupPermissions(group, !allEnabled)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-brand-text transition hover:border-brand-primary hover:text-brand-primary"
                        >
                          {allEnabled ? "Disable group" : "Enable group"}
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 max-lg:grid-cols-1">
                        {group.permissions.map((permission) => {
                          const checked = activePermissions.includes(permission.key);

                          return (
                            <button
                              key={permission.key}
                              onClick={() => togglePermission(permission.key)}
                              className={`flex min-h-[58px] items-center justify-between rounded-2xl border px-4 text-left transition ${
                                checked
                                  ? "border-brand-primary/30 bg-white text-brand-text shadow-sm"
                                  : "border-slate-200 bg-white/70 text-slate-500 hover:bg-white"
                              }`}
                            >
                              <span>
                                <span className="block text-sm font-bold">{permission.label}</span>
                                <span className="mt-0.5 block text-[11px] font-semibold text-slate-400">
                                  {permission.key}
                                </span>
                              </span>
                              <span
                                className={`relative h-6 w-11 rounded-full transition ${
                                  checked ? "bg-brand-primary" : "bg-slate-200"
                                }`}
                              >
                                <span
                                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                                    checked ? "left-6" : "left-1"
                                  }`}
                                />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </section>
          ) : activeTab === "attendance" ? (
            isAttendanceLoading ? (
              <section className="grid min-h-[300px] place-items-center rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 text-sm font-bold text-brand-muted">
                  <Loader2 className="animate-spin text-brand-primary" size={20} />
                  Loading attendance configurations...
                </div>
              </section>
            ) : (
              <form onSubmit={handleSaveAttendance} className="grid gap-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="border-b border-slate-100 pb-4 mb-6">
                    <h2 className="text-xl font-extrabold text-brand-text font-black">Attendance & Late Mark Configurations</h2>
                    <p className="text-xs text-brand-muted mt-1">Configure default working hours, grace periods, late mark penalties, and overtime. These settings are dynamically read by Attendance Logging and Payroll Salary generation.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                    {/* Time Settings */}
                    <div className="space-y-4.5">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">Shift Timing</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Office Start Time</label>
                          <input
                            type="time"
                            value={attendanceSettings?.officeStartTime || "09:00"}
                            onChange={(e) => handleAttendanceChange("officeStartTime", e.target.value)}
                            className="w-full min-h-[42px] border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-brand-primary bg-slate-50/50"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Office End Time</label>
                          <input
                            type="time"
                            value={attendanceSettings?.officeEndTime || "18:00"}
                            onChange={(e) => handleAttendanceChange("officeEndTime", e.target.value)}
                            className="w-full min-h-[42px] border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-brand-primary bg-slate-50/50"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Grace Time (Minutes)</label>
                        <input
                          type="number"
                          min="0"
                          value={attendanceSettings?.graceTime !== undefined ? attendanceSettings.graceTime : 15}
                          onChange={(e) => handleAttendanceChange("graceTime", Number(e.target.value))}
                          className="w-full min-h-[42px] border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-brand-primary bg-slate-50/50"
                          required
                        />
                        <span className="text-[10px] text-slate-400 font-semibold mt-1.5 block">Allowed delay in minutes after shift start time before check-in is flagged as Late.</span>
                      </div>
                    </div>

                    {/* Half/Full Day Hours */}
                    <div className="space-y-4.5">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">Shift Duration Limits</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Half Day Hours</label>
                          <input
                            type="number"
                            min="1"
                            max="24"
                            value={attendanceSettings?.halfDayHours !== undefined ? attendanceSettings.halfDayHours : 4}
                            onChange={(e) => handleAttendanceChange("halfDayHours", Number(e.target.value))}
                            className="w-full min-h-[42px] border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-brand-primary bg-slate-50/50"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Day Hours</label>
                          <input
                            type="number"
                            min="1"
                            max="24"
                            value={attendanceSettings?.fullDayHours !== undefined ? attendanceSettings.fullDayHours : 8}
                            onChange={(e) => handleAttendanceChange("fullDayHours", Number(e.target.value))}
                            className="w-full min-h-[42px] border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-brand-primary bg-slate-50/50"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3.5 border border-slate-100 rounded-2xl bg-slate-50/30">
                        <div>
                          <label className="block text-sm font-bold text-slate-800">Overtime Compensation</label>
                          <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">Calculate pay for additional working hours beyond Full Day hours limit.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAttendanceChange("overtimeEnabled", !attendanceSettings?.overtimeEnabled)}
                          className={`relative h-6 w-11 rounded-full transition cursor-pointer ${
                            attendanceSettings?.overtimeEnabled ? "bg-brand-primary" : "bg-slate-200"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                              attendanceSettings?.overtimeEnabled ? "left-6" : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Late Mark Rules */}
                    <div className="space-y-4.5">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">Late Mark Deduction Rules</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Allowed Late Days / Month</label>
                          <input
                            type="number"
                            min="0"
                            value={attendanceSettings?.allowedLateMarks !== undefined ? attendanceSettings.allowedLateMarks : 3}
                            onChange={(e) => handleAttendanceChange("allowedLateMarks", Number(e.target.value))}
                            className="w-full min-h-[42px] border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-brand-primary bg-slate-50/50"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deduction Per Extra Late (Day)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            value={attendanceSettings?.deductionPerLateMark !== undefined ? attendanceSettings.deductionPerLateMark : 0.5}
                            onChange={(e) => handleAttendanceChange("deductionPerLateMark", Number(e.target.value))}
                            className="w-full min-h-[42px] border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-brand-primary bg-slate-50/50"
                            required
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold block leading-normal">
                        e.g., If allowed is 3 and penalty deduction is 0.5, then the 4th, 5th, etc. late mark in a month will deduct 0.5 day's pay each from payroll.
                      </span>
                    </div>

                    {/* Weekend Selector */}
                    <div className="space-y-4.5">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">Weekly Holidays (Weekend)</h3>
                      <div className="flex flex-wrap gap-2 pt-1.5">
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                          const isWeekend = attendanceSettings?.weekend?.includes(day);
                          return (
                            <button
                              type="button"
                              key={day}
                              onClick={() => handleWeekendToggle(day)}
                              className={`px-3.5 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isWeekend
                                  ? "bg-rose-50 text-rose-600 border-rose-200 shadow-sm"
                                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold block leading-normal">
                        Checked days are marked as weekly holidays. These days are excluded from the calculated working days of the month during payroll processing.
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6 mt-6 flex justify-end gap-3">
                    <button
                      type="submit"
                      disabled={isAttendanceSaving}
                      className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 text-sm font-bold text-white shadow-lg shadow-brand-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isAttendanceSaving ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
                      Save Configurations
                    </button>
                  </div>
                </section>
              </form>
            )
          ) : (
            <EmailSettings token={token} />
          )}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
              <div>
                <h2 className="text-xl font-extrabold text-brand-text">System Data Map</h2>
                <p className="mt-1 text-sm text-brand-muted">
                  Backend-backed modules currently available in this HRM system.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
                Live counts
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1">
              {(settings?.modules || []).map((module) => (
                <article
                  key={module.key}
                  className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                      <Database size={20} />
                    </div>
                    <strong className="text-2xl font-extrabold text-brand-text">{module.count}</strong>
                  </div>
                  <h3 className="mt-4 font-extrabold text-brand-text">{module.label}</h3>
                  <p className="mt-1 text-sm leading-5 text-brand-muted">{module.description}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700",
    slate: "bg-slate-100 text-slate-700",
  }[tone];

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`grid h-12 w-12 place-items-center rounded-2xl ${toneClass}`}>
        <Icon size={22} />
      </div>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-brand-muted">{label}</p>
      <strong className="mt-1 block text-3xl font-extrabold text-brand-text">{value}</strong>
    </article>
  );
}
