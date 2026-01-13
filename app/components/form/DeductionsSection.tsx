"use client";

import { memo } from "react";
import type { SalaryItem } from "@/app/lib/types";
import {
  MAX_STRING_LENGTH,
  convertFullWidthToHalfWidth,
} from "@/app/lib/validation";

interface DeductionsSectionProps {
  deductions: SalaryItem[];
  onUpdate: (index: number, field: "name" | "amount", value: string) => void;
}

const DeductionsSection = memo(function DeductionsSection({
  deductions,
  onUpdate,
}: DeductionsSectionProps) {
  return (
    <div className="space-y-2 md:space-y-4">
      <h3 className="text-sm md:text-lg font-medium text-gray-700">
        控除項目
      </h3>
      <div className="space-y-1.5 md:space-y-3">
        {deductions.map((item: SalaryItem, index: number) => (
          <div key={index} className="flex gap-1 md:gap-2 items-center">
            <input
              type="text"
              value={item.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onUpdate(index, "name", e.target.value)
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const convertedValue = convertFullWidthToHalfWidth(
                  e.target.value
                );
                onUpdate(index, "amount", convertedValue);
              }}
              className="flex-1 min-w-0 px-1 py-1 md:px-3 md:py-2 text-xs md:text-base border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
});

export default DeductionsSection;
