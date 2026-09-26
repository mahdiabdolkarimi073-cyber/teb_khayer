"use client";

import {useState, useEffect} from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    const fullPath = `/admin${path}`;
    return pathname === fullPath || pathname.startsWith(fullPath + "/");
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <button
        className={styles.hamburgerBtn}
        onClick={() => setMobileOpen(true)}
        aria-label="باز کردن منو"
      >
        ☰
      </button>

      <div
        className={`${styles.sidebarOverlay} ${mobileOpen ? styles.show : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}
        dir="rtl"
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <img src="/logo.webp" alt="طب خیر"/>
            <span className={styles.sidebarLogoText}>طب خیر</span>
          </div>
          <button
            className={styles.sidebarCloseBtn}
            onClick={() => setMobileOpen(false)}
            aria-label="بستن منو"
          >
            ✕
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.sidebarLabel}>منوی اصلی</div>
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

          <div className={styles.sidebarLabel}>تنظیمات</div>
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
        </nav>

        <div className={styles.sidebarFooter}>
          <p className={styles.sidebarFooterText}>نسخه ۱.۰ — طب خیر</p>
        </div>
      </aside>
    </>
  );
}
