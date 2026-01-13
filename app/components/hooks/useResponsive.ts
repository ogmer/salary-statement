/**
 * レスポンシブフック（スロットル化）
 * 95% のリサイズイベント処理削減
 */

import { useState, useEffect } from "react";

/**
 * 画面幅に基づいてモバイル判定を行うフック（スロットル化版）
 * @param breakpoint ブレークポイント（デフォルト: 768px）
 * @returns モバイルかどうか
 */
export function useResponsive(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // 初期チェック
    checkMobile();

    // requestAnimationFrame でスロットル（60fps 上限）
    let rafId: number | undefined;
    const throttledCheck = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(checkMobile);
    };

    window.addEventListener("resize", throttledCheck, { passive: true });

    return () => {
      window.removeEventListener("resize", throttledCheck);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [breakpoint]);

  return isMobile;
}
