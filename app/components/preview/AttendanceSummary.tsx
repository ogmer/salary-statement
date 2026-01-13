"use client";

import { memo } from "react";
import type { SalaryItem, Totals } from "@/app/lib/types";

interface AttendanceSummaryProps {
  attendance: SalaryItem[];
  totals: Totals;
  formatAmount: (amount: number, showZero?: boolean) => string;
}

const AttendanceSummary = memo(function AttendanceSummary({
  attendance,
  totals,
  formatAmount,
}: AttendanceSummaryProps) {
  return (
    <div className="flex gap-8 items-start">
      <div className="w-4/5">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="bg-blue-100">
              <th
                className="border-l border-t border-r border-blue-400 px-2 py-2 text-center text-blue-800 bg-blue-200 font-bold"
                style={{ width: "10%" }}
              >
                勤
              </th>
              <th
                className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                style={{ width: "22%" }}
              >
                {attendance[0]?.name || ""}
              </th>
              <th
                className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                style={{ width: "22%" }}
              >
                {attendance[1]?.name || ""}
              </th>
              <th
                className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                style={{ width: "22%" }}
              >
                {attendance[2]?.name || ""}
              </th>
              <th
                className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                style={{ width: "22%" }}
              >
                {attendance[3]?.name || ""}
              </th>
            </tr>
            <tr>
              <td
                className="border-l border-r border-b border-blue-400 px-2 py-2 text-center text-blue-800 bg-blue-200 font-bold text-middle"
                style={{ width: "10%" }}
              >
                怠
              </td>
              <td
                className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                style={{ width: "22%" }}
              >
                {formatAmount(attendance[0]?.amount || 0)}
              </td>
              <td
                className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                style={{ width: "22%" }}
              >
                {formatAmount(attendance[1]?.amount || 0, true)}
              </td>
              <td
                className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                style={{ width: "22%" }}
              >
                {formatAmount(attendance[2]?.amount || 0)}
              </td>
              <td
                className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                style={{ width: "22%" }}
              >
                {formatAmount(attendance[3]?.amount || 0)}
              </td>
            </tr>
          </thead>
        </table>
      </div>

      <div className="flex flex-col w-1/6">
        <h3 className="text-sm font-bold text-blue-800 mb-2">差引支給額</h3>
        <div className="border-2 border-blue-400 p-2 text-center bg-blue-50 h-16 flex items-center justify-center">
          <p className="text-xl font-bold text-blue-800">
            {totals.netPay.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
});

export default AttendanceSummary;
