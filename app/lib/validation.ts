/**
 * 入力検証とサニタイゼーション関数
 * セキュリティ: XSS対策と入力値検証
 */

// 定数
export const MAX_STRING_LENGTH = 100;
export const MAX_AMOUNT = 999999999;
export const MIN_AMOUNT = 0;
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;
export const MIN_MONTH = 1;
export const MAX_MONTH = 12;

/**
 * 文字列入力のサニタイゼーション
 * 注意: Reactは自動的にエスケープするため、ここでは制御文字の除去と長さ制限のみを行う
 * @param input 入力文字列
 * @param maxLength 最大長 (デフォルト: MAX_STRING_LENGTH)
 * @returns サニタイズされた文字列
 */
export const sanitizeString = (
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

/**
 * 全角数字を半角数字に変換する関数
 * @param str 変換する文字列
 * @returns 半角数字に変換された文字列
 */
export const convertFullWidthToHalfWidth = (str: string): string => {
  return str.replace(/[０-９]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
  });
};

/**
 * 数値入力の検証とサニタイゼーション
 * @param input 入力値（文字列または数値）
 * @param min 最小値 (デフォルト: MIN_AMOUNT)
 * @param max 最大値 (デフォルト: MAX_AMOUNT)
 * @returns サニタイズされた数値
 */
export const sanitizeNumber = (
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

/**
 * 年入力の検証
 * @param input 入力値（文字列または数値）
 * @returns サニタイズされた年
 */
export const sanitizeYear = (input: string | number): number => {
  const year = sanitizeNumber(input, MIN_YEAR, MAX_YEAR);
  return year;
};

/**
 * 月入力の検証
 * @param input 入力値（文字列または数値）
 * @returns サニタイズされた月
 */
export const sanitizeMonth = (input: string | number): number => {
  const month = sanitizeNumber(input, MIN_MONTH, MAX_MONTH);
  return month;
};

/**
 * ファイル名のサニタイゼーション（強化版）
 * @param str ファイル名
 * @returns サニタイズされたファイル名
 */
export const sanitizeFileName = (str: string): string => {
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
