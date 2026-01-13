"use client";

import { memo } from "react";
import dynamic from "next/dynamic";
import type { SalaryData, Totals } from "@/app/lib/types";
import PreviewHeader from "./PreviewHeader";
import EarningsTable from "./EarningsTable";
import DeductionsTable from "./DeductionsTable";
import AttendanceSummary from "./AttendanceSummary";

const PDFExportButton = dynamic(
  () => import("@/app/components/PDFExportButton"),
  {
    loading: () => <button disabled>読み込み中...</button>,
    ssr: false,
  }
);

interface SalaryPreviewProps {
  salaryData: SalaryData;
  totals: Totals;
  isMobile: boolean;
  formatAmount: (amount: number, showZero?: boolean) => string;
  onUpdateDeduction: (
    index: number,
    field: "name" | "amount",
    value: string
  ) => void;
}

const SalaryPreview = memo(function SalaryPreview({
  salaryData,
  totals,
  isMobile,
  formatAmount,
  onUpdateDeduction,
}: SalaryPreviewProps) {
  return (
    <div className="bg-white border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          <span className="md:hidden">給与明細</span>
          <span className="hidden md:inline">給与明細プレビュー</span>
        </h2>
        <PDFExportButton salaryData={salaryData} />
      </div>

      {/* スマホ版では縮小表示、PC版では通常表示 */}
      <div
        className="overflow-hidden md:overflow-visible -mx-6 md:mx-0"
        style={
          isMobile ? { height: "fit-content", maxHeight: "50vh" } : undefined
        }
      >
        <div
          id="salary-statement"
          className="bg-white p-4 md:p-8 transform md:transform-none scale-50 md:scale-100 origin-top-left md:origin-center w-[200%] md:w-auto min-w-[200%] md:min-w-0"
          style={{
            marginBottom: isMobile ? "-50%" : undefined,
            paddingBottom: isMobile ? 0 : undefined,
          }}
        >
          <PreviewHeader salaryData={salaryData} />
          <EarningsTable earnings={salaryData.earnings} totals={totals} />
          <DeductionsTable
            deductions={salaryData.deductions}
            totals={totals}
            onUpdateDeduction={onUpdateDeduction}
          />
          <AttendanceSummary
            attendance={salaryData.attendance}
            totals={totals}
            formatAmount={formatAmount}
          />
        </div>
      </div>
    </div>
  );
});

export default SalaryPreview;
