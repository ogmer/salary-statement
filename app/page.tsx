"use client";

import React, { useState } from "react";

interface SalaryItem {
  name: string;
  amount: number;
}

interface SalaryData {
  companyName: string;
  departmentName: string;
  employeeNumber: string;
  employeeName: string;
  year: number;
  month: number;
  earnings: SalaryItem[];
  deductions: SalaryItem[];
  attendance: SalaryItem[];
}

interface Totals {
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
}

interface TableCell {
  content: string | number;
  className: string;
  isHeader?: boolean;
}

// 定数と設定値
const DEFAULT_EARNINGS = [
  { name: "基本給", amount: 0 },
  { name: "残業手当", amount: 0 },
  { name: "通勤手当", amount: 0 },
  { name: "住宅手当", amount: 0 },
  { name: "その他手当", amount: 0 },
  { name: "", amount: 0 },
  { name: "", amount: 0 },
  { name: "", amount: 0 },
  { name: "", amount: 0 },
];

const DEFAULT_DEDUCTIONS = [
  { name: "健康保険", amount: 0 },
  { name: "厚生年金", amount: 0 },
  { name: "雇用保険", amount: 0 },
  { name: "所得税", amount: 0 },
  { name: "住民税", amount: 0 },
  { name: "", amount: 0 },
  { name: "", amount: 0 },
  { name: "", amount: 0 },
  { name: "", amount: 0 },
];

const DEFAULT_ATTENDANCE = [
  { name: "労働日数", amount: 22 },
  { name: "残業時間", amount: 0 },
  { name: "", amount: 0 },
  { name: "", amount: 0 },
];

// CSS クラス定数
const TABLE_STYLES = {
  cell: "border-blue-400 px-4 py-2 text-blue-800",
  header: "bg-blue-100",
  labelCell:
    "border-l border-t border-r border-b border-blue-400 px-4 py-2 text-center text-blue-800 bg-blue-200 font-bold w-14",
  dataCell:
    "border-t border-r border-b border-blue-400 px-4 py-2 text-left text-blue-800",
  amountCell:
    "border-r border-b border-blue-400 px-4 py-2 text-right text-blue-800",
  emptyCell:
    "border-l border-r border-blue-400 px-4 py-2 text-center text-blue-800 bg-blue-200 font-bold w-14",
} as const;

