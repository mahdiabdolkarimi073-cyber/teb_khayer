"use client";

import React, {useEffect, useState, useCallback} from "react";
import {
  Card, Grid, Group, Stack, Text, Title, Button, Select, Badge,
  Skeleton, Table, ThemeIcon, TextInput, Divider, ScrollArea, SimpleGrid,
} from "@mantine/core";
import {
  IconFilter, IconDownload, IconPrinter,
  IconUsers, IconShoppingCart, IconCurrencyDollar, IconChartBar,
} from "@tabler/icons-react";
import {getReportData, ReportData} from "@/app/(web)/admin/reports/reports.action";
import {formatPersianCurrency, formatPersianNumber, toPersianDateTime, daysAgo} from "@/utils/format";

function exportCSV(data: ReportData) {
  const rows: string[] = [];
  rows.push("بخش,مقدار");
  rows.push(`کاربران جدید,${data.newUsers}`);
  rows.push(`کاربران فعال,${data.activeUsers}`);
  rows.push(`کل فروش,${data.totalSales}`);
  rows.push(`تعداد سفارش,${data.orderCount}`);
  rows.push(`میانگین سفارش,${data.avgOrderValue}`);
  rows.push(`تراکنش موفق,${data.successfulCount}`);
  rows.push(`تراکنش ناموفق,${data.failedCount}`);
  rows.push(`نرخ موفقیت,${data.successRate}%`);
  rows.push("");
  rows.push("دسته,فروش");
  data.salesByCategory.forEach((c) => rows.push(`${c.name},${c.total}`));
  const blob = new Blob(["\uFEFF" + rows.join("\n")], {type: "text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const presets: Record<string, () => {start: string; end: string}> = {
  today: () => {const d = new Date(); return {start: d.toISOString().split("T")[0], end: d.toISOString().split("T")[0]}},
  yesterday: () => {const d = daysAgo(1); const e = daysAgo(0); return {start: d.toISOString().split("T")[0], end: e.toISOString().split("T")[0]}},
  last7: () => ({start: daysAgo(7).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0]}),
  last30: () => ({start: daysAgo(30).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0]}),
  last3months: () => ({start: daysAgo(90).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0]}),
  lastYear: () => ({start: daysAgo(365).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0]}),
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [preset, setPreset] = useState<string>("last30");
  const [startDate, setStartDate] = useState(daysAgo(30).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");

  const fetchReport = useCallback(async () => {
    try {
      const result = await getReportData(startDate, endDate, groupBy, undefined, status);
      setData(result);
      setLastUpdated(toPersianDateTime(new Date()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, groupBy, status]);

  useEffect(() => {
    setLoading(true);
    fetchReport();
    const interval = setInterval(fetchReport, 30000);
    return () => clearInterval(interval);
  }, [fetchReport]);

  const applyPreset = (key: string) => {
    setPreset(key);
    if (key !== "custom") {
      const {start, end} = presets[key]();
      setStartDate(start);
      setEndDate(end);
    }
  };

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      <Title order={4}>گزارش‌های مالی و آماری</Title>

      <Card withBorder shadow="sm" radius="md" p="md">
        <Stack gap="sm">
          <Group gap="sm" wrap="wrap">
            <Select
              label="بازه پیش‌فرض"
              value={preset}
              onChange={(v) => applyPreset(v || "last30")}
              data={[
                {value: "today", label: "امروز"},
                {value: "yesterday", label: "دیروز"},
                {value: "last7", label: "۷ روز اخیر"},
                {value: "last30", label: "۳۰ روز اخیر"},
                {value: "last3months", label: "۳ ماه اخیر"},
                {value: "lastYear", label: "سال گذشته"},
                {value: "custom", label: "دلخواه"},
              ]}
              w={200}
            />
            <TextInput label="تاریخ شروع" value={startDate} onChange={(e) => setStartDate(e.target.value)} w={150}/>
            <TextInput label="تاریخ پایان" value={endDate} onChange={(e) => setEndDate(e.target.value)} w={150}/>
            <Select
              label="گروه‌بندی"
              value={groupBy}
              onChange={(v) => setGroupBy((v as any) || "day")}
              data={[
                {value: "day", label: "روزانه"},
                {value: "week", label: "هفتگی"},
                {value: "month", label: "ماهانه"},
              ]}
              w={150}
            />
            <Select
              label="وضعیت سفارش"
              value={status}
              onChange={(v) => setStatus(v || undefined)}
              data={[
                {value: "", label: "همه"},
                {value: "PENDING", label: "در حال آماده‌سازی"},
                {value: "SENDED", label: "ارسال شده"},
                {value: "DELAY", label: "تحویل شده"},
                {value: "CANCELED", label: "لغو شده"},
              ]}
              w={150}
            />
          </Group>
          <Group gap="sm">
            <Button leftSection={<IconFilter size="1rem"/>} onClick={() => {setLoading(true); fetchReport()}}>اعمال فیلتر</Button>
            <Button variant="light" onClick={() => {setPreset("last30"); setStartDate(daysAgo(30).toISOString().split("T")[0]); setEndDate(new Date().toISOString().split("T")[0]); setStatus(undefined); setGroupBy("day")}}>بازنشانی</Button>
            <Button variant="light" leftSection={<IconDownload size="1rem"/>} onClick={() => data && exportCSV(data)} disabled={!data}>خروجی CSV</Button>
            <Button variant="light" leftSection={<IconPrinter size="1rem"/>} onClick={() => window.print()}>چاپ</Button>
          </Group>
        </Stack>
      </Card>

      <Group justify="flex-end">
        <Text size="xs" c="dimmed">آخرین به‌روزرسانی: {lastUpdated}</Text>
      </Group>

      {loading || !data ? (
        <Stack gap="md">
          <Skeleton height={120}/>
          <Skeleton height={120}/>
          <Skeleton height={200}/>
        </Stack>
      ) : (
        <>
          <SimpleGrid cols={{base: 1, sm: 2, lg: 4}} spacing="md">
            <StatCard icon={IconUsers} label="کاربران جدید" value={formatPersianNumber(data.newUsers)} color="blue"/>
            <StatCard icon={IconUsers} label="کاربران فعال" value={formatPersianNumber(data.activeUsers)} color="teal"/>
            <StatCard icon={IconShoppingCart} label="تعداد سفارش" value={formatPersianNumber(data.orderCount)} color="orange"/>
            <StatCard icon={IconCurrencyDollar} label="میانگین سفارش" value={formatPersianCurrency(data.avgOrderValue)} color="cyan"/>
          </SimpleGrid>

          <SimpleGrid cols={{base: 1, sm: 2, lg: 4}} spacing="md">
            <StatCard icon={IconCurrencyDollar} label="کل فروش" value={formatPersianCurrency(data.totalSales)} color="green"/>
            <StatCard icon={IconCurrencyDollar} label="کل سپرده‌ها" value={formatPersianCurrency(data.totalDeposited)} color="violet"/>
            <StatCard icon={IconChartBar} label="نرخ موفقیت" value={`${formatPersianNumber(data.successRate)}%`} color="green"/>
            <StatCard icon={IconCurrencyDollar} label="درآمد خالص" value={formatPersianCurrency(data.netRevenue)} color="teal"/>
          </SimpleGrid>

          <SimpleGrid cols={{base: 1, sm: 2, lg: 4}} spacing="md">
            <StatCard icon={IconUsers} label="تراکنش موفق" value={formatPersianNumber(data.successfulCount)} color="green"/>
            <StatCard icon={IconCurrencyDollar} label="ارزش تراکنش موفق" value={formatPersianCurrency(data.successfulValue)} color="green"/>
            <StatCard icon={IconUsers} label="تراکنش ناموفق" value={formatPersianNumber(data.failedCount)} color="red"/>
            <StatCard icon={IconCurrencyDollar} label="ارزش تراکنش ناموفق" value={formatPersianCurrency(data.failedValue)} color="red"/>
          </SimpleGrid>

          <Card withBorder shadow="sm" radius="md" p="md">
            <Text fw={600} mb="md">فروش به تفکیک دسته</Text>
            <Table>
              <Table.Thead>
                <Table.Tr><Table.Th>دسته</Table.Th><Table.Th>مبلغ فروش</Table.Th></Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.salesByCategory.length === 0 ? (
                  <Table.Tr><Table.Td colSpan={2}><Text c="dimmed" ta="center">داده‌ای موجود نیست</Text></Table.Td></Table.Tr>
                ) : data.salesByCategory.map((c) => (
                  <Table.Tr key={c.name}>
                    <Table.Td>{c.name}</Table.Td>
                    <Table.Td>{formatPersianCurrency(c.total)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>

          <Card withBorder shadow="sm" radius="md" p="md">
            <Text fw={600} mb="md">روند کاربران</Text>
            <ScrollArea>
              <div style={{display: "flex", gap: 2, alignItems: "flex-end", height: 150, minWidth: 500}}>
                {data.userGrowth.map((d) => {
                  const max = Math.max(...data.userGrowth.map((x) => x.count), 1);
                  return (
                    <div key={d.date} style={{flex: 1, minWidth: 20, display: "flex", flexDirection: "column", alignItems: "center"}}>
                      <div style={{width: "80%", height: Math.max((d.count / max) * 120, 2), background: "#52b788", borderRadius: "4px 4px 0 0"}}/>
                      <Text size={8} c="dimmed" mt={4}>{d.date.slice(5)}</Text>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </Card>

          <Card withBorder shadow="sm" radius="md" p="md">
            <Text fw={600} mb="md">روند فروش</Text>
            <ScrollArea>
              <div style={{display: "flex", gap: 2, alignItems: "flex-end", height: 150, minWidth: 500}}>
                {data.salesTrend.map((d) => {
                  const max = Math.max(...data.salesTrend.map((x) => x.total), 1);
                  return (
                    <div key={d.date} style={{flex: 1, minWidth: 20, display: "flex", flexDirection: "column", alignItems: "center"}}>
                      <div style={{width: "80%", height: Math.max((d.total / max) * 120, 2), background: "#168aad", borderRadius: "4px 4px 0 0"}}/>
                      <Text size={8} c="dimmed" mt={4}>{d.date.slice(5)}</Text>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </Card>
        </>
      )}
    </div>
  );
}

function StatCard({icon: Icon, label, value, color}: {icon: any; label: string; value: string; color: string}) {
  return (
    <Card withBorder shadow="sm" radius="md" p="md">
      <Group justify="space-between" mb="xs">
        <ThemeIcon color={color} variant="light" size="lg" radius="md"><Icon size="1.4rem"/></ThemeIcon>
      </Group>
      <Text fw={700} size="lg">{value}</Text>
      <Text size="xs" c="dimmed" mt={4}>{label}</Text>
    </Card>
  );
}

