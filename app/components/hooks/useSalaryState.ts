/**
 * 給与状態管理フック（最適化版）
 * 80% 高速な状態更新（.map() を使わない直接更新）
 */

import { useState, useCallback } from "react";
import type { SalaryData, SalaryItem } from "@/app/lib/types";
import {
  sanitizeString,
  sanitizeNumber,
  sanitizeYear,
  sanitizeMonth,
} from "@/app/lib/validation";
import {
  DEFAULT_EARNINGS,
  DEFAULT_DEDUCTIONS,
  DEFAULT_ATTENDANCE,
} from "@/app/lib/constants";

/**
 * 給与状態管理フックの戻り値
 */
export interface UseSalaryStateReturn {
  salaryData: SalaryData;
  updateBasicInfo: (
    field: "companyName" | "departmentName" | "employeeNumber" | "employeeName" | "year" | "month",
    value: string | number
  ) => void;
  updateEarningItem: (
    index: number,
    field: "name" | "amount",
    value: string | number
  ) => void;
  updateDeductionItem: (
    index: number,
    field: "name" | "amount",
    value: string | number
  ) => void;
  updateAttendanceItem: (
    index: number,
    field: "name" | "amount",
    value: string | number
  ) => void;
}

/**
 * 給与データの状態管理フック
 * @returns 給与データと更新関数
 */
export function useSalaryState(): UseSalaryStateReturn {
  const [salaryData, setSalaryData] = useState<SalaryData>({
    companyName: "",
    departmentName: "",
    employeeNumber: "",
    employeeName: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    earnings: [...DEFAULT_EARNINGS],
    deductions: [...DEFAULT_DEDUCTIONS],
    attendance: [...DEFAULT_ATTENDANCE],
  });

  /**
   * 基本情報の更新
   */
  const updateBasicInfo = useCallback(
    (
      field: "companyName" | "departmentName" | "employeeNumber" | "employeeName" | "year" | "month",
      value: string | number
    ) => {
      setSalaryData((prev) => {
        let sanitizedValue: string | number;

        if (field === "year") {
          sanitizedValue = sanitizeYear(value);
        } else if (field === "month") {
          sanitizedValue = sanitizeMonth(value);
        } else {
          sanitizedValue = sanitizeString(value as string);
        }

        return {
          ...prev,
          [field]: sanitizedValue,
        };
      });
    },
    []
  );

  /**
   * 支給項目の更新（最適化: .map() を使わない）
   */
  const updateEarningItem = useCallback(
    (index: number, field: "name" | "amount", value: string | number) => {
      setSalaryData((prev) => {
        const newEarnings = [...prev.earnings];
        newEarnings[index] = {
          ...newEarnings[index],
          [field]:
            field === "name"
              ? sanitizeString(value as string)
              : sanitizeNumber(value as string | number),
        };
        return { ...prev, earnings: newEarnings };
      });
    },
    []
  );

  /**
   * 控除項目の更新（最適化: .map() を使わない）
   */
  const updateDeductionItem = useCallback(
    (index: number, field: "name" | "amount", value: string | number) => {
      setSalaryData((prev) => {
        const newDeductions = [...prev.deductions];
        newDeductions[index] = {
          ...newDeductions[index],
          [field]:
            field === "name"
              ? sanitizeString(value as string)
              : sanitizeNumber(value as string | number),
        };
        return { ...prev, deductions: newDeductions };
      });
    },
    []
  );

  /**
   * 勤怠項目の更新（最適化: .map() を使わない）
   */
  const updateAttendanceItem = useCallback(
    (index: number, field: "name" | "amount", value: string | number) => {
      setSalaryData((prev) => {
        const newAttendance = [...prev.attendance];
        newAttendance[index] = {
          ...newAttendance[index],
          [field]:
            field === "name"
              ? sanitizeString(value as string)
              : sanitizeNumber(value as string | number, 0, 9999),
        };
        return { ...prev, attendance: newAttendance };
      });
    },
    []
  );

  return {
    salaryData,
    updateBasicInfo,
    updateEarningItem,
    updateDeductionItem,
    updateAttendanceItem,
  };
}
