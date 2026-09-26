"use client";

import {usePathname} from "next/navigation";
import Link from "next/link";
import styles from "./dashboard/dashboard.module.css";

const sections = [
  {name: "داشبورد", path: "/dashboard", icon: "⌂"},
  {name: "گزارش‌های مالی", path: "/reports", icon: "▥"},
  {name: "تراکنش‌ها", path: "/transactions", icon: "▤"},
  {name: "دوره‌ها", path: "/courses", icon: "▦"},
  {name: "دانشجویان", path: "/students", icon: "♙"},
  {name: "محصولات", path: "/products", icon: "▦"},
  {name: "سفارشات", path: "/orders", icon: "☷"},
  {name: "کاربران", path: "/users", icon: "♙"},
  {name: "پشتیبان‌گیری", path: "/backup", icon: "◉"},
];

const lowerSections = [
  {name: "سئو", path: "/seo", icon: "◎"},
  {name: "ارتباطات و هوش مصنوعی", path: "/integrations", icon: "ϟ"},
  {name: "تنظیمات", path: "/services", icon: "⚙"},
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    const fullPath = `/admin${path}`;
    return pathname === fullPath || pathname.startsWith(fullPath + "/");
  };

  return (
    <aside className={styles.sidebar} dir="rtl">
      <div className={styles.sidebarLogo}>
        <img src="/logo.webp" alt="طب خیر"/>
      </div>
      {sections.map((s) => (
        <Link
          key={s.path}
          href={`/admin${s.path}`}
          className={`${styles.sidebarItem} ${isActive(s.path) ? styles.sidebarItemActive : ""}`}
        >
          <span>{s.icon}</span>
          <b>{s.name}</b>
        </Link>
      ))}
      <div className={styles.sidebarDivider}/>
      {lowerSections.map((s) => (
        <Link
          key={s.path}
          href={`/admin${s.path}`}
          className={`${styles.sidebarItem} ${isActive(s.path) ? styles.sidebarItemActive : ""}`}
        >
          <span>{s.icon}</span>
          <b>{s.name}</b>
        </Link>
      ))}
    </aside>
  );
}
