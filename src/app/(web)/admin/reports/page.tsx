"use client";

import React, {useEffect, useState, useCallback} from "react";
import {
  Card, Group, Stack, Text, Title, Button, Select,
  Skeleton, Table, ThemeIcon, TextInput, ScrollArea, SimpleGrid,
} from "@mantine/core";
import {
  IconFilter, IconDownload, IconPrinter,
  IconUsers, IconShoppingCart, IconCurrencyDollar, IconChartBar,
} from "@tabler/icons-react";
import {getReportData, ReportData} from "@/app/(web)/admin/reports/reports.action";
import styles from "./reports.module.css";
import {
  formatPersianCurrency, formatPersianNumber, toPersianDateTime,
  jalaliStringToDate, jalaliToday, jalaliDaysAgo,
  formatJalaliDateShort,
} from "@/utils/format";

function exportCSV(data: ReportData) {
  const rows: string[] = [];
  rows.push("بخش,مقدار");
  rows.push(`کاربران جدید,${data.newUsers}`);
  rows.push(`کاربران فعال,${data.activeUsers}`);
  rows.push(`مجموع فروش تحویل‌شده,${data.totalSales}`);
  rows.push(`بهای تمام‌شده کالا,${data.costOfGoods}`);
  rows.push(`سود خالص,${data.netProfit}`);
  rows.push(`تعداد سفارش,${data.orderCount}`);
  rows.push(`میانگین سفارش,${data.avgOrderValue}`);
  rows.push(`تراکنش موفق,${data.successfulCount}`);
  rows.push(`تراکنش ناموفق,${data.failedCount}`);
  rows.push(`نرخ موفقیت,${data.successRate}%`);
  rows.push("");
  rows.push("دسته,فروش");
  data.salesByCategory.forEach((c) => rows.push(`${c.name},${c.total}`));
  rows.push("");
  rows.push("کالا,تعداد,فروش,بهای تمام‌شده,سود خالص");
  data.salesByProduct.forEach((p) => rows.push(`${p.name},${p.quantity},${p.sales},${p.cost},${p.profit}`));
  const blob = new Blob(["\uFEFF" + rows.join("\n")], {type: "text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const presets: Record<string, () => {start: string; end: string}> = {
  today: () => ({start: jalaliToday(), end: jalaliToday()}),
  yesterday: () => ({start: jalaliDaysAgo(1), end: jalaliToday()}),
  last7: () => ({start: jalaliDaysAgo(7), end: jalaliToday()}),
  last30: () => ({start: jalaliDaysAgo(30), end: jalaliToday()}),
  last3months: () => ({start: jalaliDaysAgo(90), end: jalaliToday()}),
  lastYear: () => ({start: jalaliDaysAgo(365), end: jalaliToday()}),
};

function PersianDateInput({label, value, onChange, w}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  w?: number | string;
}) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    let digits = raw.replace(/[^\d/]/g, "");
    const parts = digits.split("/");
    if (parts.length > 3) {
      digits = parts.slice(0, 3).join("/");
    }
    setInputValue(digits);
    const parsed = digits.split("/").map(Number);
    if (parsed.length === 3 && parsed.every((n) => !isNaN(n) && n > 0)) {
      onChange(digits);
    }
  };

  return (
    <TextInput
      label={label}
      value={inputValue}
      onChange={handleChange}
      placeholder="۱۴۰۳/۰۱/۰۱"
      w={w}
      styles={{
        input: {fontVariantNumeric: "tabular-nums"},
      }}
    />
  );
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [preset, setPreset] = useState<string>("last30");
  const [startDate, setStartDate] = useState(jalaliDaysAgo(30));
  const [endDate, setEndDate] = useState(jalaliToday());
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");
  const [status, setStatus] = useState<string | undefined>(undefined);

  const fetchReport = useCallback(async () => {
    try {
      const startGreg = jalaliStringToDate(startDate).toISOString().split("T")[0];
      const endGreg = jalaliStringToDate(endDate).toISOString().split("T")[0];
      const result = await getReportData(startGreg, endGreg, groupBy, undefined, status);
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
    <div dir="rtl" className={`flex flex-col gap-4 ${styles.page}`}>
      <Title order={4}>گزارش سود و زیان</Title>

      <Card className={styles.filterCard} withBorder shadow="sm" radius="md" p="md">
        <Stack gap="sm">
          <Group className={styles.filters} gap="sm" wrap="wrap" grow>
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
              style={{minWidth: 140, flex: "1 1 140px"}}
            />
            <PersianDateInput label="تاریخ شروع (شمسی)" value={startDate} onChange={setStartDate} w={{base: "100%", xs: 150}}/>
            <PersianDateInput label="تاریخ پایان (شمسی)" value={endDate} onChange={setEndDate} w={{base: "100%", xs: 150}}/>
            <Select
              label="گروه‌بندی"
              value={groupBy}
              onChange={(v) => setGroupBy((v as any) || "day")}
              data={[
                {value: "day", label: "روزانه"},
                {value: "week", label: "هفتگی"},
                {value: "month", label: "ماهانه"},
              ]}
              style={{minWidth: 120, flex: "1 1 120px"}}
            />
            <Text size="sm" c="dimmed" style={{alignSelf: "end", paddingBottom: 10, minWidth: 180}}>مبنای گزارش: سفارش‌های نهایی‌شده و تحویل‌شده</Text>
          </Group>
          <Group className={styles.filterActions} gap="sm" wrap="wrap">
            <Button leftSection={<IconFilter size="1rem"/>} onClick={() => {setLoading(true); fetchReport()}}>اعمال فیلتر</Button>
            <Button variant="light" onClick={() => {setPreset("last30"); setStartDate(jalaliDaysAgo(30)); setEndDate(jalaliToday()); setStatus(undefined); setGroupBy("day")}}>بازنشانی</Button>
            <Button variant="light" leftSection={<IconDownload size="1rem"/>} onClick={() => data && exportCSV(data)} disabled={!data}>خروجی CSV</Button>
            <Button variant="light" leftSection={<IconPrinter size="1rem"/>} onClick={() => window.print()}>چاپ</Button>
          </Group>
        </Stack>
      </Card>

      <Group className={styles.lastUpdated} justify="flex-end">
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
            <StatCard icon={IconCurrencyDollar} label="مجموع فروش تحویل‌شده" value={formatPersianCurrency(data.totalSales)} color="green"/>
            <StatCard icon={IconCurrencyDollar} label="بهای تمام‌شده کالا" value={formatPersianCurrency(data.costOfGoods)} color="orange"/>
            <StatCard icon={IconChartBar} label="سود خالص" value={formatPersianCurrency(data.netProfit)} color="teal"/>
            <StatCard icon={IconUsers} label="نرخ موفقیت تراکنش" value={`${formatPersianNumber(data.successRate)}%`} color="cyan"/>
          </SimpleGrid>

          <SimpleGrid cols={{base: 1, sm: 2, lg: 4}} spacing="md">
            <StatCard icon={IconUsers} label="تراکنش موفق" value={formatPersianNumber(data.successfulCount)} color="green"/>
            <StatCard icon={IconCurrencyDollar} label="ارزش تراکنش موفق" value={formatPersianCurrency(data.successfulValue)} color="green"/>
            <StatCard icon={IconUsers} label="تراکنش ناموفق" value={formatPersianNumber(data.failedCount)} color="red"/>
            <StatCard icon={IconCurrencyDollar} label="ارزش تراکنش ناموفق" value={formatPersianCurrency(data.failedValue)} color="red"/>
          </SimpleGrid>

          <Card withBorder shadow="sm" radius="md" p="md">
            <Text fw={600} mb="md">فروش به تفکیک دسته</Text>
            <ScrollArea>
            <Table miw={400}>
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
            </ScrollArea>
          </Card>

          <Card withBorder shadow="sm" radius="md" p="md">
            <Text fw={600} mb="md">سود و زیان به تفکیک کالا</Text>
            <ScrollArea>
              <Table miw={720}>
                <Table.Thead><Table.Tr><Table.Th>کالا</Table.Th><Table.Th>تعداد</Table.Th><Table.Th>فروش</Table.Th><Table.Th>بهای تمام‌شده</Table.Th><Table.Th>سود خالص</Table.Th></Table.Tr></Table.Thead>
                <Table.Tbody>
                  {data.salesByProduct.length === 0 ? <Table.Tr><Table.Td colSpan={5}><Text c="dimmed" ta="center">در این بازه سفارش نهایی‌شده‌ای وجود ندارد</Text></Table.Td></Table.Tr> : data.salesByProduct.map((product) => (
                    <Table.Tr key={product.name}>
                      <Table.Td>{product.name}</Table.Td>
                      <Table.Td>{formatPersianNumber(product.quantity)}</Table.Td>
                      <Table.Td>{formatPersianCurrency(product.sales)}</Table.Td>
                      <Table.Td>{formatPersianCurrency(product.cost)}</Table.Td>
                      <Table.Td c={product.profit >= 0 ? "teal" : "red"}>{formatPersianCurrency(product.profit)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
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
                      <Text size={8} c="dimmed" mt={4}>{formatJalaliDateShort(d.date)}</Text>
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
                      <Text size={8} c="dimmed" mt={4}>{formatJalaliDateShort(d.date)}</Text>
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
