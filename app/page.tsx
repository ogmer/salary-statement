"use client";

import React, { useState, useEffect } from "react";

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

// セキュリティ: 入力検証とサニタイゼーション関数
const MAX_STRING_LENGTH = 100;
const MAX_AMOUNT = 999999999;
const MIN_AMOUNT = 0;
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const MIN_MONTH = 1;
const MAX_MONTH = 12;

// XSS対策: HTMLエスケープ関数
const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
};

// 文字列入力のサニタイゼーション
// 注意: Reactは自動的にエスケープするため、ここでは制御文字の除去と長さ制限のみを行う
const sanitizeString = (
  input: string,
  maxLength: number = MAX_STRING_LENGTH
): string => {
  if (typeof input !== "string") {
    return "";
  }
  // 制御文字を除去（改行文字は許可）
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  // 長さ制限
  sanitized = sanitized.slice(0, maxLength);
  // Reactが自動的にエスケープするため、ここではエスケープしない
  return sanitized;
};

// 全角数字を半角数字に変換する関数
const convertFullWidthToHalfWidth = (str: string): string => {
  return str.replace(/[０-９]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0xFEE0);
  });
};

// 数値入力の検証とサニタイゼーション
const sanitizeNumber = (
  input: string | number,
  min: number = MIN_AMOUNT,
  max: number = MAX_AMOUNT
): number => {
  if (typeof input === "number") {
    if (isNaN(input) || !isFinite(input)) {
      return 0;
    }
    return Math.max(min, Math.min(max, Math.floor(input)));
  }

  if (typeof input !== "string") {
    return 0;
  }

  // 全角数字を半角数字に変換
  const halfWidthInput = convertFullWidthToHalfWidth(input);

  // 数値以外の文字を除去（負の符号と小数点は許可しない）
  const cleaned = halfWidthInput.replace(/[^\d]/g, "");
  if (cleaned === "") {
    return 0;
  }

  const num = parseInt(cleaned, 10);
  if (isNaN(num) || !isFinite(num)) {
    return 0;
  }

  return Math.max(min, Math.min(max, num));
};

// 年入力の検証
const sanitizeYear = (input: string | number): number => {
  const year = sanitizeNumber(input, MIN_YEAR, MAX_YEAR);
  return year;
};

// 月入力の検証
const sanitizeMonth = (input: string | number): number => {
  const month = sanitizeNumber(input, MIN_MONTH, MAX_MONTH);
  return month;
};

