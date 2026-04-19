"use client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

// 6 групп по 4 символа = 24 символа SYNOP кода
// InputOTP даёт отдельную ячейку для каждого символа
const slot = (i: number) => (
  <InputOTPSlot
    key={i}
    index={i}
    className="h-10 w-8 rounded-lg text-sm sm:h-12 sm:w-10"
  />
);

export function SynopInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <InputOTP
      maxLength={24}
      pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
      value={value.toUpperCase()}
      onChange={(v) => onChange(v.toUpperCase())}
      disabled={disabled}
      containerClassName="flex-wrap justify-center gap-2"
    >
      {[0, 4, 8, 12, 16, 20].map((start, gi) => (
        <span key={start} className="flex items-center gap-2">
          {gi > 0 && <InputOTPSeparator />}
          <InputOTPGroup>
            {[0, 1, 2, 3].map((j) => slot(start + j))}
          </InputOTPGroup>
        </span>
      ))}
    </InputOTP>
  );
}
