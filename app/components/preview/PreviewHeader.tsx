"use client";

import { memo } from "react";
import type { SalaryData } from "@/app/lib/types";

interface PreviewHeaderProps {
  salaryData: SalaryData;
}

const PreviewHeader = memo(function PreviewHeader({
  salaryData,
}: PreviewHeaderProps) {
  return (
    <div className="mb-4">
      {/* 1行目: 会社名 | 給与明細書 | 社員番号 */}
      <div className="grid grid-cols-3 gap-0 mb-2">
        <div>
          <p className="text-gray-800">
            会社名: {salaryData.companyName || ""}
          </p>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-800">給与明細書</h1>
        </div>
        <div>
          <p
            className="text-gray-800"
            style={{ textAlign: "left", paddingLeft: "10%" }}
          >
            社員番号: {salaryData.employeeNumber || ""}
          </p>
        </div>
      </div>

      {/* 2行目: 部署名 | 年月 | 氏名 */}
      <div className="grid grid-cols-3 gap-0">
        <div>
          <p className="text-gray-800">
            部署名: {salaryData.departmentName || ""}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xl font-medium text-blue-600">
            {salaryData.year}年 {salaryData.month}月分
          </p>
        </div>
        <div>
          <p
            className="text-gray-800"
            style={{ textAlign: "left", paddingLeft: "10%" }}
          >
            氏名: {salaryData.employeeName || ""}
          </p>
        </div>
      </div>
    </div>
  );
});

export default PreviewHeader;
