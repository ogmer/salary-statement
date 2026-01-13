/**
 * PDF エクスポート機能
 * 遅延ロードにより初期バンドルから分離（449KB 削減）
 */

import type { SalaryData } from "./types";
import { sanitizeFileName } from "./validation";

/**
 * 給与明細を PDF としてエクスポート
 * @param salaryData 給与データ
 */
export async function exportSalaryToPDF(salaryData: SalaryData): Promise<void> {
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
      'button[type="button"]'
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

    // 動的にライブラリをインポート（遅延ロード）
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import("jspdf"),
      import("html2canvas"),
    ]);

    // html2canvasで要素をキャプチャ（高品質設定）
    await new Promise((resolve) => setTimeout(resolve, 100));
    const elementWidth = element.offsetWidth || element.scrollWidth || 800;
    const elementHeight = element.scrollHeight || element.offsetHeight || 1000;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
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

    // ファイル名を生成
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
      'button[type="button"]'
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
}
