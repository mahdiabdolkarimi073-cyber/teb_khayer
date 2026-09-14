"use client";

import React, {useEffect, useState, useCallback} from "react";
import {
  ActionIcon, Badge, Button, Card, Group, Modal, Pagination, Select,
  Stack, Table, Text, TextInput, Title, Tooltip, NumberInput, ScrollArea,
  Divider, Timeline, ThemeIcon, SimpleGrid,
} from "@mantine/core";
import {
  IconSearch, IconFilter, IconDownload, IconEye, IconRefresh,
  IconCheck, IconX, IconClock, IconReceipt, IconUser, IconShoppingCart,
} from "@tabler/icons-react";
import {getTransactionDetail, getTransactions, TransactionResult} from "@/app/(web)/admin/transactions/transactions.action";
import {formatPersianCurrency, formatPersianNumber, toPersianDateTime, daysAgo} from "@/utils/format";
import Link from "next/link";

const statusOptions = [
  {value: "all", label: "همه"},
  {value: "successful", label: "موفق"},
  {value: "failed", label: "ناموفق"},
  {value: "pending", label: "در انتظار"},
];

function statusLabel(receipt: string | null) {
  return receipt ? "موفق" : "ناموفق";
}

function statusColor(receipt: string | null) {
  return receipt ? "green" : "red";
}

function exportCSV(rows: any[]) {
  const header = "شناسه,کاربر,تلفن,مبلغ,وضعیت,تاریخ";
  const body = rows.map((t) => [t.id, t.user?.name || "", t.user?.phone || "", t.amount, statusLabel(t.receipt), toPersianDateTime(t.created_at)].join(","));
  const blob = new Blob(["\uFEFF" + [header, ...body].join("\n")], {type: "text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TransactionsPage() {
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "successful" | "failed" | "pending">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState<number | string>("");
  const [maxAmount, setMaxAmount] = useState<number | string>("");
  const [selected, setSelected] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lastHourCount, setLastHourCount] = useState(0);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTransactions(
        page,
        limit,
        search || undefined,
        status,
        startDate || undefined,
        endDate || undefined,
        minAmount === "" ? undefined : Number(minAmount),
        maxAmount === "" ? undefined : Number(maxAmount),
      );
      setResult(data);
      setLastHourCount(data.lastHourCount);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, startDate, endDate, minAmount, maxAmount]);

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 30000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const detail = await getTransactionDetail(id);
      setSelected(detail);
    } finally {
      setDetailLoading(false);
    }
  };

  const reset = () => {
    setSearch("");
    setStatus("all");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    setPage(1);
  };

  const rows = result?.data || [];
  const from = result && result.total > 0 ? (page - 1) * limit + 1 : 0;
  const to = result ? Math.min(page * limit, result.total) : 0;

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      <Group justify="space-between">
        <Title order={4}>گزارش کامل تراکنش‌ها</Title>
        <Badge color="blue" variant="light" leftSection={<IconActivityDot/>}>
          {formatPersianNumber(lastHourCount)} تراکنش در یک ساعت اخیر
        </Badge>
      </Group>

      <Card withBorder shadow="sm" radius="md" p="md" style={{position: "sticky", top: 8, zIndex: 2}}>
        <Stack gap="sm">
          <Group align="flex-end" gap="sm" wrap="wrap">
            <TextInput label="جستجو" placeholder="نام، تلفن یا شناسه..." leftSection={<IconSearch size="1rem"/>} value={search} onChange={(e) => setSearch(e.target.value)} w={230}/>
            <Select label="وضعیت پرداخت" data={statusOptions} value={status} onChange={(v) => setStatus((v as any) || "all")} w={150}/>
            <TextInput label="از تاریخ" placeholder="۱۴۰۳/۰۱/۰۱" value={startDate} onChange={(e) => setStartDate(e.target.value)} w={130}/>
            <TextInput label="تا تاریخ" placeholder="۱۴۰۳/۱۲/۲۹" value={endDate} onChange={(e) => setEndDate(e.target.value)} w={130}/>
            <NumberInput label="حداقل مبلغ" placeholder="تومان" value={minAmount} onChange={setMinAmount} w={130}/>
            <NumberInput label="حداکثر مبلغ" placeholder="تومان" value={maxAmount} onChange={setMaxAmount} w={130}/>
          </Group>
          <Group gap="sm">
            <Button leftSection={<IconFilter size="1rem"/>} onClick={() => {setPage(1); fetchTransactions()}}>اعمال فیلتر</Button>
            <Button variant="light" leftSection={<IconRefresh size="1rem"/>} onClick={reset}>بازنشانی</Button>
            <Button variant="light" leftSection={<IconDownload size="1rem"/>} disabled={!rows.length} onClick={() => exportCSV(rows)}>خروجی CSV</Button>
          </Group>
        </Stack>
      </Card>

      <Card withBorder shadow="sm" radius="md" p={0}>
        <ScrollArea>
          <Table striped highlightOnHover miw={900}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>شناسه تراکنش</Table.Th>
                <Table.Th>شماره سفارش</Table.Th>
                <Table.Th>کاربر</Table.Th>
                <Table.Th>مبلغ</Table.Th>
                <Table.Th>درگاه</Table.Th>
                <Table.Th>تاریخ</Table.Th>
                <Table.Th>وضعیت پرداخت</Table.Th>
                <Table.Th>وضعیت سفارش</Table.Th>
                <Table.Th>جزئیات</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr><Table.Td colSpan={10}><Text ta="center" p="xl">در حال دریافت اطلاعات...</Text></Table.Td></Table.Tr>
              ) : rows.length === 0 ? (
                <Table.Tr><Table.Td colSpan={10}><Text ta="center" c="dimmed" p="xl">تراکنشی پیدا نشد</Text></Table.Td></Table.Tr>
              ) : rows.map((t: any, index: number) => (
                <Table.Tr key={t.id}>
                  <Table.Td>{formatPersianNumber((page - 1) * limit + index + 1)}</Table.Td>
                  <Table.Td>
                    <Button variant="subtle" size="compact-xs" onClick={() => openDetail(t.id)}>{t.id.slice(0, 13)}...</Button>
                  </Table.Td>
                  <Table.Td>
                    {t.order ? <Link href={`/admin/orders?order=${t.order.id}`} className="text-primary">{formatPersianNumber(t.order.id)}</Link> : "-"}
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={0}><Text size="sm">{t.user?.name || "-"}</Text><Text size="xs" c="dimmed">{t.user?.phone || "-"}</Text></Stack>
                  </Table.Td>
                  <Table.Td>{formatPersianCurrency(t.amount)}</Table.Td>
                  <Table.Td><Badge variant="light">سپهر</Badge></Table.Td>
                  <Table.Td style={{fontSize: 11}}>{toPersianDateTime(t.created_at)}</Table.Td>
                  <Table.Td><Badge color={statusColor(t.receipt)}>{statusLabel(t.receipt)}</Badge></Table.Td>
                  <Table.Td>{t.order ? <Badge color={t.order.status === "CANCELED" ? "red" : "blue"}>{t.order.status}</Badge> : "-"}</Table.Td>
                  <Table.Td>
                    <Tooltip label="مشاهده جزئیات"><ActionIcon variant="light" onClick={() => openDetail(t.id)}><IconEye size="1rem"/></ActionIcon></Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        <Group justify="space-between" p="md">
          <Text size="sm" c="dimmed">نمایش {formatPersianNumber(from)} تا {formatPersianNumber(to)} از {formatPersianNumber(result?.total || 0)} تراکنش</Text>
          <Group gap="sm">
            <Select size="xs" value={String(limit)} onChange={(v) => {setLimit(Number(v)); setPage(1)}} data={["10", "25", "50", "100"]} w={80}/>
            <Pagination size="sm" total={Math.ceil((result?.total || 0) / limit)} value={page} onChange={setPage}/>
          </Group>
        </Group>
      </Card>

      <Modal opened={!!selected} onClose={() => setSelected(null)} title="جزئیات تراکنش" centered size="lg" dir="rtl">
        {detailLoading ? <Text ta="center">در حال دریافت...</Text> : selected && <TransactionDetail transaction={selected}/>} 
      </Modal>
    </div>
  );
}

