"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Alert, Badge, Button, Card, Group, Stack, Switch, Text, TextInput, Title, Divider, ThemeIcon, Code, SimpleGrid,
} from "@mantine/core";
import {
  IconCheck, IconX, IconRefresh, IconLink, IconAlertCircle, IconPackage, IconRss,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import {
  getTorobConfig, saveTorobConfig, getTorobStatus, testTorobFeed,
  type TorobConfig, type TorobStatus,
} from "@/app/(web)/admin/torob/torob.action";
import type { TorobSyncResult } from "@backend/modules/torob/TorobService";

export default function TorobAdminPage() {
  const [config, setConfig] = useState<TorobConfig | null>(null);
  const [status, setStatus] = useState<TorobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TorobSyncResult | null>(null);

  const load = useCallback(async () => {
    try {
      const [cfg, st] = await Promise.all([getTorobConfig(), getTorobStatus()]);
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
      await saveTorobConfig(config);
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
    setTestResult(null);
    try {
      const result = await testTorobFeed();
      setTestResult(result);
      if (result.errors > 0) toast.warning(`فید بررسی شد (${result.total} محصول، ${result.errors} خطا)`);
      else toast.success(`فید سالم است — ${result.total} محصول`);
    } catch {
      toast.error("خطا در بررسی فید");
    } finally {
      setTesting(false);
    }
  };

  const copyFeedUrl = () => {
    if (!config?.feedUrl) return;
    navigator.clipboard.writeText(config.feedUrl).then(() => {
      toast.success("آدرس فید کپی شد");
    });
  };

  if (loading) return <Text c="dimmed">در حال بارگذاری...</Text>;

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      <Group justify="space-between">
        <Group gap="sm">
          <ThemeIcon variant="light" color="cyan" size="lg" radius="md">
            <IconRss size="1.4rem" />
          </ThemeIcon>
          <Title order={4}>اتصال به ترب (Torob)</Title>
        </Group>
        {status && (
          <Badge color={status.enabled ? "green" : "red"} variant="light" size="lg">
            {status.enabled ? "فعال" : "غیرفعال"}
          </Badge>
        )}
      </Group>

      <Alert color="blue" variant="light" icon={<IconAlertCircle size="1.2rem" />}>
        ترب پلتفرم مقایسه قیمت ایران است. ترب API پوش به فروشنده نمی‌دهد — بلکه فید محصول (JSON) شما را
        از آدرسی که در پنل ترب ثبت می‌کنید می‌خواند. آدرس فید زیر را در پنل فروشندگان ترب وارد کنید.
        پس از تأیید ترب، محصولات شما در نتایج جستجوی ترب نمایش داده می‌شوند.
      </Alert>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <Card withBorder shadow="sm" radius="md" p="md">
          <Title order={5} mb="md">تنظیمات اتصال</Title>
          <Stack gap="sm">
            <Switch
              label="ترب فعال است"
              checked={config?.enabled || false}
              onChange={(e) => setConfig({ ...config!, enabled: e.currentTarget.checked })}
            />
            <TextInput
              label="نام فروشگاه در ترب"
              value={config?.shopName || ""}
              onChange={(e) => setConfig({ ...config!, shopName: e.target.value })}
              placeholder="نام فروشگاهی که در ترب ثبت کرده‌اید"
            />
            <TextInput
              label="لینک فروشگاه در ترب"
              value={config?.torobLink || ""}
              onChange={(e) => setConfig({ ...config!, torobLink: e.target.value })}
              placeholder="https://torob.com/shop/your-shop"
            />
            <Divider label="آدرس فید محصول" labelPosition="center" />
            <Group gap="xs" grow>
              <Code style={{ fontSize: "0.75rem", padding: "8px 10px", overflowX: "auto", whiteSpace: "nowrap" }}>
                {config?.feedUrl || "/api/torob/feed"}
              </Code>
              <Button variant="light" leftSection={<IconLink size="1rem" />} onClick={copyFeedUrl} style={{ flexGrow: 0 }}>
                کپی
              </Button>
            </Group>
            <Text size="xs" c="dimmed">
              این آدرس را در پنل فروشندگان ترب در بخش «آدرس فید محصول» وارد کنید.
            </Text>
          </Stack>
        </Card>

        <Stack gap="md">
          <Card withBorder shadow="sm" radius="md" p="md">
            <Title order={5} mb="md">وضعیت اتصال</Title>
            {status && (
              <Stack gap="xs">
                <StatusRow label="فعال" ok={status.enabled} />
                <StatusRow label="نام فروشگاه تنظیم شده" ok={status.hasShop} />
                <StatusRow label="فید محصول موجود" ok={status.hasFeed} />
                <Group gap="sm" justify="space-between">
                  <Text size="sm">تعداد محصولات در فید</Text>
                  <Text size="sm" fw={700}>{status.productCount}</Text>
                </Group>
              </Stack>
            )}
            <Group gap="sm" mt="md">
              <Button variant="light" leftSection={<IconRefresh size="1rem" />} loading={testing} onClick={handleTest}>
                بررسی فید
              </Button>
              <Button variant="filled" loading={saving} onClick={handleSave}>
                ذخیره تنظیمات
              </Button>
            </Group>
          </Card>

          <Card withBorder shadow="sm" radius="md" p="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon variant="light" color="blue" size="lg" radius="md"><IconPackage size="1.2rem" /></ThemeIcon>
              <Text fw={600}>راهنمای اتصال</Text>
            </Group>
            <Stack gap={6}>
              <Text size="xs" c="dimmed">۱. در torob.com روی «ثبت نام فروشگاه‌ها» کلیک کنید.</Text>
              <Text size="xs" c="dimmed">۲. اطلاعات فروشگاه را وارد و منتظر تأیید بمانید.</Text>
              <Text size="xs" c="dimmed">۳. آدرس فید بالا را در پنل ترب وارد کنید.</Text>
              <Text size="xs" c="dimmed">۴. ترب فید را به‌صورت خودکار می‌خواند و محصولات را نمایش می‌دهد.</Text>
            </Stack>
          </Card>
        </Stack>
      </SimpleGrid>

      {testResult && (
        <Card withBorder shadow="sm" radius="md" p="md">
          <Title order={5} mb="sm">نتیجه بررسی فید</Title>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
            <StatBox label="کل محصولات" value={testResult.total} color="blue" />
            <StatBox label="موجود" value={testResult.inStock} color="green" />
            <StatBox label="ناموجود" value={testResult.outOfStock} color="orange" />
            <StatBox label="خطا" value={testResult.errors} color="red" />
          </SimpleGrid>
          {testResult.errorMessages.length > 0 && (
            <Stack gap="xs" mt="md">
              {testResult.errorMessages.slice(0, 10).map((msg, i) => (
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
