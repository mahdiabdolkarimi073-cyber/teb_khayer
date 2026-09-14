"use client";

import React, {useEffect, useRef, useState} from "react";
import {
  Card, Grid, Group, Stack, Text, Title, Badge, Table, ScrollArea,
  ThemeIcon, SimpleGrid, Button, Box, Skeleton,
} from "@mantine/core";
import {
  IconUsers, IconShoppingCart, IconCurrencyDollar, IconTrendingUp,
  IconCheck, IconX, IconAlertCircle, IconChartLine, IconActivity,
} from "@tabler/icons-react";
import {getDashboardStats, DashboardStats} from "@/app/(web)/admin/dashboard/dashboard.action";
import {formatPersianCurrency, formatPersianNumber, toPersianDateTime} from "@/utils/format";
import Link from "next/link";

function KPICard({icon: Icon, label, value, color, growth}: {
  icon: any; label: string; value: string; color: string; growth?: number;
}) {
  return (
    <Card withBorder shadow="sm" radius="md" p="md" dir="rtl">
      <Group justify="space-between" mb="xs">
        <ThemeIcon color={color} variant="light" size="lg" radius="md">
          <Icon size="1.4rem"/>
        </ThemeIcon>
        {growth !== undefined && (
          <Badge color={growth >= 0 ? "green" : "red"} variant="light" size="sm">
            {growth >= 0 ? "+" : ""}{formatPersianNumber(growth)}%
          </Badge>
        )}
      </Group>
      <Text fw={700} size="xl">{value}</Text>
      <Text size="xs" c="dimmed" mt={4}>{label}</Text>
    </Card>
  );
}

