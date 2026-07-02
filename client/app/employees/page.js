import { EmployeeManager } from "@/components/employee/EmployeeManager";
import { Suspense } from "react";

export default function EmployeesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-semibold">Loading employees...</div>}>
      <EmployeeManager />
    </Suspense>
  );
}
