"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
  Divider,
  ThemeIcon,
  Code,
  SimpleGrid,
  Accordion,
  JsonInput,
  Skeleton,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconRefresh,
  IconLink,
  IconAlertCircle,
  IconPackage,
  IconRss,
  IconEye,
  IconExternalLink,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import {
  getTorobConfig,
  saveTorobConfig,
  getTorobStatus,
  testTorobFeed,
  getTorobFeedPreview,
  type TorobConfig,
  type TorobStatus,
} from "@/app/(web)/admin/torob/torob.action";
import type {
  TorobSyncResult,
  TorobFeedPreview,
} from "@backend/modules/torob/TorobService";

export default function TorobAdminPage() {
  const [config, setConfig] = useState<TorobConfig | null>(null);
  const [status, setStatus] = useState<TorobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [testResult, setTestResult] = useState<TorobSyncResult | null>(null);
  const [preview, setPreview] = useState<TorobFeedPreview | null>(null);

  const load = useCallback(async () => {
    try {
      const [cfg, st] = await Promise.all([
        getTorobConfig(),
        getTorobStatus(),
      ]);
      setConfig(cfg);
      setStatus(st);
    } catch {
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
      if (result.errors > 0)
        toast.warning(
          `فید بررسی شد (${result.total} محصول، ${result.errors} خطا)`
        );
      else toast.success(`فید سالم است — ${result.total} محصول`);
    } catch {
      toast.error("خطا در بررسی فید");
    } finally {
      setTesting(false);
    }
  };

  const handlePreview = async () => {
    setPreviewing(true);
    setPreview(null);
    try {
      const result = await getTorobFeedPreview();
      setPreview(result);
      toast.success("پیش‌نمایش فید آماده شد");
    } catch {
      toast.error("خطا در دریافت پیش‌نمایش فید");
    } finally {
      setPreviewing(false);
    }
  };

  const copyFeedUrl = () => {
    if (!config?.feedUrl) return;
    navigator.clipboard.writeText(config.feedUrl).then(() => {
      toast.success("آدرس فید کپی شد");
    });
  };

  if (loading)
    return (
      <Stack gap="md">
        <Skeleton height={40} width="40%" />
        <Skeleton height={120} />
        <Skeleton height={120} />
      </Stack>
    );

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
          <Badge
            color={status.enabled ? "green" : "red"}
            variant="light"
            size="lg"
          >
            {status.enabled ? "فعال" : "غیرفعال"}
          </Badge>
        )}
      </Group>

      <Alert
        color="blue"
        variant="light"
        icon={<IconAlertCircle size="1.2rem" />}
      >
        ترب پلتفرم مقایسه قیمت ایران است. ترب فید محصول (JSON) شما را از آدرسی
        که در پنل ترب ثبت می‌کنید می‌خواند. آدرس فید زیر را در پنل فروشندگان ترب
        وارد کنید. پس از تأیید ترب، محصولات شما در نتایج جستجوی ترب نمایش داده
        می‌شوند.
      </Alert>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <Card withBorder shadow="sm" radius="md" p="md">
          <Title order={5} mb="md">
            تنظیمات اتصال
          </Title>
          <Stack gap="sm">
            <Switch
              label="ترب فعال است"
              checked={config?.enabled || false}
              onChange={(e) =>
                setConfig({ ...config!, enabled: e.currentTarget.checked })
              }
            />
            <TextInput
              label="نام فروشگاه در ترب"
              value={config?.shopName || ""}
              onChange={(e) =>
                setConfig({ ...config!, shopName: e.target.value })
              }
              placeholder="نام فروشگاهی که در ترب ثبت کرده‌اید"
            />
            <TextInput
              label="لینک فروشگاه در ترب"
              value={config?.torobLink || ""}
              onChange={(e) =>
                setConfig({ ...config!, torobLink: e.target.value })
              }
              placeholder="https://torob.com/shop/your-shop"
            />
            <Divider label="آدرس فید محصول" labelPosition="center" />
            <Group gap="xs" grow>
              <Code
                style={{
                  fontSize: "0.75rem",
                  padding: "8px 10px",
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                {config?.feedUrl || "/api/torob/feed"}
              </Code>
              <Button
                variant="light"
                leftSection={<IconLink size="1rem" />}
                onClick={copyFeedUrl}
                style={{ flexGrow: 0 }}
              >
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
            <Title order={5} mb="md">
              وضعیت اتصال
            </Title>
            {status && (
              <Stack gap="xs">
                <StatusRow label="فعال" ok={status.enabled} />
                <StatusRow
                  label="نام فروشگاه تنظیم شده"
                  ok={status.hasShop}
                />
                <StatusRow label="فید محصول موجود" ok={status.hasFeed} />
                <Group gap="sm" justify="space-between">
                  <Text size="sm">کل محصولات در دیتابیس</Text>
                  <Text size="sm" fw={700}>
                    {status.productCount}
                  </Text>
                </Group>
                <Group gap="sm" justify="space-between">
                  <Text size="sm">محصولات قابل ارسال به ترب</Text>
                  <Text size="sm" fw={700} c="green">
                    {status.validProductCount}
                  </Text>
                </Group>
                {status.excludedCount > 0 && (
                  <Group gap="sm" justify="space-between">
                    <Text size="sm">محصولات ناقص (حذف از فید)</Text>
                    <Text size="sm" fw={700} c="orange">
                      {status.excludedCount}
                    </Text>
                  </Group>
                )}
              </Stack>
            )}
            <Group gap="sm" mt="md">
              <Button
                variant="light"
                leftSection={<IconRefresh size="1rem" />}
                loading={testing}
                onClick={handleTest}
              >
                بررسی فید
              </Button>
              <Button
                variant="light"
                color="cyan"
                leftSection={<IconEye size="1rem" />}
                loading={previewing}
                onClick={handlePreview}
              >
                پیش‌نمایش فید
              </Button>
              <Button
                variant="filled"
                loading={saving}
                onClick={handleSave}
              >
                ذخیره تنظیمات
              </Button>
            </Group>
          </Card>

          <Card withBorder shadow="sm" radius="md" p="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                <IconPackage size="1.2rem" />
              </ThemeIcon>
              <Text fw={600}>راهنمای اتصال</Text>
            </Group>
            <Stack gap={6}>
              <Text size="xs" c="dimmed">
                ۱. در torob.com روی «ثبت نام فروشگاه‌ها» کلیک کنید.
              </Text>
              <Text size="xs" c="dimmed">
                ۲. اطلاعات فروشگاه را وارد و منتظر تأیید بمانید.
              </Text>
              <Text size="xs" c="dimmed">
                ۳. آدرس فید بالا را در پنل ترب وارد کنید.
              </Text>
              <Text size="xs" c="dimmed">
                ۴. ترب فید را به‌صورت خودکار می‌خواند و محصولات را نمایش می‌دهد.
              </Text>
            </Stack>
          </Card>
        </Stack>
      </SimpleGrid>

      {testResult && (
        <Card withBorder shadow="sm" radius="md" p="md">
          <Title order={5} mb="sm">
            نتیجه بررسی فید
          </Title>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
            <StatBox
              label="کل محصولات"
              value={testResult.total}
              color="blue"
            />
            <StatBox label="موجود" value={testResult.inStock} color="green" />
            <StatBox
              label="ناموجود"
              value={testResult.outOfStock}
              color="orange"
            />
            <StatBox label="خطا" value={testResult.errors} color="red" />
          </SimpleGrid>
          {testResult.errorMessages.length > 0 && (
            <Stack gap="xs" mt="md">
              <Text size="sm" fw={600} c="red">
                خطاها و هشدارها:
              </Text>
              {testResult.errorMessages.slice(0, 15).map((msg, i) => (
                <Text
                  key={i}
                  size="xs"
                  c="red"
                  style={{ fontFamily: "monospace" }}
                >
                  {msg}
                </Text>
              ))}
              {testResult.errorMessages.length > 15 && (
                <Text size="xs" c="dimmed">
                  و {testResult.errorMessages.length - 15} خطای دیگر...
                </Text>
              )}
            </Stack>
          )}
        </Card>
      )}

      {preview && (
        <Card withBorder shadow="sm" radius="md" p="md">
          <Group justify="space-between" mb="md">
            <Title order={5}>پیش‌نمایش فید واقعی</Title>
            <Group gap="xs">
              <Button
                component="a"
                href={preview.feedUrl}
                target="_blank"
                variant="subtle"
                size="xs"
                leftSection={<IconExternalLink size="0.9rem" />}
              >
                باز کردن فید
              </Button>
            </Group>
          </Group>

          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" mb="md">
            <StatBox
              label="کل محصولات"
              value={preview.totalProducts}
              color="blue"
            />
            <StatBox
              label="محاسول قابل ارسال"
              value={preview.includedProducts}
              color="green"
            />
            <StatBox
              label="ناقص / حذف شده"
              value={preview.excludedProducts}
              color="orange"
            />
            <StatBox
              label="خطا"
              value={preview.errors.length}
              color="red"
            />
          </SimpleGrid>

          <Group gap="xs" mb="sm">
            <Text size="sm" fw={600}>
              آدرس نهایی فید:
            </Text>
            <Code style={{ fontSize: "0.8rem" }}>{preview.feedUrl}</Code>
          </Group>

          {preview.errors.length > 0 && (
            <Alert
              color="orange"
              variant="light"
              icon={<IconAlertCircle size="1rem" />}
              mb="md"
            >
              <Stack gap={4}>
                {preview.errors.slice(0, 8).map((err, i) => (
                  <Text key={i} size="xs">
                    {err}
                  </Text>
                ))}
                {preview.errors.length > 8 && (
                  <Text size="xs" c="dimmed">
                    و {preview.errors.length - 8} مورد دیگر...
                  </Text>
                )}
              </Stack>
            </Alert>
          )}

          <Accordion>
            <Accordion.Item value="sample">
              <Accordion.Control icon={<IconEye size="1rem" />}>
                نمونه خروجی محصولات (۵ محصول اول)
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  {preview.sample.map((p, i) => (
                    <ProductPreviewCard key={i} product={p} />
                  ))}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="json">
              <Accordion.Control icon={<IconRss size="1rem" />}>
                خروجی JSON فید
              </Accordion.Control>
              <Accordion.Panel>
                <JsonInput
                  value={JSON.stringify(
                    { products: preview.sample },
                    null,
                    2
                  )}
                  readOnly
                  autosize
                  minRows={10}
                  maxRows={25}
                  style={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Card>
      )}
    </div>
  );
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <Group gap="sm" justify="space-between">
      <Text size="sm">{label}</Text>
      {ok ? (
        <IconCheck size="1rem" color="green" />
      ) : (
        <IconX size="1rem" color="red" />
      )}
    </Group>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "8px",
        borderRadius: 8,
        background: `var(--mantine-color-${color}-light)`,
      }}
    >
      <Text fw={700} size="xl" c={color}>
        {value}
      </Text>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
    </div>
  );
}

