"use client";

import { memo } from "react";
import type { SalaryItem, Totals } from "@/app/lib/types";

interface EarningsTableProps {
  earnings: SalaryItem[];
  totals: Totals;
}

const EarningsTable = memo(function EarningsTable({
  earnings,
  totals,
}: EarningsTableProps) {
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
              {earnings[0]?.name || ""}
            </th>
            <th
              className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              {earnings[1]?.name || ""}
            </th>
            <th
              className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              {earnings[2]?.name || ""}
            </th>
            <th
              className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              {earnings[3]?.name || ""}
            </th>
            <th
              className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              {earnings[4]?.name || ""}
            </th>
            <th
              className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "17%" }}
            >
              {earnings[5]?.name || ""}
            </th>
          </tr>
          {/* 2行目: 金額表示 */}
          <tr>
            <td
              className="border-l border-r border-blue-400 px-2 py-2 text-center text-blue-800 bg-blue-200 font-bold text-bottom"
              style={{ width: "8%" }}
            >
              支
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              {earnings[0]?.amount && earnings[0].amount > 0
                ? earnings[0].amount.toLocaleString()
                : "\u00A0"}
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              {earnings[1]?.amount && earnings[1].amount > 0
                ? earnings[1].amount.toLocaleString()
                : "\u00A0"}
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              {earnings[2]?.amount && earnings[2].amount > 0
                ? earnings[2].amount.toLocaleString()
                : "\u00A0"}
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              {earnings[3]?.amount && earnings[3].amount > 0
                ? earnings[3].amount.toLocaleString()
                : "\u00A0"}
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              {earnings[4]?.amount && earnings[4].amount > 0
                ? earnings[4].amount.toLocaleString()
                : "\u00A0"}
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "17%" }}
            >
              {earnings[5]?.amount && earnings[5].amount > 0
                ? earnings[5].amount.toLocaleString()
                : "\u00A0"}
            </td>
          </tr>
          {/* 3行目: その他手当の項目名 */}
          <tr className="bg-blue-100">
            <td
              className="border-l border-r border-blue-400 px-2 py-2 text-center text-blue-800 bg-blue-200 font-bold text-top"
              style={{ width: "8%" }}
            >
              給
            </td>
            <th
              className="border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              {earnings[6]?.name || ""}
            </th>
            <th
              className="border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              {earnings[7]?.name || ""}
            </th>
            <th
              className="border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
              style={{ width: "15%" }}
            >
              {earnings[8]?.name || ""}
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
              支給額合計
            </th>
          </tr>
          {/* 4行目: その他手当の金額 */}
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
              {earnings[6]?.amount && earnings[6].amount > 0
                ? earnings[6].amount.toLocaleString()
                : "\u00A0"}
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              {earnings[7]?.amount && earnings[7].amount > 0
                ? earnings[7].amount.toLocaleString()
                : "\u00A0"}
            </td>
            <td
              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
              style={{ width: "15%" }}
            >
              {earnings[8]?.amount && earnings[8].amount > 0
                ? earnings[8].amount.toLocaleString()
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
              {totals.totalEarnings.toLocaleString()}
            </td>
          </tr>
        </thead>
      </table>
    </div>
  );
});

export default EarningsTable;
