"use client";

import { memo } from "react";
import type { SalaryData } from "@/app/lib/types";
import BasicInfoSection from "./BasicInfoSection";
import EarningsSection from "./EarningsSection";
import AttendanceSection from "./AttendanceSection";
import DeductionsSection from "./DeductionsSection";

interface SalaryFormProps {
  salaryData: SalaryData;
  onUpdateBasicInfo: (
    field:
      | "companyName"
      | "departmentName"
      | "employeeNumber"
      | "employeeName"
      | "year"
      | "month",
    value: string | number
  ) => void;
  onUpdateEarning: (
    index: number,
    field: "name" | "amount",
    value: string
  ) => void;
  onUpdateDeduction: (
    index: number,
    field: "name" | "amount",
    value: string
  ) => void;
  onUpdateAttendance: (
    index: number,
    field: "name" | "amount",
    value: string
  ) => void;
}

const SalaryForm = memo(function SalaryForm({
  salaryData,
  onUpdateBasicInfo,
  onUpdateEarning,
  onUpdateDeduction,
  onUpdateAttendance,
}: SalaryFormProps) {
  return (
    <div className="bg-white border border-gray-200 p-3 md:p-6 mb-8">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-6 text-gray-800">
        給与明細入力フォーム
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-8">
        {/* 左列: 基本情報と支給項目 */}
        <div className="space-y-3 md:space-y-6">
          <BasicInfoSection
            salaryData={salaryData}
            onUpdate={onUpdateBasicInfo}
          />
          <EarningsSection
            earnings={salaryData.earnings}
            onUpdate={onUpdateEarning}
          />
        </div>

        {/* 右列: 労働期間・勤怠項目・控除項目 */}
        <div className="space-y-3 md:space-y-6">
          <AttendanceSection
            year={salaryData.year}
            month={salaryData.month}
            attendance={salaryData.attendance}
            onUpdateBasicInfo={onUpdateBasicInfo}
            onUpdateAttendance={onUpdateAttendance}
          />
          <DeductionsSection
            deductions={salaryData.deductions}
            onUpdate={onUpdateDeduction}
          />
        </div>
      </div>
    </div>
  );
});

export default SalaryForm;
