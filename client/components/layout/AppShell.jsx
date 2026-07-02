"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function AppShell({ children }) {
  const pathname = usePathname();

  // Do not render sidebar/navbar on the login page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] max-md:grid-cols-[76px_1fr] max-sm:block bg-brand-bg font-sans">
      <Sidebar />
      <div className="flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 max-md:p-4.5 max-sm:p-3.5 flex-1 bg-brand-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
