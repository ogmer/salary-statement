"use client";

import { memo } from "react";
import type { SalaryData } from "@/app/lib/types";
import { MAX_STRING_LENGTH } from "@/app/lib/validation";

interface BasicInfoSectionProps {
  salaryData: SalaryData;
  onUpdate: (
    field:
      | "companyName"
      | "departmentName"
      | "employeeNumber"
      | "employeeName"
      | "year"
      | "month",
    value: string | number
  ) => void;
}

const BasicInfoSection = memo(function BasicInfoSection({
  salaryData,
  onUpdate,
}: BasicInfoSectionProps) {
  return (
    <div className="space-y-2 md:space-y-4">
      <h3 className="text-sm md:text-lg font-medium text-gray-700">
        基本情報
      </h3>
      <div className="grid grid-cols-1 gap-2 md:gap-4">
        <div>
          <label
            htmlFor="company-name"
            className="block text-xs md:text-sm font-medium text-gray-600 mb-1"
          >
            会社名
          </label>
          <input
            id="company-name"
            type="text"
            value={salaryData.companyName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onUpdate("companyName", e.target.value)
            }
            maxLength={MAX_STRING_LENGTH}
            className="w-full px-2 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
            placeholder="会社名を入力"
          />
        </div>
        <div>
          <label
            htmlFor="department-name"
            className="block text-xs md:text-sm font-medium text-gray-600 mb-1"
          >
            部署名
          </label>
          <input
            id="department-name"
            type="text"
            value={salaryData.departmentName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onUpdate("departmentName", e.target.value)
            }
            maxLength={MAX_STRING_LENGTH}
            className="w-full px-2 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
            placeholder="部署名を入力"
          />
        </div>
        <div>
          <label
            htmlFor="employee-number"
            className="block text-xs md:text-sm font-medium text-gray-600 mb-1"
          >
            社員番号
          </label>
          <input
            id="employee-number"
            type="text"
            value={salaryData.employeeNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onUpdate("employeeNumber", e.target.value)
            }
            maxLength={MAX_STRING_LENGTH}
            className="w-full px-2 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
            placeholder="社員番号を入力"
          />
        </div>
        <div>
          <label
            htmlFor="employee-name"
            className="block text-xs md:text-sm font-medium text-gray-600 mb-1"
          >
            氏名
          </label>
          <input
            id="employee-name"
            type="text"
            value={salaryData.employeeName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onUpdate("employeeName", e.target.value)
            }
            maxLength={MAX_STRING_LENGTH}
            className="w-full px-2 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
            placeholder="従業員名を入力"
          />
        </div>
      </div>
    </div>
  );
});

export default BasicInfoSection;
