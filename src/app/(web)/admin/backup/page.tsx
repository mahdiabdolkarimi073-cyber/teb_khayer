"use client";

import React, {useEffect, useState, useCallback} from "react";
import {
  ActionIcon, Badge, Button, Card, Group, Modal, Progress, Stack,
  Table, Text, Title, Tooltip, Skeleton, Alert,
} from "@mantine/core";
import {IconDatabase, IconDownload, IconRefresh, IconTrash, IconHistory, IconAlertTriangle} from "@tabler/icons-react";
import {toast} from "react-toastify";
import {toPersianDateTime, formatPersianNumber} from "@/utils/format";

interface BackupItem {
  id: string;
  fileName: string;
  size: number;
  created_at: string;
  status: string;
}

interface LogItem {
  id: number;
  action: string;
  status: string;
  fileName: string | null;
  fileSize: number | null;
  message: string | null;
  created_at: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${formatPersianNumber(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [restoreTarget, setRestoreTarget] = useState<BackupItem | null>(null);
  const [restoring, setRestoring] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [backupRes, logRes] = await Promise.all([
        fetch("/api/admin/backup/list"),
        fetch("/api/admin/backup/logs"),
      ]);
      if (backupRes.ok) setBackups(await backupRes.json());
      if (logRes.ok) setLogs(await logRes.json());
    } catch {
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleCreate = async () => {
    setCreating(true);
    setProgress(10);
    try {
      const res = await fetch("/api/admin/backup/create", {method: "POST"});
      setProgress(70);
      if (res.ok) {
        toast.success("نسخه پشتیبان با موفقیت ایجاد شد");
        await fetchAll();
      } else {
        toast.error("خطا در ایجاد نسخه پشتیبان");
      }
      setProgress(100);
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setTimeout(() => setProgress(0), 1000);
      setCreating(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      const res = await fetch("/api/admin/backup/delete", {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({fileName}),
      });
      if (res.ok) {
        toast.success("نسخه پشتیبان حذف شد");
        await fetchAll();
      } else {
        toast.error("خطا در حذف");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      const res = await fetch("/api/admin/backup/restore", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({fileName: restoreTarget.fileName}),
      });
      if (res.ok) {
        toast.success("بازیابی با موفقیت انجام شد");
        setRestoreTarget(null);
        await fetchAll();
      } else {
        toast.error("خطا در بازیابی");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setRestoring(false);
    }
  };

  const handleDownload = (fileName: string) => {
    window.open(`/api/admin/backup/download?id=${encodeURIComponent(fileName)}`, "_blank");
  };

  const lastBackup = backups[0];

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      <Group justify="space-between">
        <Title order={4}>سیستم پشتیبان‌گیری و بازیابی</Title>
        <Button leftSection={<IconDatabase size="1rem"/>} loading={creating} onClick={handleCreate}>
          ایجاد Backup جدید
        </Button>
      </Group>

      {progress > 0 && (
        <Progress value={progress} animated color="blue" size="lg" radius="md"/>
      )}

      {lastBackup && (
        <Alert color="green" variant="light">
          آخرین نسخه پشتیبان موفق: {toPersianDateTime(lastBackup.created_at)} ({formatSize(lastBackup.size)})
        </Alert>
      )}

      <Card withBorder shadow="sm" radius="md" p="md">
        <Text fw={600} mb="md">لیست نسخه‌های پشتیبان</Text>
        {loading ? (
          <Stack gap="xs">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} height={40}/>)}</Stack>
        ) : backups.length === 0 ? (
          <Text c="dimmed" ta="center" p="xl">هنوز نسخه پشتیبانی ایجاد نشده است</Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>نام فایل</Table.Th>
                <Table.Th>تاریخ</Table.Th>
                <Table.Th>حجم</Table.Th>
                <Table.Th>وضعیت</Table.Th>
                <Table.Th>عملیات</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {backups.map((b) => (
                <Table.Tr key={b.id}>
                  <Table.Td style={{fontSize: 11, wordBreak: "break-all"}}>{b.fileName}</Table.Td>
                  <Table.Td style={{fontSize: 11}}>{toPersianDateTime(b.created_at)}</Table.Td>
                  <Table.Td>{formatSize(b.size)}</Table.Td>
                  <Table.Td><Badge color="green" size="sm">موفق</Badge></Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <Tooltip label="دانلود"><ActionIcon variant="light" onClick={() => handleDownload(b.fileName)}><IconDownload size="1rem"/></ActionIcon></Tooltip>
                      <Tooltip label="بازیابی"><ActionIcon variant="light" color="orange" onClick={() => setRestoreTarget(b)}><IconRefresh size="1rem"/></ActionIcon></Tooltip>
                      <Tooltip label="حذف"><ActionIcon variant="light" color="red" onClick={() => handleDelete(b.fileName)}><IconTrash size="1rem"/></ActionIcon></Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <Card withBorder shadow="sm" radius="md" p="md">
        <Group gap="sm" mb="md">
          <IconHistory size="1.2rem"/>
          <Text fw={600}>لاگ‌های اخیر</Text>
        </Group>
        {logs.length === 0 ? (
          <Text c="dimmed" ta="center" p="md">لاگی موجود نیست</Text>
        ) : (
          <Table striped>
            <Table.Thead>
              <Table.Tr><Table.Th>عملیات</Table.Th><Table.Th>وضعیت</Table.Th><Table.Th>فایل</Table.Th><Table.Th>تاریخ</Table.Th></Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {logs.map((log) => (
                <Table.Tr key={log.id}>
                  <Table.Td>{log.action === "create" ? "ایجاد" : log.action === "restore" ? "بازیابی" : "حذف"}</Table.Td>
                  <Table.Td><Badge color={log.status === "success" ? "green" : "red"} size="sm">{log.status === "success" ? "موفق" : "ناموفق"}</Badge></Table.Td>
                  <Table.Td style={{fontSize: 11, wordBreak: "break-all"}}>{log.fileName || "-"}</Table.Td>
                  <Table.Td style={{fontSize: 11}}>{toPersianDateTime(log.created_at)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <Modal opened={!!restoreTarget} onClose={() => setRestoreTarget(null)} title="تأیید بازیابی" centered dir="rtl">
        <Stack gap="md">
          <Alert color="red" variant="light" icon={<IconAlertTriangle size="1.5rem"/>}>
            <Text fw={600}>هشدار: تمام داده‌های فعلی با محتوای این نسخه پشتیبان جایگزین خواهد شد.</Text>
          </Alert>
          <Text size="sm">
            فایل: {restoreTarget?.fileName}<br/>
            تاریخ: {restoreTarget ? toPersianDateTime(restoreTarget.created_at) : ""}
          </Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setRestoreTarget(null)}>انصراف</Button>
            <Button color="orange" loading={restoring} onClick={handleRestore}>تأیید بازیابی</Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
