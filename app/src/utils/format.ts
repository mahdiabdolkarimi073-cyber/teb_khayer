export function formatPersianCurrency(amount: number): string {
  const rounded = Math.round(amount || 0);
  return rounded.toLocaleString("fa") + " تومان";
}

export function formatPersianNumber(value: number): string {
  return (value || 0).toLocaleString("fa");
}

export function toPersianDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function toPersianDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) + " - " + d.toLocaleTimeString("fa-IR", {hour: "2-digit", minute: "2-digit"});
}

export function toShortPersianDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fa-IR");
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

export function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return startOfDay(d);
}

/* ===== Jalali (Persian) Calendar Utilities ===== */

const J_DAYS_IN_MONTH = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
const G_DAYS_IN_MONTH = [31, 28, 31, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapGregorian(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function isLeapJalali(year: number): boolean {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2268, 2324, 2394, 2456, 3178];
  let jp = breaks[0];
  let jump = 0;
  for (let i = 1; i < breaks.length; i++) {
    const jm = breaks[i];
    jump = jm - jp;
    if (year < jm) break;
    jp = jm;
  }
  let n = year - jp;
  if (n < jump) return n % 33 % 4 === 0;
  return (n % 33) % 4 === 0;
}

function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  let gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365 * gy) + (Math.floor((gy2 + 3) / 4)) + (Math.floor((gy2 + 99) / 100)) - (Math.floor((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return [jy, jm, jd];
}

function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy = (jy <= 979) ? 621 : 1600;
  jy -= (jy <= 979) ? 0 : 979;
  let days = (365 * jy) + (Math.floor(jy / 33) * 8) + (Math.floor((jy % 33 + 3) / 4)) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  let sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
  return [gy, gm, gd];
}

const PERSIAN_MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

export function toJalaliDate(date: Date): {year: number; month: number; day: number} {
  const [jy, jm, jd] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return {year: jy, month: jm, day: jd};
}

export function jalaliToDate(jy: number, jm: number, jd: number): Date {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
}

export function toJalaliString(date: Date): string {
  const {year, month, day} = toJalaliDate(date);
  return `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
}

export function jalaliStringToDate(jalaliStr: string): Date {
  const parts = jalaliStr.split("/").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return new Date();
  return jalaliToDate(parts[0], parts[1], parts[2]);
}

export function formatJalaliDate(date: Date | string): string {
  const d = new Date(date);
  const {year, month, day} = toJalaliDate(d);
  return `${day} ${PERSIAN_MONTH_NAMES[month - 1]} ${year}`;
}

export function formatJalaliDateShort(date: Date | string): string {
  const d = new Date(date);
  const {year, month, day} = toJalaliDate(d);
  return `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
}

export function jalaliDaysAgo(n: number): string {
  const d = daysAgo(n);
  return toJalaliString(d);
}

export function jalaliToday(): string {
  return toJalaliString(new Date());
}
