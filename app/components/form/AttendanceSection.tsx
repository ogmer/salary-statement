"use client";

import { memo } from "react";
import type { SalaryData, SalaryItem } from "@/app/lib/types";
import {
  MAX_STRING_LENGTH,
  convertFullWidthToHalfWidth,
} from "@/app/lib/validation";

interface AttendanceSectionProps {
  year: number;
  month: number;
  attendance: SalaryItem[];
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
  onUpdateAttendance: (
    index: number,
    field: "name" | "amount",
    value: string
  ) => void;
}

const AttendanceSection = memo(function AttendanceSection({
  year,
  month,
  attendance,
  onUpdateBasicInfo,
  onUpdateAttendance,
}: AttendanceSectionProps) {
  return (
    <div className="space-y-3 md:space-y-6">
      {/* 労働期間 */}
      <div className="space-y-2 md:space-y-4">
        <h3 className="text-sm md:text-lg font-medium text-gray-700">
          労働期間
        </h3>
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <div>
            <label
              htmlFor="year"
              className="block text-xs md:text-sm font-medium text-gray-600 mb-1"
            >
              年
            </label>
            <select
              id="year"
              value={year}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onUpdateBasicInfo("year", e.target.value)
              }
              className="w-full px-2 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
            >
              {Array.from({ length: 10 }, (_, i) => 2020 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="month"
              className="block text-xs md:text-sm font-medium text-gray-600 mb-1"
            >
              月
            </label>
            <select
              id="month"
              value={month}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onUpdateBasicInfo("month", e.target.value)
              }
              className="w-full px-2 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 勤怠項目 */}
      <div className="space-y-2 md:space-y-4">
        <h3 className="text-sm md:text-lg font-medium text-gray-700">
          勤怠項目
        </h3>
        <div className="space-y-1.5 md:space-y-3">
          {attendance.map((item: SalaryItem, index: number) => (
            <div key={index} className="flex gap-1 md:gap-2 items-center">
              <input
                type="text"
                value={item.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onUpdateAttendance(index, "name", e.target.value)
                }
                maxLength={MAX_STRING_LENGTH}
                className="flex-1 min-w-0 px-1.5 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                placeholder={
                  index === 0
                    ? "労働日数"
                    : index === 1
                    ? "残業時間"
                    : index === 2
                    ? "その他勤怠1"
                    : "その他勤怠2"
                }
              />
              <input
                type="text"
                inputMode="numeric"
                value={item.amount === 0 ? "" : item.amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const convertedValue = convertFullWidthToHalfWidth(
                    e.target.value
                  );
                  onUpdateAttendance(index, "amount", convertedValue);
                }}
                className="flex-1 min-w-0 px-1 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default AttendanceSection;
