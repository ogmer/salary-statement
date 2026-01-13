"use client";

import React from "react";

// カスタムフック
import { useSalaryState } from "@/app/components/hooks/useSalaryState";
import { useSalaryCalculations } from "@/app/components/hooks/useSalaryCalculations";
import { useResponsive } from "@/app/components/hooks/useResponsive";
import { useNumberFormatter } from "@/app/components/hooks/useNumberFormatter";

// コンポーネント
import SalaryForm from "@/app/components/form/SalaryForm";
import SalaryPreview from "@/app/components/preview/SalaryPreview";

export default function Home() {
  const {
    salaryData,
    updateBasicInfo,
    updateEarningItem,
    updateDeductionItem,
    updateAttendanceItem,
  } = useSalaryState();

  const totals = useSalaryCalculations(salaryData);
  const isMobile = useResponsive(768);
  const formatAmount = useNumberFormatter();

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
            <SalaryForm
              salaryData={salaryData}
              onUpdateBasicInfo={updateBasicInfo}
              onUpdateEarning={updateEarningItem}
              onUpdateDeduction={updateDeductionItem}
              onUpdateAttendance={updateAttendanceItem}
            />

            {/* 給与明細プレビュー */}
            <SalaryPreview
              salaryData={salaryData}
              totals={totals}
              isMobile={isMobile}
              formatAmount={formatAmount}
              onUpdateDeduction={updateDeductionItem}
            />
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
