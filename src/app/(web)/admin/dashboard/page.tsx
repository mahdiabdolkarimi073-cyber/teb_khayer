"use client";

import React, {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {getDashboardStats, DashboardStats} from "@/app/(web)/admin/dashboard/dashboard.action";
import {formatPersianCurrency, formatPersianNumber, toPersianDateTime} from "@/utils/format";
import styles from "./dashboard.module.css";

const heroImage = "/ChatGPT_Image_Sep_22,_2026,_10_51_08_AM.png";

function KPICard({icon, label, value, tone, growth}: {
  icon: string; label: string; value: string; tone: "purple" | "green" | "blue" | "orange"; growth?: number;
}) {
  const growthStr = growth !== undefined ? `${growth >= 0 ? "+" : ""}${formatPersianNumber(growth)}٪` : null;
  return (
    <article className={`${styles.statCard} ${styles[tone]}`}>
      <div className={styles.statIcon}>{icon}</div>
      {growthStr && (
        <span className={`${styles.statChange} ${growth < 0 ? styles.statChangeDanger : ""}`}>{growthStr}</span>
      )}
      <strong className={styles.statValue}>{value}</strong>
      <label className={styles.statLabel}>{label}</label>
      <Link href="#" className={styles.statLink}>مشاهده جزئیات ←</Link>
    </article>
  );
}

function MiniBarChart({data, color = "#0879df"}: {data: {date: string; total: number}[]; color?: string}) {
  if (!data?.length) return <div className={styles.chartCanvas} style={{display: "flex", alignItems: "center", justifyContent: "center", color: "#7890a8", fontSize: 11}}>داده‌ای موجود نیست</div>;
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className={styles.chartCanvas} style={{display: "flex", gap: 2, alignItems: "flex-end", height: 210, paddingBottom: 20}}>
      {data.map((d) => {
        const h = Math.max((d.total / max) * 170, 2);
        return (
          <div key={d.date} style={{display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 8}}>
            <div style={{
              width: "100%", height: h, background: color, borderRadius: "4px 4px 0 0",
              opacity: d.total > 0 ? 1 : 0.2, transition: "height .3s ease",
            }}/>
            <span style={{fontSize: 8, color: "#7890a8", marginTop: 4}}>{d.date.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({data}: {data: {name: string; total: number}[]}) {
  if (!data?.length) return <div className={styles.donutWrapper} style={{color: "#7890a8", fontSize: 11}}>داده‌ای موجود نیست</div>;
  const total = data.reduce((s, d) => s + d.total, 0) || 1;
  const colors = ["#138eb4", "#49b57a", "#f19a55", "#e86c55", "#7d54dc"];
  let cumulative = 0;
  return (
    <div className={styles.donutWrapper}>
      <svg width={160} height={160} viewBox="0 0 160 160">
        {data.map((d, i) => {
          const pct = d.total / total;
          const dash = pct * 2 * Math.PI * 60;
          const offset = -cumulative * 2 * Math.PI * 60;
          cumulative += pct;
          return (
            <circle
              key={d.name}
              cx={80} cy={80} r={60} fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth={24}
              strokeDasharray={`${dash} ${2 * Math.PI * 60 - dash}`}
              strokeDashoffset={offset}
              transform="rotate(-90 80 80)"
            />
          );
        })}
      </svg>
      <span className={styles.donutCenter}>دسته‌ها</span>
      <div className={styles.legend}>
        {data.map((d, i) => (
          <div key={d.name} className={styles.legendItem}>
            <span className={styles.legendDot} style={{background: colors[i % colors.length]}}/>
            {d.name}: {formatPersianCurrency(d.total)}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderStatusBadge({status}: {status: string}) {
  const map: Record<string, {label: string; cls: string}> = {
    PENDING: {label: "در حال آماده‌سازی", cls: styles.badgeWarning},
    SENDED: {label: "ارسال شده", cls: styles.badgeInfo},
    DELAY: {label: "تحویل شده", cls: styles.badgeSuccess},
    CANCELED: {label: "لغو شده", cls: styles.badgeDanger},
  DEFAULT: {label: "نامشخص", cls: styles.badgeInfo},
  };
  const info = map[status] || map.DEFAULT;
  return <span className={`${styles.badge} ${info.cls}`}>{info.label}</span>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const prevOrderCount = useRef(0);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
      setIsLive(true);
      if (data.recentOrders.length > prevOrderCount.current && prevOrderCount.current > 0) {
        const {toast} = await import("react-toastify");
        toast.info(`سفارش جدید دریافت شد (${formatPersianNumber(data.recentOrders.length)} سفارش اخیر)`);
      }
      prevOrderCount.current = data.recentOrders.length;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div dir="rtl" style={{maxWidth: 981, margin: "0 auto"}}>
        <div style={{height: 165, borderRadius: 22, background: "#dbeeff", marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "#7890a8"}}>در حال بارگذاری...</div>
        <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 18}}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{height: 155, borderRadius: 16, background: "#fff", border: "1px solid #e7eef6"}}/>)}
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{maxWidth: 981, margin: "0 auto"}}>
        {/* Admin Hero */}
        <section className={styles.adminHero}>
          <div className={styles.heroImage} style={{backgroundImage: `url(${heroImage})`}}/>
          <div className={styles.heroOverlay}/>
          <div className={styles.heroContent}>
            <div className={styles.welcomeCard}>
              <img src="/logo.webp" alt="طب خیر"/>
              <div>
                <span className={styles.crown}>👑</span>
                <h1>سلام، مدیر عزیز</h1>
                <p>به پنل مدیریت طب خیر خوش آمدید</p>
                <small>همیشه در کمترین زمان در جریان هستید.</small>
              </div>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <section className={styles.statsGrid}>
          <KPICard icon="↥" label="کل سفارشات" value={formatPersianNumber(stats.totalOrders)} tone="purple" growth={13}/>
          <KPICard icon="🛒" label="کل فروش" value={formatPersianCurrency(stats.totalSales)} tone="green" growth={25}/>
          <KPICard icon="♙" label="کاربران" value={formatPersianNumber(stats.totalUsers)} tone="blue" growth={stats.usersGrowth}/>
          <KPICard icon="▣" label="درآمد امروز" value={formatPersianCurrency(stats.todayRevenue)} tone="orange" growth={18}/>
        </section>

        {/* Analytics */}
        <section className={styles.analyticsGrid}>
          <div className={styles.chartCard}>
            <div className={styles.sectionHeader}>
              <h2>فروش روزانه <small>(هزار تومان)</small></h2>
              <select>
                <option>۷ روز گذشته</option>
                <option>۳۰ روز گذشته</option>
                <option>۳ ماه گذشته</option>
              </select>
            </div>
            <MiniBarChart data={stats.salesTrend} color="#0879df"/>
          </div>
          <div className={styles.categoryCard}>
            <div className={styles.sectionHeader}>
              <h2>دسته‌های پرفروش</h2>
            </div>
            <DonutChart data={stats.topCategories}/>
          </div>
        </section>

        {/* Order Status */}
        <section className={styles.orderStatusCard}>
          <div className={styles.sectionHeader}>
            <h2>وضعیت سفارشات</h2>
            <Link href="/admin/orders" className={styles.sectionLink}>مشاهده همه ←</Link>
          </div>
          <div className={styles.statusGrid}>
            <div className={styles.statusReady + " " + styles.status}>
              <span>{formatPersianNumber(stats.pendingOrders)}</span>
              <b>در حال آماده‌سازی</b>
            </div>
            <div className={styles.statusSent + " " + styles.status}>
              <span>{formatPersianNumber(stats.sendedOrders)}</span>
              <b>ارسال شده</b>
            </div>
            <div className={styles.statusDelivered + " " + styles.status}>
              <span>{formatPersianNumber(stats.completedOrders)}</span>
              <b>تحویل شده</b>
            </div>
            <div className={styles.statusCancelled + " " + styles.status}>
              <span>{formatPersianNumber(stats.canceledOrders)}</span>
              <b>لغو شده</b>
            </div>
          </div>
        </section>

        {/* Tables */}
        <section className={styles.tablesGrid}>
          <div className={styles.tableCard}>
            <div className={styles.tableTitle}>
              <h2>آخرین مشتریان</h2>
              <Link href="/admin/users" className={styles.sectionLink}>مشاهده همه</Link>
            </div>
            <div className={styles.tableScroll}>
              <table>
                <thead>
                  <tr>
                    <th>شماره</th>
                    <th>کاربر</th>
                    <th>مبلغ</th>
                    <th>تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.slice(0, 5).map((o: any, i: number) => (
                    <tr key={o.id}>
                      <td>{formatPersianNumber(i + 1)}</td>
                      <td>{o.user?.name}</td>
                      <td>{formatPersianCurrency(o.payment?.amount || 0)}</td>
                      <td>{toPersianDateTime(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.tableCard}>
            <div className={styles.tableTitle}>
              <h2>آخرین سفارشات</h2>
              <Link href="/admin/orders" className={styles.sectionLink}>مشاهده همه</Link>
            </div>
            <div className={styles.tableScroll}>
              <table>
                <thead>
                  <tr>
                    <th>شماره</th>
                    <th>کاربر</th>
                    <th>مبلغ</th>
                    <th>وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.slice(0, 5).map((o: any, i: number) => (
                    <tr key={o.id}>
                      <td>{formatPersianNumber(i + 1)}</td>
                      <td>{o.user?.name}</td>
                      <td>{formatPersianCurrency(o.payment?.amount || 0)}</td>
                      <td><OrderStatusBadge status={o.status}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className={styles.quickActions}>
          <div className={styles.quickActionsText}>
            <strong>با مدیریت هوشمند، فروش خود را افزایش دهید!</strong>
            <small>سفارشات، کاربران و گزارش‌ها را در یک نگاه مدیریت کنید.</small>
          </div>
          <Link href="/admin/products" className={styles.quickActionBtn}>مدیریت محصولات</Link>
          <Link href="/admin/courses" className={styles.quickActionBtn}>مدیریت محتوا</Link>
          <Link href="/admin/users" className={styles.quickActionBtn}>مدیریت کاربران</Link>
          <Link href="/admin/reports" className={styles.quickActionBtn}>گزارش‌گیری پیشرفته</Link>
        </section>
    </div>
  );
}
