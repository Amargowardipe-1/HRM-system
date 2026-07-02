"use client";

import { useRef } from "react";
import { X, Printer, Coins, Building, User, Calendar, CreditCard } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Helper to convert number to words (simple Indian Rupee version)
function numberToWords(num) {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "Zero";

  function g(n) {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? " " + a[digit] : "");
  }

  function h(n) {
    if (n < 100) return g(n);
    return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + g(n % 100) : "");
  }

  let str = "";
  let temp = num;

  if (temp >= 10000000) {
    str += h(Math.floor(temp / 10000000)) + " Crore ";
    temp %= 10000000;
  }
  if (temp >= 100000) {
    str += h(Math.floor(temp / 100000)) + " Lakh ";
    temp %= 100000;
  }
  if (temp >= 1000) {
    str += h(Math.floor(temp / 1000)) + " Thousand ";
    temp %= 1000;
  }
  if (temp > 0) {
    str += h(temp);
  }

  return str.trim() + " Rupees Only";
}

export function PayslipModal({ payroll, onClose }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const totalEarnings = payroll.basicSalary + payroll.allowance + payroll.bonus + (payroll.overtimeAmount || 0);
  const totalDeductions = payroll.deduction + payroll.pf + payroll.tax + (payroll.esic || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-white">
      {/* CSS for print media layout */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col print:max-h-none print:overflow-visible print:rounded-none print:shadow-none print:border-none print:w-full">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-150 flex items-center justify-between sticky top-0 z-10 no-print">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Coins className="text-brand-primary" size={20} />
            Employee Payslip Detail
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-all"
            >
              <Printer size={14} />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Payslip A4 Sheet Document */}
        <div className="p-8 flex-1 flex justify-center bg-slate-100 print:bg-white print:p-0">
          <div
            ref={printRef}
            className="print-container bg-white w-full max-w-[800px] border border-slate-200 p-8 shadow-md rounded-xl font-sans text-slate-800 text-xs leading-relaxed print:shadow-none print:border-none print:p-4"
          >
            {/* Header / Company Branding */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid w-8 h-8 place-items-center rounded-lg bg-slate-800 text-white font-black text-sm">
                    HR
                  </span>
                  <span className="text-lg font-black tracking-tight text-slate-800">PEOPLE OPS HRM</span>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold mt-1 max-w-xs">
                  121, Corporate Heights, Sector 62, Noida, Uttar Pradesh, India
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-black tracking-wider text-slate-800 uppercase">Payslip</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                  For the month of {MONTH_NAMES[payroll.month - 1]}, {payroll.year}
                </p>
              </div>
            </div>

            {/* Employee Details Snapshot */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3.5 my-6 bg-slate-50 border border-slate-200/60 p-4 rounded-lg">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Employee Name</span>
                <span className="font-extrabold text-slate-800">{payroll.employeeSnapshot?.name || payroll.employee?.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Employee Code</span>
                <span className="font-extrabold text-slate-800">{payroll.employeeSnapshot?.employeeCode || payroll.employee?.employeeCode}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Department</span>
                <span className="font-bold text-slate-700">{payroll.employeeSnapshot?.department || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Designation</span>
                <span className="font-bold text-slate-700">{payroll.employeeSnapshot?.designation || payroll.employee?.designation?.title || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Payment Mode</span>
                <span className="font-bold text-slate-700">{payroll.paymentMethod || "Bank Transfer"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Status</span>
                <span className="font-extrabold text-emerald-600 uppercase text-[10px]">{payroll.status}</span>
              </div>
            </div>

            {/* Earnings and Deductions Breakup */}
            <div className="grid grid-cols-2 gap-0 border border-slate-200 rounded-lg overflow-hidden">
              {/* Earnings Column */}
              <div className="border-r border-slate-200">
                <div className="bg-slate-800 text-white font-bold uppercase py-2 px-4 text-[10px] tracking-wider">
                  Earnings
                </div>
                <div className="p-4 space-y-3 min-h-[160px]">
                  <div className="flex justify-between items-center text-slate-600 font-medium">
                    <span>Basic Salary</span>
                    <span className="font-mono">₹{payroll.basicSalary.toLocaleString("en-IN")}</span>
                  </div>
                  {payroll.allowance > 0 && (
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span>House Rent Allowance (HRA)</span>
                      <span className="font-mono">₹{payroll.allowance.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {payroll.bonus > 0 && (
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span>Special Performance Bonus</span>
                      <span className="font-mono">₹{payroll.bonus.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {payroll.overtimeAmount > 0 && (
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span>Overtime Pay ({payroll.attendanceSummary?.overtimeHours || 0} hrs)</span>
                      <span className="font-mono">₹{payroll.overtimeAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 border-t border-slate-200 font-extrabold py-2.5 px-4 flex justify-between items-center text-slate-800">
                  <span>Gross Earnings</span>
                  <span className="font-mono text-slate-900">₹{totalEarnings.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Deductions Column */}
              <div>
                <div className="bg-slate-800 text-white font-bold uppercase py-2 px-4 text-[10px] tracking-wider">
                  Deductions
                </div>
                <div className="p-4 space-y-3 min-h-[160px]">
                  {payroll.pf > 0 && (
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span>Provident Fund (PF)</span>
                      <span className="font-mono">₹{payroll.pf.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {payroll.esic > 0 && (
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span>ESIC Contribution</span>
                      <span className="font-mono">₹{payroll.esic.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {payroll.tax > 0 && (
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span>Income Tax / TDS</span>
                      <span className="font-mono">₹{payroll.tax.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {payroll.deduction > 0 && (
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span>Other Deductions</span>
                      <span className="font-mono">₹{payroll.deduction.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 border-t border-slate-200 font-extrabold py-2.5 px-4 flex justify-between items-center text-slate-800">
                  <span>Total Deductions</span>
                  <span className="font-mono text-slate-900">₹{totalDeductions.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Net Salary Highlight */}
            <div className="mt-6 border-2 border-slate-800 bg-slate-50 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                  Net Salary Payable (Take-home)
                </div>
                <div className="text-[11px] text-slate-600 font-semibold mt-1">
                  In Words: <span className="italic font-bold text-slate-800">{numberToWords(payroll.netSalary)}</span>
                </div>
              </div>
              <div className="text-right md:text-right w-full md:w-auto border-t md:border-t-0 border-slate-200 pt-3 md:pt-0">
                <div className="text-2xl font-black text-slate-900 font-mono">
                  ₹{payroll.netSalary.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            {/* Verification / Signature Area */}
            <div className="mt-12 flex justify-between items-end">
              <div className="text-slate-400 text-[10px] font-medium italic">
                *This is a computer-generated document and does not require a physical signature.
              </div>
              <div className="text-center border-t border-slate-300 pt-2 px-8">
                <div className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Authorized Signatory</div>
                <div className="text-[9px] text-slate-400 mt-0.5">People Operations Department</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