function ProductPreviewCard({
  product,
}: {
  product: import("@backend/modules/torob/TorobService").TorobFeedProduct;
}) {
  return (
    <Card withBorder padding="sm" radius="md">
      <Group gap="md" align="flex-start">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            style={{
              width: 80,
              height: 80,
              objectFit: "cover",
              borderRadius: 8,
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              background: "var(--mantine-color-gray-1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconPackage size="1.5rem" color="gray" />
          </div>
        )}
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={600} lineClamp={2}>
            {product.title}
          </Text>
          <Group gap="xs">
            <Badge size="xs" color={product.availability === "in stock" ? "green" : "orange"} variant="light">
              {product.availability === "in stock" ? "موجود" : "ناموجود"}
            </Badge>
            <Text size="sm" fw={700} c="blue">
              {product.price.toLocaleString("fa-IR")} تومان
            </Text>
            {product.old_price && (
              <Text size="xs" c="dimmed" td="line-through">
                {product.old_price.toLocaleString("fa-IR")}
              </Text>
            )}
          </Group>
          <Text size="xs" c="dimmed">
            دسته: {product.category || "—"}
          </Text>
          <Group gap={4}>
            <Text size="xs" c="dimmed">
              شناسه:
            </Text>
            <Code style={{ fontSize: "0.65rem" }}>{product.product_id}</Code>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}
