"use client";

import { useState } from "react";
import Link from "next/link";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface SalaryItem {
  name: string;
  amount: number;
}

interface SalaryData {
  companyName: string;
  employeeNumber: string;
  employeeName: string;
  year: number;
  month: number;
  workStartYear: number;
  workStartMonth: number;
  workStartDay: number;
  workEndYear: number;
  workEndMonth: number;
  workEndDay: number;
  workDays: number;
  workHours: number;
  overtimeHours: number;
  earnings: SalaryItem[];
  deductions: SalaryItem[];
}

export default function Home() {
  const [salaryData, setSalaryData] = useState<SalaryData>({
    companyName: "",
    employeeNumber: "",
    employeeName: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    workStartYear: new Date().getFullYear(),
    workStartMonth: new Date().getMonth() + 1,
    workStartDay: 1,
    workEndYear: new Date().getFullYear(),
    workEndMonth: new Date().getMonth() + 1,
    workEndDay: 31,
    workDays: 22,
    workHours: 176,
    overtimeHours: 0,
    earnings: [
      { name: "基本給", amount: 0 },
      { name: "通勤手当", amount: 0 },
      { name: "住宅手当", amount: 0 },
      { name: "残業手当", amount: 0 },
      { name: "その他手当1", amount: 0 },
      { name: "その他手当2", amount: 0 },
    ],
    deductions: [
      { name: "健康保険", amount: 0 },
      { name: "厚生年金", amount: 0 },
      { name: "雇用保険", amount: 0 },
      { name: "所得税", amount: 0 },
      { name: "住民税", amount: 0 },
      { name: "その他控除", amount: 0 },
    ],
  });

  // 計算処理
  const calculateTotals = () => {
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
  };

  const totals = calculateTotals();

  // 項目追加・削除機能
  const addEarningItem = () => {
    setSalaryData((prev) => ({
      ...prev,
      earnings: [...prev.earnings, { name: "", amount: 0 }],
    }));
  };

  const addDeductionItem = () => {
    setSalaryData((prev) => ({
      ...prev,
      deductions: [...prev.deductions, { name: "", amount: 0 }],
    }));
  };

  const updateEarningItem = (
    index: number,
    field: "name" | "amount",
    value: string | number
  ) => {
    setSalaryData((prev) => ({
      ...prev,
      earnings: prev.earnings.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updateDeductionItem = (
    index: number,
    field: "name" | "amount",
    value: string | number
  ) => {
    setSalaryData((prev) => ({
      ...prev,
      deductions: prev.deductions.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  // PDF出力機能
  const exportToPDF = async () => {
    try {
      const element = document.getElementById("salary-statement");
      if (!element) {
        alert("給与明細が見つかりません。");
        return;
      }

      // html2canvasで要素をキャプチャ
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      // A4サイズの設定
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;

      // 画像のサイズを計算
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // 1ページに収まる場合
      if (imgHeight <= contentHeight) {
        pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      } else {
        // 複数ページに分割
        let yPosition = margin;
        let remainingHeight = imgHeight;

        while (remainingHeight > 0) {
          const currentPageHeight = Math.min(contentHeight, remainingHeight);
          const sourceY = imgHeight - remainingHeight;
          const sourceHeight = currentPageHeight;

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

      // ファイル名を生成
      const fileName = `給与明細_${salaryData.companyName || "会社"}_${
        salaryData.employeeNumber || "社員番号"
      }_${salaryData.employeeName || "氏名"}_${salaryData.year}年${
        salaryData.month
      }月.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error("PDF出力エラー:", error);
      alert("PDF出力中にエラーが発生しました。");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 text-center">
            給与明細サイト
          </h1>
        </div>

        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          給与明細作成ツール
        </h1>

        {/* 入力フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            給与明細入力フォーム
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左列: 基本情報と支給項目 */}
            <div className="space-y-6">
              {/* 基本情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">基本情報</h3>
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
                      onChange={(e) =>
                        setSalaryData((prev) => ({
                          ...prev,
                          companyName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="会社名を入力"
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
                      onChange={(e) =>
                        setSalaryData((prev) => ({
                          ...prev,
                          employeeNumber: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      onChange={(e) =>
                        setSalaryData((prev) => ({
                          ...prev,
                          employeeName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="従業員名を入力"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
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
                        onChange={(e) =>
                          setSalaryData((prev) => ({
                            ...prev,
                            year: parseInt(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from({ length: 11 }, (_, i) => 2020 + i).map(
                          (year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          )
                        )}
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
                        onChange={(e) =>
                          setSalaryData((prev) => ({
                            ...prev,
                            month: parseInt(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </div>

              {/* 支給項目 */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-700">
                    支給項目
                  </h3>
                  <button
                    onClick={addEarningItem}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    + 追加
                  </button>
                </div>
                <div className="space-y-3">
                  {salaryData.earnings.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateEarningItem(index, "name", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="項目名"
                      />
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) =>
                          updateEarningItem(
                            index,
                            "amount",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 右列: 労働期間と控除項目 */}
            <div className="space-y-6">
              {/* 労働期間 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">労働期間</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label
                      htmlFor="work-start-year"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      開始年
                    </label>
                    <select
                      id="work-start-year"
                      value={salaryData.workStartYear}
                      onChange={(e) =>
                        setSalaryData((prev) => ({
                          ...prev,
                          workStartYear: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 11 }, (_, i) => 2020 + i).map(
                        (year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="work-start-month"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      月
                    </label>
                    <select
                      id="work-start-month"
                      value={salaryData.workStartMonth}
                      onChange={(e) =>
                        setSalaryData((prev) => ({
                          ...prev,
                          workStartMonth: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <div>
                    <label
                      htmlFor="work-start-day"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      日
                    </label>
                    <select
                      id="work-start-day"
                      value={salaryData.workStartDay}
                      onChange={(e) =>
                        setSalaryData((prev) => ({
                          ...prev,
                          workStartDay: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(
                        (day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="work-days"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      労働日数
                    </label>
                    <input
                      id="work-days"
                      type="number"
                      value={salaryData.workDays}
                      onChange={(e) =>
                        setSalaryData((prev) => ({
                          ...prev,
                          workDays: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="work-hours"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      労働時間
                    </label>
                    <input
                      id="work-hours"
                      type="number"
                      value={salaryData.workHours}
                      onChange={(e) =>
                        setSalaryData((prev) => ({
                          ...prev,
                          workHours: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="overtime-hours"
                    className="block text-sm font-medium text-gray-600 mb-1"
                  >
                    所定時間外労働
                  </label>
                  <input
                    id="overtime-hours"
                    type="number"
                    value={salaryData.overtimeHours}
                    onChange={(e) =>
                      setSalaryData((prev) => ({
                        ...prev,
                        overtimeHours: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {/* 控除項目 */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-700">
                    控除項目
                  </h3>
                  <button
                    onClick={addDeductionItem}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    + 追加
                  </button>
                </div>
                <div className="space-y-3">
                  {salaryData.deductions.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateDeductionItem(index, "name", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="項目名"
                      />
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) =>
                          updateDeductionItem(
                            index,
                            "amount",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 給与明細プレビュー */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              給与明細プレビュー
            </h2>
            <button
              onClick={exportToPDF}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              PDFでダウンロード
            </button>
          </div>

          <div id="salary-statement" className="bg-white p-8">
            {/* 給与明細の内容 */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-blue-800 mb-2">
                給与明細書
              </h1>
              <p className="text-lg text-blue-600">
                {salaryData.year}年 {salaryData.month}月分
              </p>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-lg font-medium text-blue-800">
                    会社名: {salaryData.companyName || ""}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-medium text-blue-800">
                    社員番号: {salaryData.employeeNumber || ""}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-medium text-blue-800">
                    氏名: {salaryData.employeeName || ""}
                  </p>
                </div>
              </div>
            </div>

            {/* 支給額テーブル */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-blue-800 mb-4">支給</h3>
              <table className="w-full border-collapse border border-blue-400">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                      基本給
                    </th>
                    <th className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                      〇〇手当
                    </th>
                    <th className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                      〇〇手当
                    </th>
                    <th className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                      〇〇手当
                    </th>
                    <th className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                      〇〇手当
                    </th>
                    <th className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                      〇〇手当
                    </th>
                    <th className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                      総支給額
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.earnings[0]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.earnings[1]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.earnings[2]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.earnings[3]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.earnings[4]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.earnings[5]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                      〇〇手当
                    </td>
                  </tr>
                  {/* 2行目: 追加項目の名前 */}
                  <tr>
                    <td className="border border-blue-400 px-4 py-2 text-left text-blue-800 bg-blue-50">
                      {salaryData.earnings[6]?.name || ""}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-left text-blue-800 bg-blue-50">
                      {salaryData.earnings[7]?.name || ""}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-left text-blue-800 bg-blue-50">
                      {salaryData.earnings[8]?.name || ""}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-left text-blue-800 bg-blue-50">
                      {salaryData.earnings[9]?.name || ""}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-left text-blue-800 bg-blue-50">
                      {salaryData.earnings[10]?.name || ""}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-left text-blue-800 bg-blue-50">
                      {salaryData.earnings[11]?.name || ""}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-left text-blue-800 bg-blue-50">
                      総支給額
                    </td>
                  </tr>
                  {/* 3行目: 追加項目の金額 */}
                  <tr>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.earnings[6]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.earnings[7]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.earnings[8]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.earnings[9]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.earnings[10]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.earnings[11]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      &nbsp;
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 控除額テーブル */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-blue-800 mb-4">控除</h3>
              <table className="w-full border-collapse border border-blue-400">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                      健康保険
                    </th>
                    <th className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                      厚生年金
                    </th>
                    <th className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                      雇用保険
                    </th>
                    <th className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                      所得税
                    </th>
                    <th className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                      住民税
                    </th>
                    <th className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                      その他控除
                    </th>
                    <th className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                      控除額合計
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.deductions[0]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.deductions[1]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.deductions[2]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.deductions[3]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.deductions[4]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.deductions[5]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                      控除額合計
                    </td>
                  </tr>
                  {/* 3行目: 追加項目の名前 */}
                  <tr>
                    <td className="border border-blue-400 px-4 py-2 text-left text-blue-800 bg-blue-50">
                      {salaryData.deductions[6]?.name || ""}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-left text-blue-800 bg-blue-50">
                      {salaryData.deductions[7]?.name || ""}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-left text-blue-800 bg-blue-50">
                      {salaryData.deductions[8]?.name || ""}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-left text-blue-800 bg-blue-50">
                      {salaryData.deductions[9]?.name || ""}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-left text-blue-800 bg-blue-50">
                      {salaryData.deductions[10]?.name || ""}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-left text-blue-800 bg-blue-50">
                      {salaryData.deductions[11]?.name || ""}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-left text-blue-800 bg-blue-50">
                      控除額合計
                    </td>
                  </tr>
                  {/* 4行目: 追加項目の金額 */}
                  <tr>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.deductions[6]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.deductions[7]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.deductions[8]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.deductions[9]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.deductions[10]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      {salaryData.deductions[11]?.amount.toLocaleString() || 0}
                    </td>
                    <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                      &nbsp;
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 勤怠・差引支給額 */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-blue-800 mb-4">勤怠</h3>
                <table className="w-full border-collapse border border-blue-400">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                        出勤日数
                      </th>
                      <th className="border border-blue-400 px-4 py-2 text-left text-blue-800">
                        残業時間
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                        {salaryData.workDays}
                      </td>
                      <td className="border border-blue-400 px-4 py-2 text-right text-blue-800">
                        {salaryData.overtimeHours}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-lg font-bold text-blue-800 mb-4">
                  差引支給額
                </h3>
                <div className="border-2 border-blue-400 p-4 text-center bg-blue-50">
                  <p className="text-2xl font-bold text-blue-800">
                    {totals.netPay.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
