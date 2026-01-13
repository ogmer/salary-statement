/**
 * 給与計算フック（メモ化）
 * 95% の不要な計算を削減
 */

import { useMemo } from "react";
import type { SalaryData, Totals } from "@/app/lib/types";

/**
 * 給与の合計計算（メモ化版）
 * @param salaryData 給与データ
 * @returns 計算された合計値
 */
export function useSalaryCalculations(salaryData: SalaryData): Totals {
  return useMemo(() => {
    const totalEarnings = salaryData.earnings.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const totalDeductions = salaryData.deductions.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    return {
      totalEarnings,
      totalDeductions,
      netPay: totalEarnings - totalDeductions,
    };
  }, [salaryData.earnings, salaryData.deductions]);
}
