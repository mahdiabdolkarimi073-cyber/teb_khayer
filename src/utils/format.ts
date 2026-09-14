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