function TransactionDetail({transaction}: {transaction: any}) {
  return (
    <Stack gap="md">
      <SimpleGrid cols={{base: 1, sm: 2}}>
        <Info label="شناسه تراکنش" value={transaction.id}/>
        <Info label="مبلغ" value={formatPersianCurrency(transaction.amount)}/>
        <Info label="وضعیت پرداخت" value={statusLabel(transaction.receipt)}/>
        <Info label="تاریخ" value={toPersianDateTime(transaction.created_at)}/>
        <Info label="کاربر" value={transaction.user?.name || "-"}/>
        <Info label="تلفن" value={String(transaction.user?.phone || "-")}/>
      </SimpleGrid>
      <Divider label="سفارش" labelPosition="right"/>
      {transaction.order ? (
        <Stack gap="xs">
          <Group><IconShoppingCart size="1rem"/><Text>شماره سفارش: {formatPersianNumber(transaction.order.id)}</Text></Group>
          <Text size="sm">وضعیت: {transaction.order.status}</Text>
          {transaction.order.products?.map((item: any) => (
            <Group key={item.id} justify="space-between" p="xs" style={{background: "#f8f9fa", borderRadius: 6}}>
              <Text size="sm">{item.product?.name}</Text><Badge>{formatPersianNumber(item.count)} عدد</Badge>
            </Group>
          ))}
        </Stack>
      ) : <Text c="dimmed">سفارش مرتبطی ثبت نشده است</Text>}
      <Divider label="رویدادها" labelPosition="right"/>
      <Timeline active={transaction.receipt ? 2 : 1} bulletSize={24} lineWidth={2}>
        <Timeline.Item bullet={<IconReceipt size="0.8rem"/>} title="ایجاد تراکنش"><Text size="xs" c="dimmed">{toPersianDateTime(transaction.created_at)}</Text></Timeline.Item>
        <Timeline.Item bullet={transaction.receipt ? <IconCheck size="0.8rem"/> : <IconX size="0.8rem"/>} title={transaction.receipt ? "پرداخت موفق" : "پرداخت ناموفق"}/>
      </Timeline>
    </Stack>
  );
}

function Info({label, value}: {label: string; value: string}) {
  return <div><Text size="xs" c="dimmed">{label}</Text><Text size="sm" fw={500} style={{wordBreak: "break-word"}}>{value}</Text></div>;
}

function IconActivityDot() {
  return <span style={{display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#22c55e"}}/>;
}
