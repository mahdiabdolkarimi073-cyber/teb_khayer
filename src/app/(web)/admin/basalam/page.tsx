"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Alert, Badge, Button, Card, Group, Stack, Switch, Text, TextInput, Title, Divider, ThemeIcon, Code, Progress, SimpleGrid,
} from "@mantine/core";
import {
  IconCheck, IconX, IconRefresh, IconSync, IconShoppingBag, IconPackage, IconTruck, IconLink, IconAlertCircle,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import {
  getBasalamConfig, saveBasalamConfig, getBasalamStatus, testBasalamConnection,
  syncProductsToBasalam, syncInventoryToBasalam, syncOrdersFromBasalam,
  getOAuthUrl, type BasalamConfig, type BasalamStatus,
} from "@/app/(web)/admin/basalam/basalam.action";
import type { SyncResult } from "@backend/modules/basalam/BasalamSync";

export default function BasalamAdminPage() {
  const [config, setConfig] = useState<BasalamConfig | null>(null);
  const [status, setStatus] = useState<BasalamStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const load = useCallback(async () => {
    try {
      const [cfg, st] = await Promise.all([getBasalamConfig(), getBasalamStatus()]);
      setConfig(cfg);
      setStatus(st);
    } catch {
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await saveBasalamConfig(config);
      await load();
      toast.success("تنظیمات ذخیره شد");
    } catch {
      toast.error("خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await testBasalamConnection();
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      await load();
    } catch {
      toast.error("خطا در تست اتصال");
    } finally {
      setTesting(false);
    }
  };

  const handleOAuth = async () => {
    try {
      const origin = window.location.origin;
      const redirectUri = `${origin}/api/basalam/oauth/callback`;
      const url = await getOAuthUrl(redirectUri);
      window.location.href = url;
    } catch {
      toast.error("خطا در ساخت لینک OAuth");
    }
  };

  const handleSync = async (type: "products" | "inventory" | "orders") => {
    setSyncing(type);
    setSyncResult(null);
    try {
      let result: SyncResult;
      if (type === "products") result = await syncProductsToBasalam();
      else if (type === "inventory") result = await syncInventoryToBasalam();
      else result = await syncOrdersFromBasalam();

      setSyncResult(result);
      if (result.errors > 0) toast.warning(`هماهنگ‌سازی کامل نبود (${result.synced} موفق، ${result.errors} خطا)`);
      else toast.success(`${result.synced} مورد هماهنگ شد`);
    } catch {
      toast.error("خطا در هماهنگ‌سازی");
    } finally {
      setSyncing(null);
    }
  };

  if (loading) return <Text c="dimmed">در حال بارگذاری...</Text>;

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      <Group justify="space-between">
        <Group gap="sm">
          <ThemeIcon variant="light" color="orange" size="lg" radius="md">
            <IconShoppingBag size="1.4rem" />
          </ThemeIcon>
          <Title order={4}>اتصال به باسلام (Basalam)</Title>
        </Group>
        {status && (
          <Badge color={status.configured ? "green" : "red"} variant="light" size="lg">
            {status.configured ? "پیکربندی شده" : "پیکربندی نشده"}
          </Badge>
        )}
      </Group>

      <Alert color="blue" variant="light" icon={<IconAlertCircle size="1.2rem" />}>
        باسلام یک پلتفرم فروشگاهی ایرانی است. با اتصال به Salam API می‌توانید محصولات، قیمت‌ها و موجودی خود را
        با غرفه باسلام هماهنگ کنید و سفارش‌ها را مدیریت نمایید. برای احراز هویت از OAuth 2.0 یا توکن شخصی (PAT) استفاده کنید.
      </Alert>

      {status?.connectionTest && (
        <Alert color={status.connectionTest.success ? "green" : "red"} variant="light"
          icon={status.connectionTest.success ? <IconCheck size="1.2rem" /> : <IconX size="1.2rem" />}>
          {status.connectionTest.message}
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <Card withBorder shadow="sm" radius="md" p="md">
          <Title order={5} mb="md">تنظیمات احراز هویت</Title>
          <Stack gap="sm">
            <Switch
              label="باسلام فعال است"
              checked={config?.enabled || false}
              onChange={(e) => setConfig({ ...config!, enabled: e.currentTarget.checked })}
            />
            <Divider label="OAuth 2.0" labelPosition="center" />
            <TextInput
              label="Client ID"
              value={config?.clientId || ""}
              onChange={(e) => setConfig({ ...config!, clientId: e.target.value })}
              placeholder="شناسه کلاینت از پنل توسعه‌دهندگان باسلام"
            />
            <TextInput
              label="Client Secret"
              type="password"
              value={config?.clientSecret || ""}
              onChange={(e) => setConfig({ ...config!, clientSecret: e.target.value })}
              placeholder="رمز کلاینت"
            />
            <TextInput
              label="شناسه غرفه (Booth ID)"
              value={config?.boothId || ""}
              onChange={(e) => setConfig({ ...config!, boothId: e.target.value })}
              placeholder="شناسه غرفه باسلام"
            />
            <Button variant="light" leftSection={<IconLink size="1rem" />} onClick={handleOAuth} disabled={!config?.clientId}>
              اتصال با OAuth
            </Button>
            <Divider label="توکن شخصی (PAT)" labelPosition="center" />
            <TextInput
              label="Personal Access Token"
              type="password"
              value={config?.patToken || ""}
              onChange={(e) => setConfig({ ...config!, patToken: e.target.value })}
              placeholder="توکن شخصی از پنل باسلام"
            />
            <TextInput
              label="Access Token (خودکار)"
              type="password"
              value={config?.accessToken || ""}
              readOnly
              styles={{ input: { fontFamily: "monospace", fontSize: "0.75rem" } }}
            />
            <TextInput
              label="Refresh Token (خودکار)"
              type="password"
              value={config?.refreshToken || ""}
              readOnly
              styles={{ input: { fontFamily: "monospace", fontSize: "0.75rem" } }}
            />
          </Stack>
        </Card>

        <Stack gap="md">
          <Card withBorder shadow="sm" radius="md" p="md">
            <Title order={5} mb="md">لینک عمومی باسلام</Title>
            <TextInput
              label="لینک کانال/غرفه باسلام"
              value={config?.basalamLink || ""}
              onChange={(e) => setConfig({ ...config!, basalamLink: e.target.value })}
              placeholder="https://basalam.com/your-booth"
            />
            <Text size="xs" c="dimmed" mt="xs">
              این لینک در صفحه تماس با ما و فوتر سایت نمایش داده می‌شود.
            </Text>
          </Card>

          <Card withBorder shadow="sm" radius="md" p="md">
            <Title order={5} mb="md">وضعیت اتصال</Title>
            {status && (
              <Stack gap="xs">
                <StatusRow label="پیکربندی شده" ok={status.configured} />
                <StatusRow label="فعال" ok={status.enabled} />
                <StatusRow label="توکن موجود" ok={status.hasToken} />
                <StatusRow label="غرفه مشخص شده" ok={status.hasBooth} />
              </Stack>
            )}
            <Group gap="sm" mt="md">
              <Button variant="light" leftSection={<IconRefresh size="1rem" />} loading={testing} onClick={handleTest}>
                تست اتصال
              </Button>
              <Button variant="filled" loading={saving} onClick={handleSave}>
                ذخیره تنظیمات
              </Button>
            </Group>
          </Card>
        </Stack>
      </SimpleGrid>

      <Divider my="sm" label="هماهنگ‌سازی" labelPosition="center" />

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Card withBorder shadow="sm" radius="md" p="md" className="flex flex-col gap-3">
          <Group gap="sm">
            <ThemeIcon variant="light" color="blue" size="lg" radius="md"><IconPackage size="1.2rem" /></ThemeIcon>
            <Text fw={600}>هماهنگ‌سازی محصولات</Text>
          </Group>
          <Text size="sm" c="dimmed">ارسال تمام محصولات به غرفه باسلام (ایجاد و به‌روزرسانی)</Text>
          <Button leftSection={<IconSync size="1rem" />} loading={syncing === "products"} onClick={() => handleSync("products")} disabled={!status?.enabled}>
            شروع هماهنگ‌سازی
          </Button>
        </Card>

        <Card withBorder shadow="sm" radius="md" p="md" className="flex flex-col gap-3">
          <Group gap="sm">
            <ThemeIcon variant="light" color="green" size="lg" radius="md"><IconTruck size="1.2rem" /></ThemeIcon>
            <Text fw={600}>هماهنگ‌سازی موجودی</Text>
          </Group>
          <Text size="sm" c="dimmed">به‌روزرسانی موجودی محصولات در باسلام</Text>
          <Button leftSection={<IconSync size="1rem" />} loading={syncing === "inventory"} onClick={() => handleSync("inventory")} disabled={!status?.enabled}>
            شروع هماهنگ‌سازی
          </Button>
        </Card>

        <Card withBorder shadow="sm" radius="md" p="md" className="flex flex-col gap-3">
          <Group gap="sm">
            <ThemeIcon variant="light" color="orange" size="lg" radius="md"><IconShoppingBag size="1.2rem" /></ThemeIcon>
            <Text fw={600}>دریافت سفارش‌ها</Text>
          </Group>
          <Text size="sm" c="dimmed">دریافت و بررسی سفارش‌های باسلام</Text>
          <Button leftSection={<IconSync size="1rem" />} loading={syncing === "orders"} onClick={() => handleSync("orders")} disabled={!status?.enabled}>
            دریافت سفارش‌ها
          </Button>
        </Card>
      </SimpleGrid>

      {syncResult && (
        <Card withBorder shadow="sm" radius="md" p="md">
          <Title order={5} mb="sm">نتیجه هماهنگ‌سازی</Title>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
            <StatBox label="هماهنگ شده" value={syncResult.synced} color="blue" />
            <StatBox label="ایجاد شده" value={syncResult.created} color="green" />
            <StatBox label="به‌روز شده" value={syncResult.updated} color="cyan" />
            <StatBox label="خطا" value={syncResult.errors} color="red" />
          </SimpleGrid>
          {syncResult.errorMessages.length > 0 && (
            <Stack gap="xs" mt="md">
              {syncResult.errorMessages.slice(0, 10).map((msg, i) => (
                <Text key={i} size="xs" c="red" style={{ fontFamily: "monospace" }}>{msg}</Text>
              ))}
            </Stack>
          )}
        </Card>
      )}
    </div>
  );
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <Group gap="sm" justify="space-between">
      <Text size="sm">{label}</Text>
      {ok ? <IconCheck size="1rem" color="green" /> : <IconX size="1rem" color="red" />}
    </Group>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: "center", padding: "8px", borderRadius: 8, background: `var(--mantine-color-${color}-light)` }}>
      <Text fw={700} size="xl" c={color}>{value}</Text>
      <Text size="xs" c="dimmed">{label}</Text>
    </div>
  );
}
