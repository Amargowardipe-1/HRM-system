import { BankDetailsDashboard } from "@/components/bank-details/BankDetailsDashboard";
import { Suspense } from "react";

export default function BankDetailsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-semibold">Loading bank details...</div>}>
      <BankDetailsDashboard />
    </Suspense>
  );
}
