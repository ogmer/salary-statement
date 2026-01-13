/**
 * PDF エクスポートボタンコンポーネント（遅延ロード）
 * 初期バンドルから 449KB (html2canvas) を削減
 */

"use client";

import React, { useState } from "react";
import type { SalaryData } from "@/app/lib/types";

interface PDFExportButtonProps {
  salaryData: SalaryData;
}

export default function PDFExportButton({ salaryData }: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      // PDF エクスポート機能を動的にインポート（遅延ロード）
      const { exportSalaryToPDF } = await import("@/app/lib/pdfExport");
      await exportSalaryToPDF(salaryData);
    } catch (error) {
      console.error("PDF エクスポート失敗:", error);
      alert("PDF エクスポートに失敗しました。");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base font-medium shadow-md hover:shadow-lg whitespace-nowrap"
    >
      {isExporting ? "PDF生成中..." : "PDFでダウンロード"}
    </button>
  );
}
