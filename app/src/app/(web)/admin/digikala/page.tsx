"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Alert, Badge, Button, Card, Group, Stack, Switch, Text, TextInput, Title, Divider, ThemeIcon, SimpleGrid,
} from "@mantine/core";
import {
  IconCheck, IconX, IconRefresh, IconShoppingBag, IconPackage, IconTruck, IconLink, IconAlertCircle,
  IconPlugConnected, IconPlugOff, IconKey, IconLock,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import {
  getDigikalaConfig, saveDigikalaConfig, getDigikalaStatus, testDigikalaConnection,
  connectDigikala, disconnectDigikala,
  syncPricesToDigikala, syncInventoryToDigikala, syncOrdersFromDigikala,
  type DigikalaConfig, type DigikalaStatus,
} from "@/app/(web)/admin/digikala/digikala.action";
import type { DigikalaSyncResult } from "@backend/modules/digikala/DigikalaSync";

export default function DigikalaAdminPage() {
  const [config, setConfig] = useState<DigikalaConfig | null>(null);
  const [status, setStatus] = useState<DigikalaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<DigikalaSyncResult | null>(null);

  const load = useCallback(async () => {
    try {
      const [cfg, st] = await Promise.all([getDigikalaConfig(), getDigikalaStatus()]);
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
      await saveDigikalaConfig(config);
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
      const result = await testDigikalaConnection();
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      await load();
    } catch {
      toast.error("خطا در تست اتصال");
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const result = await connectDigikala();
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      await load();
    } catch {
      toast.error("خطا در اتصال");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const result = await disconnectDigikala();
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      await load();
    } catch {
      toast.error("خطا در قطع اتصال");
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSync = async (type: "prices" | "inventory" | "orders") => {
    setSyncing(type);
    setSyncResult(null);
    try {
      let result: DigikalaSyncResult;
      if (type === "prices") result = await syncPricesToDigikala();
      else if (type === "inventory") result = await syncInventoryToDigikala();
      else result = await syncOrdersFromDigikala();

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
          <ThemeIcon variant="light" color="red" size="lg" radius="md">
            <IconShoppingBag size="1.4rem" />
          </ThemeIcon>
          <Title order={4}>اتصال به دیجی‌کالا (Digikala)</Title>
        </Group>
        {status && (
          <Badge color={status.configured ? "green" : "red"} variant="light" size="lg">
            {status.configured ? "پیکربندی شده" : "پیکربندی نشده"}
          </Badge>
        )}
      </Group>

      <Alert color="blue" variant="light" icon={<IconAlertCircle size="1.2rem" />}>
        دیجی‌کالا بزرگ‌ترین مارکت‌پلیس ایران است. با اتصال به API رسمی فروشندگان دیجی‌کالا (Open API)
        می‌توانید محصولات، قیمت‌ها و موجودی خود را هماهنگ کنید و سفارش‌ها را مدیریت نمایید.
        احراز هویت از مسیر رسمی <Text component="span" size="xs" fw={600} style={{ fontFamily: "monospace" }}>seller.digikala.com/open-api/v1/auth/token</Text> انجام می‌شود.
      </Alert>

      {status?.connected && (
        <Alert color={status.tokenExpired ? "orange" : "green"} variant="light"
          icon={status.tokenExpired ? <IconAlertCircle size="1.2rem" /> : <IconCheck size="1.2rem" />}>
          {status.tokenExpired
            ? "توکن منقضی شده است — با کلیک روی «اتصال» توکن جدید بگیرید."
            : "اتصال برقرار و توکن معتبر است."}
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <Card withBorder shadow="sm" radius="md" p="md">
          <Title order={5} mb="md">تنظیمات احراز هویت (Open API)</Title>
          <Stack gap="sm">
            <Switch
              label="دیجی‌کالا فعال است"
              checked={config?.enabled || false}
              onChange={(e) => setConfig({ ...config!, enabled: e.currentTarget.checked })}
            />
            <Divider label="OAuth — احراز هویت رسمی" labelPosition="center" />
            <Group gap="xs" mb={4}>
              <ThemeIcon variant="light" color="blue" size="sm" radius="sm"><IconKey size="0.9rem" /></ThemeIcon>
              <Text size="xs" c="dimmed">احراز هویت رسمی از طریق Client ID و Client Secret</Text>
            </Group>
            <TextInput
              label="Client ID"
              value={config?.clientId || ""}
              onChange={(e) => setConfig({ ...config!, clientId: e.target.value })}
              placeholder="شناسه کلاینت از پنل Open API دیجی‌کالا"
            />
            <TextInput
              label="Client Secret"
              type="password"
              value={config?.clientSecret || ""}
              onChange={(e) => setConfig({ ...config!, clientSecret: e.target.value })}
              placeholder="رمز کلاینت از پنل Open API دیجی‌کالا"
            />
            <Divider label="توکن اختصاصی (Dedicated Token)" labelPosition="center" />
            <Group gap="xs" mb={4}>
              <ThemeIcon variant="light" color="gray" size="sm" radius="sm"><IconLock size="0.9rem" /></ThemeIcon>
              <Text size="xs" c="dimmed">در صورت عدم استفاده از OAuth، توکن اختصاصی را وارد کنید</Text>
            </Group>
            <TextInput
              label="توکن اختصاصی (Dedicated Token)"
              type="password"
              value={config?.apiToken || ""}
              onChange={(e) => setConfig({ ...config!, apiToken: e.target.value })}
              placeholder="توکن اختصاصی از پنل فروشندگی دیجی‌کالا"
            />
            <Divider label="توکن‌های خودکار (بعد از اتصال)" labelPosition="center" />
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
            <Divider label="وب‌هوک" labelPosition="center" />
            <TextInput
              label="توکن امنیتی وب‌هوک"
              type="password"
              value={config?.webhookSecret || ""}
              onChange={(e) => setConfig({ ...config!, webhookSecret: e.target.value })}
              placeholder="توکن امنیتی برای تأیید وب‌هوک‌های دیجی‌کالا"
            />
            <Text size="xs" c="dimmed">
              این توکن را در پنل دیجی‌کالا هنگام ثبت وب‌هوک دریافت می‌کنید.
            </Text>
          </Stack>
        </Card>

        <Stack gap="md">
          <Card withBorder shadow="sm" radius="md" p="md">
            <Title order={5} mb="md">لینک فروشگاه دیجی‌کالا</Title>
            <TextInput
              label="لینک فروشگاه دیجی‌کالا"
              value={config?.link || ""}
              onChange={(e) => setConfig({ ...config!, link: e.target.value })}
              placeholder="https://digikala.com/shop/your-shop"
            />
            <TextInput
              label="شناسه فروشنده (Seller ID)"
              value={config?.sellerId || ""}
              onChange={(e) => setConfig({ ...config!, sellerId: e.target.value })}
              placeholder="شناسه فروشنده دیجی‌کالا"
              mt="sm"
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
                <StatusRow label="OAuth تنظیم شده" ok={status.hasOAuth} />
                <StatusRow label="توکن موجود" ok={status.hasToken} />
                <StatusRow label="متصل" ok={status.connected} />
                {status.connected && (
                  <StatusRow label="توکن معتبر" ok={!status.tokenExpired} />
                )}
                <StatusRow label="شناسه فروشنده مشخص شده" ok={status.hasSeller} />
              </Stack>
            )}
            <Group gap="sm" mt="md" wrap="wrap">
              <Button
                variant="filled"
                color="green"
                leftSection={<IconPlugConnected size="1rem" />}
                loading={connecting}
                onClick={handleConnect}
                disabled={!config?.clientId || !config?.clientSecret}
              >
                اتصال
              </Button>
              <Button
                variant="light"
                color="red"
                leftSection={<IconPlugOff size="1rem" />}
                loading={disconnecting}
                onClick={handleDisconnect}
                disabled={!status?.connected}
              >
                قطع اتصال
              </Button>
              <Button
                variant="light"
                leftSection={<IconRefresh size="1rem" />}
                loading={testing}
                onClick={handleTest}
              >
                تست اتصال
              </Button>
              <Button variant="filled" loading={saving} onClick={handleSave}>
                ذخیره تنظیمات
              </Button>
            </Group>
          </Card>

          <Card withBorder shadow="sm" radius="md" p="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon variant="light" color="blue" size="lg" radius="md"><IconLink size="1.2rem" /></ThemeIcon>
              <Text fw={600}>راهنمای اتصال رسمی</Text>
            </Group>
            <Stack gap={6}>
              <Text size="xs" c="dimmed">
                ۱. وارد پنل فروشندگی دیجی‌کالا (seller.digikala.com) شوید.
              </Text>
              <Text size="xs" c="dimmed">
                ۲. از منوی تنظیمات، بخش Open API را انتخاب کنید.
              </Text>
              <Text size="xs" c="dimmed">
                ۳. یک کلید جدید (Application) ایجاد کنید و Client ID و Client Secret را کپی کنید.
              </Text>
              <Text size="xs" c="dimmed">
                ۴. مقادیر را در فیلدهای بالا وارد کرده و ذخیره کنید.
              </Text>
              <Text size="xs" c="dimmed">
                ۵. روی دکمه «اتصال» کلیک کنید تا توکن به‌صورت امن دریافت و ذخیره شود.
              </Text>
              <Text size="xs" c="dimmed">
                ۶. برای دریافت وب‌هوک، آدرس زیر را در پنل دیجی‌کالا ثبت کنید:
              </Text>
              <Text size="xs" c="blue" fw={600} style={{ fontFamily: "monospace" }}>
                {typeof window !== "undefined" ? `${window.location.origin}/api/digikala/webhook` : "/api/digikala/webhook"}
              </Text>
            </Stack>
          </Card>
        </Stack>
      </SimpleGrid>

      <Divider my="sm" label="هماهنگ‌سازی" labelPosition="center" />

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Card withBorder shadow="sm" radius="md" p="md" className="flex flex-col gap-3">
          <Group gap="sm">
            <ThemeIcon variant="light" color="blue" size="lg" radius="md"><IconPackage size="1.2rem" /></ThemeIcon>
            <Text fw={600}>هماهنگ‌سازی قیمت‌ها</Text>
          </Group>
          <Text size="sm" c="dimmed">ارسال قیمت محصولات به دیجی‌کالا</Text>
          <Button leftSection={<IconRefresh size="1rem" />} loading={syncing === "prices"} onClick={() => handleSync("prices")} disabled={!status?.enabled}>
            شروع هماهنگ‌سازی
          </Button>
        </Card>

        <Card withBorder shadow="sm" radius="md" p="md" className="flex flex-col gap-3">
          <Group gap="sm">
            <ThemeIcon variant="light" color="green" size="lg" radius="md"><IconTruck size="1.2rem" /></ThemeIcon>
            <Text fw={600}>هماهنگ‌سازی موجودی</Text>
          </Group>
          <Text size="sm" c="dimmed">به‌روزرسانی موجودی محصولات در دیجی‌کالا</Text>
          <Button leftSection={<IconRefresh size="1rem" />} loading={syncing === "inventory"} onClick={() => handleSync("inventory")} disabled={!status?.enabled}>
            شروع هماهنگ‌سازی
          </Button>
        </Card>

        <Card withBorder shadow="sm" radius="md" p="md" className="flex flex-col gap-3">
          <Group gap="sm">
            <ThemeIcon variant="light" color="orange" size="lg" radius="md"><IconShoppingBag size="1.2rem" /></ThemeIcon>
            <Text fw={600}>دریافت سفارش‌ها</Text>
          </Group>
          <Text size="sm" c="dimmed">دریافت و بررسی سفارش‌های دیجی‌کالا</Text>
          <Button leftSection={<IconRefresh size="1rem" />} loading={syncing === "orders"} onClick={() => handleSync("orders")} disabled={!status?.enabled}>
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
