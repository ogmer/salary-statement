"use client";

import { memo } from "react";
import type { SalaryItem, Totals } from "@/app/lib/types";
import { MAX_STRING_LENGTH } from "@/app/lib/validation";

interface DeductionsTableProps {
  deductions: SalaryItem[];
  totals: Totals;
  onUpdateDeduction: (
    index: number,
    field: "name" | "amount",
    value: string
  ) => void;
}

const DeductionsTable = memo(function DeductionsTable({
  deductions,
  totals,
  onUpdateDeduction,
}: DeductionsTableProps) {
  return (
    <div className="mb-8">
      <table
        className="w-full border-collapse table-fixed"
        style={{ minHeight: "200px" }}
      >
        <thead>
          {/* 1行目: 項目名 */}
          <tr className="bg-blue-100">
            <th
              className="border-l border-t border-r border-blue-400 px-2 py-2 text-center text-blue-800 bg-blue-200 font-bold"
              style={{ width: "8%" }}
            >
              &nbsp;
            </th>
            <th
              className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              {deductions[0]?.name || ""}
            </th>
            <th
              className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              {deductions[1]?.name || ""}
            </th>
            <th
              className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              {deductions[2]?.name || ""}
            </th>
            <th
              className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              {deductions[3]?.name || ""}
            </th>
            <th
              className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              {deductions[4]?.name || ""}
            </th>
            <th
              className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "17%" }}
            >
              <input
                type="text"
                value={deductions[5]?.name || "その他控除"}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onUpdateDeduction(5, "name", e.target.value)
                }
                maxLength={MAX_STRING_LENGTH}
                className="w-full bg-transparent border-none outline-none text-blue-800 font-semibold"
                placeholder="その他控除"
              />
            </th>
          </tr>
          {/* 2行目: 金額表示 */}
          <tr>
            <td
              className="border-l border-r border-blue-400 px-2 py-2 text-center text-blue-800 bg-blue-200 font-bold text-bottom"
              style={{ width: "8%" }}
            >
              控
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              {deductions[0]?.amount && deductions[0].amount > 0
                ? deductions[0].amount.toLocaleString()
                : "\u00A0"}
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              {deductions[1]?.amount && deductions[1].amount > 0
                ? deductions[1].amount.toLocaleString()
                : "\u00A0"}
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              {deductions[2]?.amount && deductions[2].amount > 0
                ? deductions[2].amount.toLocaleString()
                : "\u00A0"}
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              {deductions[3]?.amount && deductions[3].amount > 0
                ? deductions[3].amount.toLocaleString()
                : "\u00A0"}
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              {deductions[4]?.amount && deductions[4].amount > 0
                ? deductions[4].amount.toLocaleString()
                : "\u00A0"}
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "17%" }}
            >
              {deductions[5]?.amount && deductions[5].amount > 0
                ? deductions[5].amount.toLocaleString()
                : "\u00A0"}
            </td>
          </tr>
          {/* 3行目: その他控除の項目名 */}
          <tr className="bg-blue-100">
            <td
              className="border-l border-r border-blue-400 px-2 py-2 text-center text-blue-800 bg-blue-200 font-bold text-top"
              style={{ width: "8%" }}
            >
              除
            </td>
            <th
              className="border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              {deductions[6]?.name || ""}
            </th>
            <th
              className="border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              {deductions[7]?.name || ""}
            </th>
            <th
              className="border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              {deductions[8]?.name || ""}
            </th>
            <th
              className="border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              &nbsp;
            </th>
            <th
              className="border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              &nbsp;
            </th>
            <th
              className="border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "17%" }}
            >
              控除額合計
            </th>
          </tr>
          {/* 4行目: その他控除の金額 */}
          <tr>
            <td
              className="border-l border-r border-b border-blue-400 px-2 py-2 text-center text-blue-800 bg-blue-200 font-bold text-middle"
              style={{ width: "8%" }}
            >
              {"\u00A0"}
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              {deductions[6]?.amount && deductions[6].amount > 0
                ? deductions[6].amount.toLocaleString()
                : "\u00A0"}
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              {deductions[7]?.amount && deductions[7].amount > 0
                ? deductions[7].amount.toLocaleString()
                : "\u00A0"}
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              {deductions[8]?.amount && deductions[8].amount > 0
                ? deductions[8].amount.toLocaleString()
                : "\u00A0"}
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              &nbsp;
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              &nbsp;
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800 font-bold"
              style={{ width: "17%" }}
            >
              {totals.totalDeductions.toLocaleString()}
            </td>
          </tr>
        </thead>
      </table>
    </div>
  );
});

export default DeductionsTable;
