"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Bell, Menu, Search, Calendar, FileText, CheckCircle2, XCircle, Trash2, CheckSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "@/lib/api";

export function Navbar() {
  const { user } = useAuth() || {};
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/employees?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Generate name initials for avatar
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Poll for new notifications every 15 seconds
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await markAsRead(notif._id);
        fetchNotifications();
      }
      setIsOpen(false);
      if (notif.link) {
        router.push(notif.link);
      }
    } catch (err) {
      console.error("Failed to handle notification click:", err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read:", err.message);
    }
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to delete notification:", err.message);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const topThree = notifications.slice(0, 3);

  const getNotifIcon = (type) => {
    switch (type) {
      case "Leave_Applied":
        return <Calendar className="text-amber-500" size={15} />;
      case "Leave_Approved":
        return <CheckCircle2 className="text-emerald-500" size={15} />;
      case "Leave_Rejected":
        return <XCircle className="text-rose-500" size={15} />;
      case "Document_Uploaded":
        return <FileText className="text-blue-500" size={15} />;
      case "Document_Verified":
        return <CheckCircle2 className="text-emerald-500" size={15} />;
      case "Document_Rejected":
        return <XCircle className="text-rose-500" size={15} />;
      default:
        return <Bell className="text-slate-400" size={15} />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  return (
    <header className="sticky top-0 z-10 flex min-h-[72px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white/72 backdrop-blur-md px-8 max-sm:px-4 shadow-sm">
      {/* Left Column (Menu for mobile, empty spacer on desktop to balance layout) */}
      <div className="flex items-center w-[240px] shrink-0 max-sm:w-auto">
        <button
          className="hidden max-sm:grid w-[38px] h-[38px] place-items-center border border-slate-200 rounded-lg bg-white text-brand-text hover:bg-slate-50 hover:border-slate-300 hover:text-brand-primary transition-all active:scale-98 cursor-pointer"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Center Column (Centered Search Bar) */}
      <div className="flex-1 flex justify-center max-w-[480px]">
        {user?.permissions?.includes("employees:view_all") && (
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="flex min-h-[40px] w-full items-center gap-2.5 border border-slate-200/80 rounded-lg bg-slate-50/80 px-3.5 text-slate-500 focus-within:border-brand-primary focus-within:bg-white focus-within:ring-3 focus-within:ring-brand-primary/8 transition-all">
              <Search size={17} className="text-slate-400 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employees, roles, departments..."
                className="w-full border-0 outline-none bg-transparent text-brand-text text-sm font-medium placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <XCircle size={15} />
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Right Column (Notifications & Profile) */}
      <div className="flex items-center justify-end gap-4 w-[240px] shrink-0 max-sm:w-auto relative" ref={dropdownRef}>
        {/* Notification Bell Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative grid w-[38px] h-[38px] place-items-center border rounded-lg transition-all active:scale-98 cursor-pointer ${
            isOpen
              ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
              : "border-slate-200 bg-white text-brand-text hover:bg-slate-50 hover:border-slate-300 hover:text-brand-primary"
          }`}
          aria-label="Notifications"
        >
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-12 w-[320px] bg-white border border-slate-200/80 rounded-xl shadow-xl z-50 p-4 flex flex-col gap-3.5 animate-fade-in-up origin-top-right">
            <style jsx>{`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: scale(0.95) translateY(4px);
                }
                to {
                  opacity: 1;
                  transform: scale(1) translateY(0);
                }
              }
              .animate-fade-in-up {
                animation: fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
            `}</style>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <strong className="text-sm font-extrabold text-brand-text">Notifications</strong>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-brand-primary hover:text-brand-primary-dark flex items-center gap-1 cursor-pointer"
                >
                  <CheckSquare size={12} />
                  Mark all read
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
              {topThree.length ? (
                topThree.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`group relative flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer hover:bg-slate-50/80 ${
                      notif.isRead
                        ? "border-transparent bg-transparent"
                        : "border-brand-primary/10 bg-brand-primary/3 hover:border-brand-primary/20"
                    }`}
                  >
                    <span className="grid w-[26px] h-[26px] place-items-center rounded-md bg-slate-50 border border-slate-150 shrink-0">
                      {getNotifIcon(notif.type)}
                    </span>
                    <div className="flex-1 min-w-0 pr-4">
                      <span className="block text-xs font-bold text-slate-800 leading-tight truncate">
                        {notif.title}
                      </span>
                      <p className="text-[10px] text-slate-500 font-medium leading-snug mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <small className="text-[9px] text-slate-400 font-bold block mt-1">
                        {formatTimeAgo(notif.createdAt)}
                      </small>
                    </div>

                    {/* Unread dot */}
                    {!notif.isRead && (
                      <span className="absolute top-3 right-3.5 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                    )}

                    {/* Delete button (visible on hover) */}
                    <button
                      onClick={(e) => handleDeleteNotif(e, notif._id)}
                      className="absolute bottom-2 right-2.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5 cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-brand-muted font-medium">
                  No new notifications.
                </div>
              )}
            </div>

            {notifications.length > 3 && (
              <div className="border-t border-slate-100 pt-2 text-center">
                <span className="text-[10px] text-brand-muted font-semibold">
                  Showing top 3 of {notifications.length} notifications
                </span>
              </div>
            )}
          </div>
        )}

        <Link
          href="/profile"
          className="flex min-h-[42px] items-center gap-3 p-1 pr-3.5 max-sm:pr-1 bg-slate-50 border border-slate-200 rounded-full cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all hover:-translate-y-0.5 shadow-sm"
          aria-label="Logged in user"
        >
          <span className="grid w-[34px] h-[34px] place-items-center rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white font-bold text-xs shadow-md shadow-brand-primary/10">
            {initials}
          </span>
          <div className="max-sm:hidden">
            <strong className="block text-sm font-bold leading-none text-brand-text">
              {user?.name || "HR User"}
            </strong>
            <small className="text-brand-muted text-[10px] font-semibold uppercase tracking-wider mt-0.5 block">
              {user?.role || "Employee"}
            </small>
          </div>
        </Link>
      </div>
    </header>
  );
}