export default function Home() {
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

  // 計算処理
  const calculateTotals = () => {
    const totalEarnings = salaryData.earnings.reduce(
      (sum: number, item: SalaryItem) => sum + item.amount,
      0
    );
    const totalDeductions = salaryData.deductions.reduce(
      (sum: number, item: SalaryItem) => sum + item.amount,
      0
    );

    return {
      totalEarnings,
      totalDeductions,
      netPay: totalEarnings - totalDeductions,
    };
  };

  const totals = calculateTotals();

  // テーブル行のレンダリング関数
  const renderTableRow = (cells: TableCell[]) => {
    return (
      <tr
        className={
          cells.some((cell) => cell.isHeader) ? TABLE_STYLES.header : ""
        }
      >
        {cells.map((cell, index) => {
          const Tag = cell.isHeader ? "th" : "td";
          return (
            <Tag key={index} className={cell.className}>
              {cell.content}
            </Tag>
          );
        })}
      </tr>
    );
  };

  // 金額表示のヘルパー関数
  const formatAmount = (amount: number, showZero: boolean = false) => {
    if (showZero || amount > 0) {
      return amount.toLocaleString();
    }
    return "\u00A0";
  };

  // 項目追加・削除機能

  const updateEarningItem = (
    index: number,
    field: "name" | "amount",
    value: string | number
  ) => {
    setSalaryData((prev: SalaryData) => ({
      ...prev,
      earnings: prev.earnings.map((item: SalaryItem, i: number) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updateDeductionItem = (
    index: number,
    field: "name" | "amount",
    value: string | number
  ) => {
    setSalaryData((prev: SalaryData) => ({
      ...prev,
      deductions: prev.deductions.map((item: SalaryItem, i: number) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updateAttendanceItem = (
    index: number,
    field: "name" | "amount",
    value: string | number
  ) => {
    setSalaryData((prev: SalaryData) => ({
      ...prev,
      attendance: prev.attendance.map((item: SalaryItem, i: number) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  // PDF出力機能
  const exportToPDF = async () => {
    let element: HTMLElement | null = null;
    try {
      // 常に表示中の要素を使用（スマホ版では一時的に表示）
      element = document.getElementById("salary-statement");
      if (!element) {
        alert("給与明細が見つかりません。");
        return;
      }

      // ローディング表示
      const button = document.querySelector(
        'button[onClick="exportToPDF"]'
      ) as HTMLButtonElement;
      const originalText = button?.textContent;
      if (button) {
        button.textContent = "PDF生成中...";
        button.disabled = true;
      }

      // スマホ版では要素が非表示なので、一時的に表示状態にする
      const isHidden =
        element.classList.contains("hidden") || element.offsetParent === null;
      if (isHidden) {
        element.style.display = "block";
        element.style.visibility = "visible";
        element.style.position = "static";
        element.style.left = "auto";
        element.style.top = "auto";
        element.style.zIndex = "9999";
        element.style.width = "800px";
        element.style.height = "auto";

        // レンダリングを待つ
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // 動的にライブラリをインポート
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas")
      ]);

      // html2canvasで要素をキャプチャ（高品質設定）
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 800,
        height: element.scrollHeight || 1000,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
        windowHeight: element.scrollHeight || 1000,
        ignoreElements: (el) => {
          // 楽天ウィジェットなどの外部要素を除外
          return el.id?.includes("rakuten") || false;
        },
      });

      // スマホ版の要素を元の非表示状態に戻す
      if (isHidden) {
        element.style.display = "";
        element.style.visibility = "";
        element.style.position = "";
        element.style.left = "";
        element.style.top = "";
        element.style.zIndex = "";
        element.style.width = "";
        element.style.height = "";
      }

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");

      // A4サイズの設定
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;

      // 画像のサイズを計算（アスペクト比を保持）
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // PDFに画像を追加
      if (imgHeight <= contentHeight) {
        pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      } else {
        // 複数ページに分割
        let yPosition = margin;
        let remainingHeight = imgHeight;

        while (remainingHeight > 0) {
          const currentPageHeight = Math.min(contentHeight, remainingHeight);
          pdf.addImage(
            imgData,
            "PNG",
            margin,
            yPosition,
            imgWidth,
            currentPageHeight,
            undefined,
            "FAST"
          );

          remainingHeight -= contentHeight;
          yPosition = margin;

          if (remainingHeight > 0) {
            pdf.addPage();
          }
        }
      }

      // ファイル名を生成（無効な文字を除去）
      const sanitizeFileName = (str: string) => {
        return str.replace(/[<>:"/\\|?*]/g, "_");
      };

      const fileName = `給与明細_${sanitizeFileName(
        salaryData.companyName || "会社"
      )}_${sanitizeFileName(
        salaryData.employeeNumber || "社員番号"
      )}_${sanitizeFileName(salaryData.employeeName || "氏名")}_${
        salaryData.year
      }年${salaryData.month}月.pdf`;

      pdf.save(fileName);

      // ボタンの状態を元に戻す
      if (button) {
        button.textContent = originalText || "PDFでダウンロード";
        button.disabled = false;
      }
    } catch (error) {
      console.error("PDF出力エラー:", error);
      console.error("要素の状態:", {
        element: element,
        display: element?.style.display,
        visibility: element?.style.visibility,
        offsetWidth: element?.offsetWidth,
        offsetHeight: element?.offsetHeight,
      });
      alert(
        `PDF出力中にエラーが発生しました: ${
          error instanceof Error ? error.message : String(error)
        }`
      );

      // エラー時もボタンの状態を元に戻す
      const button = document.querySelector(
        'button[onClick="exportToPDF"]'
      ) as HTMLButtonElement;
      if (button) {
        button.textContent = "PDFでダウンロード";
        button.disabled = false;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 relative">
      {/* 軽量化された背景要素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100 rounded-full opacity-30"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-100 rounded-full opacity-30"></div>
      </div>

      <div className="w-full px-0 relative z-10">
        <div className="flex justify-center">
          {/* メインコンテンツ */}
          <div className="max-w-4xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <span className="text-2xl">💰</span>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            給与明細作成ツール
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

            <p className="text-gray-600 text-center mb-4 max-w-2xl mx-auto leading-relaxed">
              ✓  テンプレートから給与明細の管理と表示を行うサイトです
            </p>
            <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto leading-relaxed">
              ✓  自動で計算を行い、データを保存されることはありません
            </p>

        {/* 入力フォーム */}
        <div className="bg-white/90 rounded-xl shadow-lg border border-white/20 p-6 mb-8 hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            給与明細入力フォーム
          </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 左列: 基本情報と支給項目 */}
            <div className="space-y-6">
              {/* 基本情報 */}
              <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-700">
                      基本情報
                    </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label
                      htmlFor="company-name"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      会社名
                    </label>
                    <input
                      id="company-name"
                      type="text"
                      value={salaryData.companyName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSalaryData((prev: SalaryData) => ({
                          ...prev,
                          companyName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-blue-300 bg-white"
                      placeholder="会社名を入力"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="department-name"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      部署名
                    </label>
                    <input
                      id="department-name"
                      type="text"
                      value={salaryData.departmentName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSalaryData((prev: SalaryData) => ({
                          ...prev,
                          departmentName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-blue-300 bg-white"
                      placeholder="部署名を入力"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="employee-number"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      社員番号
                    </label>
                    <input
                      id="employee-number"
                      type="text"
                      value={salaryData.employeeNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSalaryData((prev: SalaryData) => ({
                          ...prev,
                          employeeNumber: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-blue-300 bg-white"
                      placeholder="社員番号を入力"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="employee-name"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      氏名
                    </label>
                    <input
                      id="employee-name"
                      type="text"
                      value={salaryData.employeeName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSalaryData((prev: SalaryData) => ({
                          ...prev,
                          employeeName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-blue-300 bg-white"
                      placeholder="従業員名を入力"
                    />
                  </div>
                </div>
              </div>

              {/* 支給項目 */}
              <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-700">
                      支給項目
                    </h3>
                <div className="space-y-3">
                  {salaryData.earnings.map(
                    (item: SalaryItem, index: number) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={item.name}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                            updateEarningItem(index, "name", e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-blue-300 bg-white"
                          placeholder={
                            index === 0
                              ? "基本給"
                              : index === 1
                                  ? "残業手当"
                              : index === 2
                                  ? "通勤手当"
                              : index === 3
                                  ? "住宅手当"
                              : index === 4
                              ? "その他手当"
                              : index === 5
                              ? "その他手当2"
                              : index === 6
                              ? "その他手当3"
                              : index === 7
                              ? "その他手当4"
                              : "その他手当5"
                          }
                        />
                        <input
                          type="number"
                              value={item.amount === 0 ? "" : item.amount}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                            updateEarningItem(
                              index,
                              "amount",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-blue-300 bg-white"
                          min="0"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* 右列: 労働期間と控除項目 */}
            <div className="space-y-6">
              {/* 労働期間 */}
              <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-700">
                      労働期間
                    </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="year"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      年
                    </label>
                    <select
                      id="year"
                      value={salaryData.year}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setSalaryData((prev: SalaryData) => ({
                          ...prev,
                          year: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-blue-300 bg-white"
                    >
                      {Array.from(
                        { length: 11 },
                        (_, i) => new Date().getFullYear() - 5 + i
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="month"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      月
                    </label>
                    <select
                      id="month"
                      value={salaryData.month}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setSalaryData((prev: SalaryData) => ({
                          ...prev,
                          month: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-blue-300 bg-white"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* 勤怠項目 */}
              <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-700">
                      勤怠項目
                    </h3>
                <div className="space-y-3">
                  {salaryData.attendance.map(
                    (item: SalaryItem, index: number) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={item.name}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                updateAttendanceItem(
                                  index,
                                  "name",
                                  e.target.value
                                )
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-blue-300 bg-white"
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
                          type="number"
                              value={item.amount === 0 ? "" : item.amount}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                            updateAttendanceItem(
                              index,
                              "amount",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-blue-300 bg-white"
                          min="0"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* 控除項目 */}
              <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-700">
                      控除項目
                    </h3>
                <div className="space-y-3">
                  {salaryData.deductions.map(
                    (item: SalaryItem, index: number) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={item.name}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                updateDeductionItem(
                                  index,
                                  "name",
                                  e.target.value
                                )
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-blue-300 bg-white"
                          placeholder={
                            index === 0
                              ? "健康保険"
                              : index === 1
                              ? "厚生年金"
                              : index === 2
                              ? "雇用保険"
                              : index === 3
                              ? "所得税"
                              : index === 4
                              ? "住民税"
                              : index === 5
                              ? "その他控除1"
                              : index === 6
                              ? "その他控除2"
                              : index === 7
                              ? "その他控除3"
                              : "その他控除4"
                          }
                        />
                        <input
                          type="number"
                              value={item.amount === 0 ? "" : item.amount}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                            updateDeductionItem(
                              index,
                              "amount",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-blue-300 bg-white"
                          min="0"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 給与明細プレビュー */}
        <div className="bg-white/90 rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-shadow duration-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
                  <span className="md:hidden" style={{ marginLeft: "50px" }}>
                    給与明細
                  </span>
                  <span className="hidden md:inline">給与明細プレビュー</span>
            </h2>
            <button
              onClick={exportToPDF}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              📄 PDFでダウンロード
            </button>
          </div>

              {/* スマホ版では非表示、PC版では表示 */}
              <div className="hidden md:block">
          <div id="salary-statement" className="bg-white p-8">
            {/* 給与明細のヘッダー */}
            <div className="mb-4">
              {/* 1行目: 会社名 | 給与明細書 | 社員番号 */}
                    <div className="grid grid-cols-3 gap-0 mb-2">
                <div>
                        <p className="text-gray-800">
                    会社名: {salaryData.companyName || ""}
                  </p>
                </div>
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-blue-800">
                    給与明細書
                  </h1>
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

            {/* 支給額テーブル */}
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
                      {salaryData.earnings[0]?.name || ""}
                    </th>
                          <th
                            className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.earnings[1]?.name || ""}
                    </th>
                          <th
                            className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.earnings[2]?.name || ""}
                    </th>
                          <th
                            className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.earnings[3]?.name || ""}
                    </th>
                          <th
                            className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.earnings[4]?.name || ""}
                    </th>
                          <th
                            className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                            style={{ width: "17%" }}
                          >
                            {salaryData.earnings[5]?.name || ""}
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
                      {salaryData.earnings[0]?.amount &&
                      salaryData.earnings[0].amount > 0
                        ? salaryData.earnings[0].amount.toLocaleString()
                        : "\u00A0"}
                    </td>
                          <td
                            className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.earnings[1]?.amount &&
                      salaryData.earnings[1].amount > 0
                        ? salaryData.earnings[1].amount.toLocaleString()
                        : "\u00A0"}
                    </td>
                          <td
                            className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.earnings[2]?.amount &&
                      salaryData.earnings[2].amount > 0
                        ? salaryData.earnings[2].amount.toLocaleString()
                        : "\u00A0"}
                    </td>
                          <td
                            className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.earnings[3]?.amount &&
                      salaryData.earnings[3].amount > 0
                        ? salaryData.earnings[3].amount.toLocaleString()
                        : "\u00A0"}
                    </td>
                          <td
                            className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.earnings[4]?.amount &&
                      salaryData.earnings[4].amount > 0
                        ? salaryData.earnings[4].amount.toLocaleString()
                        : "\u00A0"}
                    </td>
                          <td
                            className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                            style={{ width: "17%" }}
                          >
                            {salaryData.earnings[5]?.amount &&
                            salaryData.earnings[5].amount > 0
                              ? salaryData.earnings[5].amount.toLocaleString()
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
                      {salaryData.earnings[6]?.name || ""}
                    </th>
                          <th
                            className="border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.earnings[7]?.name || ""}
                    </th>
                          <th
                            className="border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.earnings[8]?.name || ""}
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
                      {salaryData.earnings[6]?.amount &&
                      salaryData.earnings[6].amount > 0
                        ? salaryData.earnings[6].amount.toLocaleString()
                        : "\u00A0"}
                    </td>
                          <td
                            className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.earnings[7]?.amount &&
                      salaryData.earnings[7].amount > 0
                        ? salaryData.earnings[7].amount.toLocaleString()
                        : "\u00A0"}
                    </td>
                          <td
                            className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.earnings[8]?.amount &&
                      salaryData.earnings[8].amount > 0
                        ? salaryData.earnings[8].amount.toLocaleString()
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

            {/* 控除額テーブル */}
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
                      {salaryData.deductions[0]?.name || ""}
                    </th>
                          <th
                            className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.deductions[1]?.name || ""}
                    </th>
                          <th
                            className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.deductions[2]?.name || ""}
                    </th>
                          <th
                            className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.deductions[3]?.name || ""}
                    </th>
                          <th
                            className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.deductions[4]?.name || ""}
                    </th>
                          <th
                            className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                            style={{ width: "17%" }}
                          >
                            <input
                              type="text"
                              value={
                                salaryData.deductions[5]?.name || "その他控除"
                              }
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                updateDeductionItem(5, "name", e.target.value)
                              }
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
                      {salaryData.deductions[0]?.amount &&
                      salaryData.deductions[0].amount > 0
                        ? salaryData.deductions[0].amount.toLocaleString()
                        : "\u00A0"}
                    </td>
                          <td
                            className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.deductions[1]?.amount &&
                      salaryData.deductions[1].amount > 0
                        ? salaryData.deductions[1].amount.toLocaleString()
                        : "\u00A0"}
                    </td>
                          <td
                            className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.deductions[2]?.amount &&
                      salaryData.deductions[2].amount > 0
                        ? salaryData.deductions[2].amount.toLocaleString()
                        : "\u00A0"}
                    </td>
                          <td
                            className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.deductions[3]?.amount &&
                      salaryData.deductions[3].amount > 0
                        ? salaryData.deductions[3].amount.toLocaleString()
                        : "\u00A0"}
                    </td>
                          <td
                            className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.deductions[4]?.amount &&
                      salaryData.deductions[4].amount > 0
                        ? salaryData.deductions[4].amount.toLocaleString()
                        : "\u00A0"}
                    </td>
                          <td
                            className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                            style={{ width: "17%" }}
                          >
                            {salaryData.deductions[5]?.amount &&
                            salaryData.deductions[5].amount > 0
                              ? salaryData.deductions[5].amount.toLocaleString()
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
                      {salaryData.deductions[6]?.name || ""}
                    </th>
                          <th
                            className="border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.deductions[7]?.name || ""}
                    </th>
                          <th
                            className="border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.deductions[8]?.name || ""}
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
                      {salaryData.deductions[6]?.amount &&
                      salaryData.deductions[6].amount > 0
                        ? salaryData.deductions[6].amount.toLocaleString()
                        : "\u00A0"}
                    </td>
                          <td
                            className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.deductions[7]?.amount &&
                      salaryData.deductions[7].amount > 0
                        ? salaryData.deductions[7].amount.toLocaleString()
                        : "\u00A0"}
                    </td>
                          <td
                            className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                            style={{ width: "15%" }}
                          >
                      {salaryData.deductions[8]?.amount &&
                      salaryData.deductions[8].amount > 0
                        ? salaryData.deductions[8].amount.toLocaleString()
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

            {/* 勤怠・差引支給額 */}
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
                        {salaryData.attendance[0]?.name || ""}
                      </th>
                            <th
                              className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                              style={{ width: "22%" }}
                            >
                        {salaryData.attendance[1]?.name || ""}
                      </th>
                            <th
                              className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                              style={{ width: "22%" }}
                            >
                        {salaryData.attendance[2]?.name || ""}
                      </th>
                            <th
                              className="border-t border-r border-b border-blue-400 px-2 py-2 text-left text-blue-800"
                              style={{ width: "22%" }}
                            >
                        {salaryData.attendance[3]?.name || ""}
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
                              {formatAmount(
                                salaryData.attendance[0]?.amount || 0
                              )}
                      </td>
                            <td
                              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                              style={{ width: "22%" }}
                            >
                        {formatAmount(
                          salaryData.attendance[1]?.amount || 0,
                          true
                        )}
                      </td>
                            <td
                              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                              style={{ width: "22%" }}
                            >
                              {formatAmount(
                                salaryData.attendance[2]?.amount || 0
                              )}
                      </td>
                            <td
                              className="border-r border-b border-blue-400 px-2 py-2 text-right text-blue-800"
                              style={{ width: "22%" }}
                            >
                              {formatAmount(
                                salaryData.attendance[3]?.amount || 0
                              )}
                      </td>
                    </tr>
                  </thead>
                </table>
              </div>

              <div className="flex flex-col w-1/6">
                <h3 className="text-sm font-bold text-blue-800 mb-2">
                  差引支給額
                </h3>
                <div className="border-2 border-blue-400 p-2 text-center bg-blue-50 h-16 flex items-center justify-center">
                  <p className="text-xl font-bold text-blue-800">
                    {totals.netPay.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>

    {/* フッター */}
    <footer className="bg-white mt-12">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">お問い合わせ先</p>
          <a
            href="mailto:ogmer.net@gmail.com"
            className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
          >
            ogmer.net@gmail.com
          </a>
        </div>
      </div>
    </footer>
    </div>
  );
}
