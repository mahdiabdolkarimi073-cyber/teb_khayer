"use client";

import React, {useEffect, useState} from "react";
import Link from "next/link";
import {getRecentSuccessfulTransactions} from "@/app/(web)/admin/dashboard/dashboard.action";
import {formatPersianCurrency, formatPersianNumber, toPersianDateTime} from "@/utils/format";
import styles from "../dashboard/dashboard.module.css";

export default function SalesDetailsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await getRecentSuccessfulTransactions(20);
        setTransactions(data);
        setTotalRevenue(data.reduce((sum: number, t: any) => sum + t.amount, 0));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboardMain}>
        <div style={{height: 180, borderRadius: 22, background: "#dbeeff", display: "flex", alignItems: "center", justifyContent: "center", color: "#7890a8"}}>
          در حال بارگذاری...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardMain}>
      {/* Header */}
      <section className={styles.adminHero} style={{height: "auto", minHeight: 120, padding: "24px 30px"}}>
        <div className={styles.heroContent} style={{padding: 0}}>
          <div className={styles.welcomeCard} style={{width: "100%", maxWidth: 600}}>
            <div style={{fontSize: 32}}>💰</div>
            <div>
              <h1 style={{fontSize: 18}}>جزئیات کل فروش</h1>
              <p>۲۰ تراکنش موفق اخیر سایت</p>
              <small>فقط سفارش‌های موفق و غیرلغو شده حساب شده‌اند</small>
            </div>
          </div>
        </div>
      </section>

      {/* Summary KPI */}
      <section className={styles.statsGrid} style={{gridTemplateColumns: "repeat(3, 1fr)"}}>
        <div className={`${styles.statCard} ${styles.green}`}>
          <div className={styles.statIcon}>🛒</div>
          <strong className={styles.statValue}>{formatPersianCurrency(totalRevenue)}</strong>
          <label className={styles.statLabel}>جمع این ۲۰ تراکنش</label>
        </div>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <div className={styles.statIcon}>📊</div>
          <strong className={styles.statValue}>{formatPersianNumber(transactions.length)}</strong>
          <label className={styles.statLabel}>تعداد تراکنش‌های موفق</label>
        </div>
        <div className={`${styles.statCard} ${styles.orange}`}>
          <div className={styles.statIcon}>↗</div>
          <strong className={styles.statValue}>
            {transactions.length > 0 ? formatPersianCurrency(Math.round(totalRevenue / transactions.length)) : "۰ تومان"}
          </strong>
          <label className={styles.statLabel}>میانگین مبلغ تراکنش</label>
        </div>
      </section>

      {/* Transactions Table */}
      <section className={styles.orderStatusCard} style={{marginTop: 16}}>
        <div className={styles.sectionHeader}>
          <h2>آخرین ۲۰ تراکنش موفق</h2>
          <Link href="/admin/transactions?status=successful" className={styles.sectionLink}>
            مشاهده همه تراکنش‌ها ←
          </Link>
        </div>
        <div className={styles.tableScroll} style={{marginTop: 14}}>
          <table style={{width: "100%", borderCollapse: "collapse"}}>
            <thead>
              <tr>
                <th style={{padding: "10px 4px", borderBottom: "1px solid #edf2f6", textAlign: "right", fontSize: 11, color: "#092d55", fontWeight: 700}}>#</th>
                <th style={{padding: "10px 4px", borderBottom: "1px solid #edf2f6", textAlign: "right", fontSize: 11, color: "#092d55", fontWeight: 700}}>کاربر</th>
                <th style={{padding: "10px 4px", borderBottom: "1px solid #edf2f6", textAlign: "right", fontSize: 11, color: "#092d55", fontWeight: 700}}>تلفن</th>
                <th style={{padding: "10px 4px", borderBottom: "1px solid #edf2f6", textAlign: "right", fontSize: 11, color: "#092d55", fontWeight: 700}}>مبلغ</th>
                <th style={{padding: "10px 4px", borderBottom: "1px solid #edf2f6", textAlign: "right", fontSize: 11, color: "#092d55", fontWeight: 700}}>نوع</th>
                <th style={{padding: "10px 4px", borderBottom: "1px solid #edf2f6", textAlign: "right", fontSize: 11, color: "#092d55", fontWeight: 700}}>شماره سفارش</th>
                <th style={{padding: "10px 4px", borderBottom: "1px solid #edf2f6", textAlign: "right", fontSize: 11, color: "#092d55", fontWeight: 700}}>تاریخ</th>
                <th style={{padding: "10px 4px", borderBottom: "1px solid #edf2f6", textAlign: "right", fontSize: 11, color: "#092d55", fontWeight: 700}}>وضعیت سفارش</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{padding: "30px 4px", textAlign: "center", color: "#7890a8", fontSize: 14}}>
                    تراکنش موفقی موجود نیست
                  </td>
                </tr>
              ) : (
                transactions.map((t: any, i: number) => (
                  <tr key={t.id}>
                    <td style={{padding: "10px 4px", borderBottom: "1px solid #edf2f6", textAlign: "right", fontSize: 11, color: "#617a91"}}>{formatPersianNumber(i + 1)}</td>
                    <td style={{padding: "10px 4px", borderBottom: "1px solid #edf2f6", textAlign: "right", fontSize: 11, color: "#617a91"}}>{t.user?.name || "-"}</td>
                    <td style={{padding: "10px 4px", borderBottom: "1px solid #edf2f6", textAlign: "right", fontSize: 11, color: "#617a91"}}>{t.user?.phone || "-"}</td>
                    <td style={{padding: "10px 4px", borderBottom: "1px solid #edf2f6", textAlign: "right", fontSize: 11, color: "#617a91", fontWeight: 700}}>{formatPersianCurrency(t.amount)}</td>
                    <td style={{padding: "10px 4px", borderBottom: "1px solid #edf2f6", textAlign: "right", fontSize: 11, color: "#617a91"}}>{t.type === "PRODUCT" ? "محصول" : "دوره"}</td>
                    <td style={{padding: "10px 4px", borderBottom: "1px solid #edf2f6", textAlign: "right", fontSize: 11, color: "#617a91"}}>
                      {t.order ? (
                        <Link href={`/admin/orders?order=${t.order.id}`} style={{color: "#0879df", textDecoration: "none"}}>
                          {formatPersianNumber(t.order.id)}
                        </Link>
                      ) : "-"}
                    </td>
                    <td style={{padding: "10px 4px", borderBottom: "1px solid #edf2f6", textAlign: "right", fontSize: 11, color: "#617a91"}}>{toPersianDateTime(t.created_at)}</td>
                    <td style={{padding: "10px 4px", borderBottom: "1px solid #edf2f6", textAlign: "right", fontSize: 11}}>
                      {t.order ? (
                        <span className={`${styles.badge} ${t.order.status === "CANCELED" ? styles.badgeDanger : t.order.status === "DELAY" ? styles.badgeSuccess : styles.badgeInfo}`}>
                          {t.order.status === "PENDING" ? "در حال آماده‌سازی" : t.order.status === "SENDED" ? "ارسال شده" : t.order.status === "DELAY" ? "تحویل شده" : t.order.status === "CANCELED" ? "لغو شده" : t.order.status}
                        </span>
                      ) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Back link */}
      <section className={styles.quickActions}>
        <Link href="/admin/dashboard" className={styles.quickActionBtn}>← بازگشت به داشبورد</Link>
      </section>
    </div>
  );
}
