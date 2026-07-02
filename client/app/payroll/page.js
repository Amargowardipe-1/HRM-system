import { PayrollDashboard } from "@/components/payroll/PayrollDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Payroll Management | People Ops HRM",
  description: "Calculate employee salaries, process monthly payrolls, and download payslips.",
};

export default function PayrollPage() {
  return (
    <main className="p-8 max-md:p-4 max-sm:p-3 max-w-[1280px] mx-auto w-full">
      <PayrollDashboard />
    </main>
  );
}
