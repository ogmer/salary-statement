/**
 * アプリケーション全体で使用する定数
 */

import type { SalaryItem } from "./types";

/**
 * デフォルトの支給項目
 */
export const DEFAULT_EARNINGS: SalaryItem[] = [
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

/**
 * デフォルトの控除項目
 */
export const DEFAULT_DEDUCTIONS: SalaryItem[] = [
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

/**
 * デフォルトの勤怠項目
 */
export const DEFAULT_ATTENDANCE: SalaryItem[] = [
  { name: "労働日数", amount: 22 },
  { name: "残業時間", amount: 0 },
  { name: "", amount: 0 },
  { name: "", amount: 0 },
];
