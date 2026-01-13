/**
 * 給与明細アプリケーションの型定義
 */

/**
 * 給与項目（支給・控除・勤怠）
 */
export interface SalaryItem {
  name: string;
  amount: number;
}

/**
 * 給与明細の全データ
 */
export interface SalaryData {
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

/**
 * 計算された合計値
 */
export interface Totals {
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
}
