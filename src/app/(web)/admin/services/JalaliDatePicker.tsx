"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  toJalaliDate,
  jalaliToDate,
  toJalaliString,
} from "@/utils/format";

const PERSIAN_MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const PERSIAN_WEEK_DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

function toPersianDigits(input: string | number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(input).replace(/[0-9]/g, (d) => persianDigits[+d]);
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
};

export default function JalaliDatePicker({ value, onChange, label, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initial = value
    ? (() => {
        const parts = value.split("/").map(Number);
        if (parts.length === 3 && !parts.some(isNaN)) {
          return { year: parts[0], month: parts[1], day: parts[2] };
        }
        return null;
      })()
    : null;

  const today = toJalaliDate(new Date());
  const [viewYear, setViewYear] = useState(initial?.year || today.year);
  const [viewMonth, setViewMonth] = useState(initial?.month || today.month);

  useEffect(() => {
    if (initial) {
      setViewYear(initial.year);
      setViewMonth(initial.month);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = viewMonth <= 6 ? 31 : viewMonth <= 11 ? 30 : 29;
  const firstDayDate = jalaliToDate(viewYear, viewMonth, 1);
  const firstDayOfWeek = (firstDayDate.getDay() + 1) % 7;

  const selectDay = (day: number) => {
    const date = jalaliToDate(viewYear, viewMonth, day);
    onChange(toJalaliString(date));
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedDay = initial && initial.year === viewYear && initial.month === viewMonth ? initial.day : null;
  const todayDay = today.year === viewYear && today.month === viewMonth ? today.day : null;

  return (
    <div className="relative" ref={containerRef} style={{ minWidth: 180 }}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div
        onClick={() => setOpen(!open)}
        style={{
          cursor: "pointer",
          border: "1px solid var(--mantine-color-gray-3, #ced4da)",
          borderRadius: 6,
          padding: "8px 12px",
          background: "var(--mantine-color-white, #fff)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 38,
        }}
      >
        <span style={{ color: value ? "inherit" : "#999" }}>
          {value ? toPersianDigits(value) : placeholder || "انتخاب تاریخ"}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>

      {open && (
        <div
          className="jalali-datepicker-popup"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 4,
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            zIndex: 1000,
            width: 300,
            padding: 12,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={prevMonth} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, padding: "2px 8px" }}>
              &rsaquo;
            </button>
            <span className="font-bold text-sm">
              {PERSIAN_MONTH_NAMES[viewMonth - 1]} {toPersianDigits(viewYear)}
            </span>
            <button type="button" onClick={nextMonth} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, padding: "2px 8px" }}>
              &lsaquo;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {PERSIAN_WEEK_DAYS.map((day) => (
              <div key={day} className="text-xs text-gray-400" style={{ fontSize: 11 }}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {cells.map((cell, idx) => (
              <div
                key={idx}
                onClick={() => cell && selectDay(cell)}
                style={{
                  cursor: cell ? "pointer" : "default",
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                  fontSize: 13,
                  background: cell === selectedDay ? "#0875e1" : cell === todayDay ? "#e8f4ff" : "transparent",
                  color: cell === selectedDay ? "#fff" : "inherit",
                  fontWeight: cell === todayDay ? 600 : 400,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (cell && cell !== selectedDay) {
                    e.currentTarget.style.background = "#f0f0f0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (cell && cell !== selectedDay && cell !== todayDay) {
                    e.currentTarget.style.background = "transparent";
                  } else if (cell === todayDay && cell !== selectedDay) {
                    e.currentTarget.style.background = "#e8f4ff";
                  }
                }}
              >
                {cell ? toPersianDigits(cell) : ""}
              </div>
            ))}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-xs text-red-500 mt-2 block w-full text-center"
            >
              حذف تاریخ
            </button>
          )}
        </div>
      )}
    </div>
  );
}