function MiniBarChart({data, color = "#168aad"}: {data: {date: string; total: number}[]; color?: string}) {
  if (!data?.length) return <Text c="dimmed" ta="center" size="sm">داده‌ای موجود نیست</Text>;
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <ScrollArea w="100%">
      <div style={{display: "flex", gap: 2, alignItems: "flex-end", height: 180, minWidth: 600, paddingBottom: 20}}>
        {data.map((d) => {
          const h = Math.max((d.total / max) * 150, 2);
          return (
            <div key={d.date} style={{display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 18}}>
              <div style={{
                width: "100%", height: h, background: color, borderRadius: "4px 4px 0 0",
                opacity: d.total > 0 ? 1 : 0.2,
              }}/>
              <Text size={8} c="dimmed" mt={4}>{d.date.slice(5)}</Text>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function DonutChart({data}: {data: {name: string; total: number}[]}) {
  if (!data?.length) return <Text c="dimmed" ta="center" size="sm">داده‌ای موجود نیست</Text>;
  const total = data.reduce((s, d) => s + d.total, 0) || 1;
  const colors = ["#168aad", "#52b788", "#f4a261", "#e76f51", "#9d4edd"];
  let cumulative = 0;
  return (
    <Stack align="center" gap="xs">
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
        <text x={80} y={85} textAnchor="middle" fontSize={14} fill="#666">دسته‌ها</text>
      </svg>
      <Stack gap={4}>
        {data.map((d, i) => (
          <Group key={d.name} gap={6}>
            <div style={{width: 12, height: 12, borderRadius: 3, background: colors[i % colors.length]}}/>
            <Text size="xs">{d.name}: {formatPersianCurrency(d.total)}</Text>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
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
      <Stack gap="md" dir="rtl">
        <Skeleton height={120}/>
        <Skeleton height={200}/>
        <Skeleton height={300}/>
      </Stack>
    );
  }

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      <Group justify="space-between">
        <Title order={4}>داشبورد مدیریت</Title>
        <Badge color={isLive ? "green" : "gray"} variant="light" leftSection={
          <span style={{width: 8, height: 8, borderRadius: "50%", background: isLive ? "#22c55e" : "#999", display: "inline-block", animation: isLive ? "pulse 2s infinite" : "none"}}/>
        }>
          {isLive ? "زنده" : "غیرفعال"}
        </Badge>
      </Group>

      <style>{`@keyframes pulse {0%{opacity:1}50%{opacity:0.4}100%{opacity:1}}`}</style>

      <SimpleGrid cols={{base: 2, sm: 3, lg: 4}} spacing="md">
        <KPICard icon={IconUsers} label="کل کاربران" value={formatPersianNumber(stats.totalUsers)} color="blue" growth={stats.usersGrowth}/>
        <KPICard icon={IconShoppingCart} label="کل سفارشات" value={formatPersianNumber(stats.totalOrders)} color="teal"/>
        <KPICard icon={IconCurrencyDollar} label="کل فروش" value={formatPersianCurrency(stats.totalSales)} color="green"/>
        <KPICard icon={IconTrendingUp} label="درآمد امروز" value={formatPersianCurrency(stats.todayRevenue)} color="orange"/>
        <KPICard icon={IconCheck} label="تراکنش‌های موفق" value={formatPersianNumber(stats.successfulCount)} color="green"/>
        <KPICard icon={IconX} label="تراکنش‌های ناموفق" value={formatPersianNumber(stats.failedCount)} color="red"/>
        <KPICard icon={IconCurrencyDollar} label="کل سپرده‌ها" value={formatPersianCurrency(stats.totalDeposited)} color="cyan"/>
        <KPICard icon={IconActivity} label="کاربران فعال (۳۰ روز)" value={formatPersianNumber(stats.activeUsers30)} color="violet"/>
      </SimpleGrid>

      <SimpleGrid cols={{base: 1, lg: 2}} spacing="md">
        <Card withBorder shadow="sm" radius="md" p="md">
          <Group justify="space-between" mb="md">
            <Text fw={600}>روند فروش (۳۰ روز اخیر)</Text>
            <IconChartLine size="1.2rem" className="text-primary"/>
          </Group>
          <MiniBarChart data={stats.salesTrend}/>
        </Card>
        <Card withBorder shadow="sm" radius="md" p="md">
          <Text fw={600} mb="md">دسته‌های پرفروش</Text>
          <DonutChart data={stats.topCategories}/>
        </Card>
      </SimpleGrid>

      <Card withBorder shadow="sm" radius="md" p="md">
        <Group justify="space-between" mb="md">
          <Text fw={600}>وضعیت سفارشات</Text>
        </Group>
        <SimpleGrid cols={{base: 2, lg: 4}} spacing="sm">
          <Group justify="space-between" p="sm" style={{background: "#fff7e6", borderRadius: 8}}>
            <Text size="sm">در حال آماده‌سازی</Text><Badge color="orange">{formatPersianNumber(stats.pendingOrders)}</Badge>
          </Group>
          <Group justify="space-between" p="sm" style={{background: "#e6f4ff", borderRadius: 8}}>
            <Text size="sm">ارسال شده</Text><Badge color="blue">{formatPersianNumber(stats.sendedOrders)}</Badge>
          </Group>
          <Group justify="space-between" p="sm" style={{background: "#f6ffed", borderRadius: 8}}>
            <Text size="sm">تحویل شده</Text><Badge color="green">{formatPersianNumber(stats.completedOrders)}</Badge>
          </Group>
          <Group justify="space-between" p="sm" style={{background: "#fff1f0", borderRadius: 8}}>
            <Text size="sm">لغو شده</Text><Badge color="red">{formatPersianNumber(stats.canceledOrders)}</Badge>
          </Group>
        </SimpleGrid>
      </Card>

      <SimpleGrid cols={{base: 1, lg: 2}} spacing="md">
        <Card withBorder shadow="sm" radius="md" p="md">
          <Group justify="space-between" mb="sm">
            <Text fw={600}>آخرین سفارشات</Text>
            <Link href="/admin/orders"><Button size="xs" variant="light">مشاهده همه</Button></Link>
          </Group>
          <ScrollArea h={300}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>شماره</Table.Th><Table.Th>کاربر</Table.Th>
                  <Table.Th>مبلغ</Table.Th><Table.Th>تاریخ</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {stats.recentOrders.map((o: any) => (
                  <Table.Tr key={o.id}>
                    <Table.Td>{formatPersianNumber(o.id)}</Table.Td>
                    <Table.Td>{o.user?.name}</Table.Td>
                    <Table.Td>{formatPersianCurrency(o.payment?.amount || 0)}</Table.Td>
                    <Table.Td style={{fontSize: 11}}>{toPersianDateTime(o.created_at)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>
        <Card withBorder shadow="sm" radius="md" p="md">
          <Group justify="space-between" mb="sm">
            <Text fw={600}>آخرین تراکنش‌ها</Text>
            <Link href="/admin/transactions"><Button size="xs" variant="light">مشاهده همه</Button></Link>
          </Group>
          <ScrollArea h={300}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>شناسه</Table.Th><Table.Th>کاربر</Table.Th>
                  <Table.Th>مبلغ</Table.Th><Table.Th>وضعیت</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {stats.recentTransactions.map((t: any) => (
                  <Table.Tr key={t.id}>
                    <Table.Td style={{fontSize: 10}}>{t.id.slice(0, 12)}...</Table.Td>
                    <Table.Td>{t.user?.name}</Table.Td>
                    <Table.Td>{formatPersianCurrency(t.amount)}</Table.Td>
                    <Table.Td>
                      <Badge color={t.receipt ? "green" : "red"} size="sm">
                        {t.receipt ? "موفق" : "ناموفق"}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>
      </SimpleGrid>
    </div>
  );
}