// ファイル名のサニタイゼーション（強化版）
const sanitizeFileName = (str: string): string => {
  if (typeof str !== "string") {
    return "unknown";
  }
  // 危険な文字を除去
  let sanitized = str.replace(/[<>:"/\\|?*\x00-\x1F\x7F]/g, "_");
  // 連続するアンダースコアを1つに
  sanitized = sanitized.replace(/_+/g, "_");
  // 先頭・末尾のアンダースコアを除去
  sanitized = sanitized.replace(/^_+|_+$/g, "");
  // 長さ制限（ファイルシステムの制限を考慮）
  sanitized = sanitized.slice(0, 100);
  // 空文字列の場合はデフォルト値を返す
  return sanitized || "unknown";
};

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

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        i === index
          ? {
              ...item,
              [field]:
                field === "name"
                  ? sanitizeString(value as string)
                  : sanitizeNumber(value as string | number),
            }
          : item
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
        i === index
          ? {
              ...item,
              [field]:
                field === "name"
                  ? sanitizeString(value as string)
                  : sanitizeNumber(value as string | number),
            }
          : item
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
        i === index
          ? {
              ...item,
              [field]:
                field === "name"
                  ? sanitizeString(value as string)
                  : sanitizeNumber(value as string | number, 0, 9999),
            }
          : item
      ),
    }));
  };

  // PDF出力機能
  const exportToPDF = async () => {
    let element: HTMLElement | null = null;
    let isMobileDevice = false;
    let originalStyles: {
      display: string;
      visibility: string;
      position: string;
      left: string;
      top: string;
      zIndex: string;
      width: string;
      height: string;
      margin: string;
      transform: string;
      marginBottom: string;
      paddingBottom: string;
    } | null = null;
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

      // スマホ版では要素が縮小表示されているので、一時的に通常サイズに戻す
      isMobileDevice = window.innerWidth < 768;
      const isHidden =
        element.classList.contains("hidden") || element.offsetParent === null;

      // 元のスタイルを保存
      originalStyles = {
        display: element.style.display,
        visibility: element.style.visibility,
        position: element.style.position,
        left: element.style.left,
        top: element.style.top,
        zIndex: element.style.zIndex,
        width: element.style.width,
        height: element.style.height,
        margin: element.style.margin,
        transform: element.style.transform,
        marginBottom: element.style.marginBottom,
        paddingBottom: element.style.paddingBottom,
      };

      // スマホ版または非表示の場合、一時的に通常サイズで表示
      if (isMobileDevice || isHidden) {
        // 親要素のクラスを一時的に無効化（スマホ版のw-[200%]などを解除）
        const parentElement = element.parentElement;
        const originalParentClass = parentElement?.className || "";
        if (parentElement && isMobileDevice) {
          parentElement.className = parentElement.className
            .replace(/w-\[200%\]/g, "")
            .replace(/min-w-\[200%\]/g, "")
            .replace(/scale-50/g, "")
            .trim();
        }

        element.style.display = "block";
        element.style.visibility = "visible";
        element.style.position = "static";
        element.style.left = "auto";
        element.style.top = "auto";
        element.style.zIndex = "9999";
        element.style.width = "800px";
        element.style.minWidth = "800px";
        element.style.maxWidth = "800px";
        element.style.height = "auto";
        element.style.margin = "0 auto";
        // スマホ版の縮小スタイルを解除
        if (isMobileDevice) {
          element.style.transform = "scale(1)";
          element.style.marginBottom = "0";
          element.style.paddingBottom = "";
          // 要素自体のクラスからも縮小関連を一時的に削除
          element.className = element.className
            .replace(/w-\[200%\]/g, "")
            .replace(/min-w-\[200%\]/g, "")
            .replace(/scale-50/g, "")
            .trim();
        }

        // レンダリングを待つ
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 親要素のクラスを保存（後で復元するため）
        if (parentElement && isMobileDevice) {
          (parentElement as any).__originalClassName = originalParentClass;
        }
        if (isMobileDevice) {
          (element as any).__originalClassName = element.className;
        }
      }

      // 動的にライブラリをインポート
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      // html2canvasで要素をキャプチャ（高品質設定）
      // 要素の実際のサイズを取得（スマホ版では一時的に通常サイズに戻しているため）
      // レンダリング後に再計算
      await new Promise((resolve) => setTimeout(resolve, 100));
      const elementWidth = element.offsetWidth || element.scrollWidth || 800;
      const elementHeight =
        element.scrollHeight || element.offsetHeight || 1000;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        // width/heightを指定しないことで、要素の自然なサイズでキャプチャ
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (el) => {
          // 楽天ウィジェットなどの外部要素を除外
          return el.id?.includes("rakuten") || false;
        },
      });

      // スマホ版の要素を元の状態に戻す
      if (isMobileDevice || isHidden) {
        const parentElement = element.parentElement;
        // 親要素のクラスを復元
        if (
          parentElement &&
          isMobileDevice &&
          (parentElement as any).__originalClassName
        ) {
          parentElement.className = (parentElement as any).__originalClassName;
          delete (parentElement as any).__originalClassName;
        }
        // 要素自体のクラスを復元
        if (isMobileDevice && (element as any).__originalClassName) {
          element.className = (element as any).__originalClassName;
          delete (element as any).__originalClassName;
        }

        element.style.display = originalStyles.display;
        element.style.visibility = originalStyles.visibility;
        element.style.position = originalStyles.position;
        element.style.left = originalStyles.left;
        element.style.top = originalStyles.top;
        element.style.zIndex = originalStyles.zIndex;
        element.style.width = originalStyles.width;
        element.style.minWidth = "";
        element.style.maxWidth = "";
        element.style.height = originalStyles.height;
        element.style.margin = originalStyles.margin;
        // スマホ版の縮小スタイルを復元
        if (isMobileDevice) {
          element.style.transform = originalStyles.transform;
          element.style.marginBottom = originalStyles.marginBottom;
          element.style.paddingBottom = originalStyles.paddingBottom;
        }
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

      // 中央揃えのためのX座標を計算
      const xPosition = (pageWidth - imgWidth) / 2;

      // PDFに画像を追加
      if (imgHeight <= contentHeight) {
        pdf.addImage(imgData, "PNG", xPosition, margin, imgWidth, imgHeight);
      } else {
        // 複数ページに分割
        let yPosition = margin;
        let remainingHeight = imgHeight;

        while (remainingHeight > 0) {
          const currentPageHeight = Math.min(contentHeight, remainingHeight);
          pdf.addImage(
            imgData,
            "PNG",
            xPosition,
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

      // エラー時も要素のスタイルを元に戻す
      if (
        element &&
        originalStyles &&
        (isMobileDevice ||
          element.classList.contains("hidden") ||
          element.offsetParent === null)
      ) {
        const parentElement = element.parentElement;
        // 親要素のクラスを復元
        if (
          parentElement &&
          isMobileDevice &&
          (parentElement as any).__originalClassName
        ) {
          parentElement.className = (parentElement as any).__originalClassName;
          delete (parentElement as any).__originalClassName;
        }
        // 要素自体のクラスを復元
        if (isMobileDevice && (element as any).__originalClassName) {
          element.className = (element as any).__originalClassName;
          delete (element as any).__originalClassName;
        }

        element.style.display = originalStyles.display;
        element.style.visibility = originalStyles.visibility;
        element.style.position = originalStyles.position;
        element.style.left = originalStyles.left;
        element.style.top = originalStyles.top;
        element.style.zIndex = originalStyles.zIndex;
        element.style.width = originalStyles.width;
        element.style.minWidth = "";
        element.style.maxWidth = "";
        element.style.height = originalStyles.height;
        element.style.margin = originalStyles.margin;
        if (isMobileDevice) {
          element.style.transform = originalStyles.transform;
          element.style.marginBottom = originalStyles.marginBottom;
          element.style.paddingBottom = originalStyles.paddingBottom;
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-0">
        <div className="flex justify-center">
          <div className="max-w-4xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                給与明細作成ツール
              </h1>
            </div>

            <p className="text-gray-600 text-center mb-4 max-w-2xl mx-auto">
              テンプレートから給与明細の管理と表示を行うサイトです
            </p>
            <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
              自動で計算を行います。データが自動で保存されることはありません。
            </p>

            {/* 入力フォーム */}
            <div className="bg-white border border-gray-200 p-3 md:p-6 mb-8">
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-6 text-gray-800">
                給与明細入力フォーム
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-8">
                {/* 左列: 基本情報と支給項目 */}
                <div className="space-y-3 md:space-y-6">
                  {/* 基本情報 */}
                  <div className="space-y-2 md:space-y-4">
                    <h3 className="text-sm md:text-lg font-medium text-gray-700">
                      基本情報
                    </h3>
                    <div className="grid grid-cols-1 gap-2 md:gap-4">
                      <div>
                        <label
                          htmlFor="company-name"
                          className="block text-xs md:text-sm font-medium text-gray-600 mb-1"
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
                              companyName: sanitizeString(e.target.value),
                            }))
                          }
                          maxLength={MAX_STRING_LENGTH}
                          className="w-full px-2 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                          placeholder="会社名を入力"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="department-name"
                          className="block text-xs md:text-sm font-medium text-gray-600 mb-1"
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
                              departmentName: sanitizeString(e.target.value),
                            }))
                          }
                          maxLength={MAX_STRING_LENGTH}
                          className="w-full px-2 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                          placeholder="部署名を入力"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="employee-number"
                          className="block text-xs md:text-sm font-medium text-gray-600 mb-1"
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
                              employeeNumber: sanitizeString(e.target.value),
                            }))
                          }
                          maxLength={MAX_STRING_LENGTH}
                          className="w-full px-2 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                          placeholder="社員番号を入力"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="employee-name"
                          className="block text-xs md:text-sm font-medium text-gray-600 mb-1"
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
                              employeeName: sanitizeString(e.target.value),
                            }))
                          }
                          maxLength={MAX_STRING_LENGTH}
                          className="w-full px-2 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                          placeholder="従業員名を入力"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 支給項目 */}
                  <div className="space-y-2 md:space-y-4">
                    <h3 className="text-sm md:text-lg font-medium text-gray-700">
                      支給項目
                    </h3>
                    <div className="space-y-1.5 md:space-y-3">
                      {salaryData.earnings.map(
                        (item: SalaryItem, index: number) => (
                          <div
                            key={index}
                            className="flex gap-1 md:gap-2 items-center"
                          >
                            <input
                              type="text"
                              value={item.name}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                updateEarningItem(index, "name", e.target.value)
                              }
                              maxLength={MAX_STRING_LENGTH}
                              className="flex-1 min-w-0 px-1.5 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
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
                              type="text"
                              inputMode="numeric"
                              value={item.amount === 0 ? "" : item.amount}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                const convertedValue = convertFullWidthToHalfWidth(e.target.value);
                                updateEarningItem(
                                  index,
                                  "amount",
                                  convertedValue
                                );
                              }}
                              className="flex-1 min-w-0 px-1 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* 右列: 労働期間と控除項目 */}
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
                          value={salaryData.year}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setSalaryData((prev: SalaryData) => ({
                              ...prev,
                              year: sanitizeYear(e.target.value),
                            }))
                          }
                          className="w-full px-2 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
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
                          className="block text-xs md:text-sm font-medium text-gray-600 mb-1"
                        >
                          月
                        </label>
                        <select
                          id="month"
                          value={salaryData.month}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setSalaryData((prev: SalaryData) => ({
                              ...prev,
                              month: sanitizeMonth(e.target.value),
                            }))
                          }
                          className="w-full px-2 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
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
                  <div className="space-y-2 md:space-y-4">
                    <h3 className="text-sm md:text-lg font-medium text-gray-700">
                      勤怠項目
                    </h3>
                    <div className="space-y-1.5 md:space-y-3">
                      {salaryData.attendance.map(
                        (item: SalaryItem, index: number) => (
                          <div
                            key={index}
                            className="flex gap-1 md:gap-2 items-center"
                          >
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
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                const convertedValue = convertFullWidthToHalfWidth(e.target.value);
                                updateAttendanceItem(
                                  index,
                                  "amount",
                                  convertedValue
                                );
                              }}
                              className="flex-1 min-w-0 px-1 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* 控除項目 */}
                  <div className="space-y-2 md:space-y-4">
                    <h3 className="text-sm md:text-lg font-medium text-gray-700">
                      控除項目
                    </h3>
                    <div className="space-y-1.5 md:space-y-3">
                      {salaryData.deductions.map(
                        (item: SalaryItem, index: number) => (
                          <div
                            key={index}
                            className="flex gap-1 md:gap-2 items-center"
                          >
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
                              maxLength={MAX_STRING_LENGTH}
                              className="flex-1 min-w-0 px-1.5 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
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
                              type="text"
                              inputMode="numeric"
                              value={item.amount === 0 ? "" : item.amount}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                const convertedValue = convertFullWidthToHalfWidth(e.target.value);
                                updateDeductionItem(
                                  index,
                                  "amount",
                                  convertedValue
                                );
                              }}
                              className="flex-1 min-w-0 px-1 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
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
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  <span className="md:hidden">給与明細</span>
                  <span className="hidden md:inline">給与明細プレビュー</span>
                </h2>
                <button
                  onClick={exportToPDF}
                  className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium w-full md:w-auto"
                >
                  PDFでダウンロード
                </button>
              </div>

              {/* スマホ版では縮小表示、PC版では通常表示 */}
              <div
                className="overflow-hidden md:overflow-visible -mx-6 md:mx-0"
                style={
                  isMobile
                    ? { height: "fit-content", maxHeight: "50vh" }
                    : undefined
                }
              >
                <div
                  id="salary-statement"
                  className="bg-white p-4 md:p-8 transform md:transform-none scale-50 md:scale-100 origin-top-left md:origin-center w-[200%] md:w-auto min-w-[200%] md:min-w-0"
                  style={{
                    marginBottom: isMobile ? "-50%" : undefined,
                    paddingBottom: isMobile ? 0 : undefined,
                  }}
                >
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
              className="text-blue-600 underline text-sm"
            >
              ogmer.net@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
