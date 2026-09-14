"use client";

import React, {useEffect, useState, useCallback} from "react";
import {
  Alert, Badge, Button, Card, Group, Stack, Table, Text, TextInput,
  Textarea, Title, Select, SimpleGrid, Divider,
} from "@mantine/core";
import {IconSearch, IconCheck, IconAlertTriangle, IconDeviceDesktop, IconBrandGoogle} from "@tabler/icons-react";
import {toast} from "react-toastify";
import {getSeoPages, saveSeoPage, getPagesWithoutMetadata, SeoMeta} from "@/app/(web)/admin/seo/seo.action";

export default function SeoPage() {
  const [pages, setPages] = useState<SeoMeta[]>([]);
  const [missing, setMissing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [p, m] = await Promise.all([getSeoPages(), getPagesWithoutMetadata()]);
      setPages(p);
      setMissing(m);
      if (p.length > 0) {
        setSelectedPath(p[0].path);
        setTitle(p[0].title);
        setDescription(p[0].description);
        setKeywords(p[0].keywords);
      }
    } catch {
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const selectPage = (path: string) => {
    const page = pages.find((p) => p.path === path);
    if (page) {
      setSelectedPath(path);
      setTitle(page.title);
      setDescription(page.description);
      setKeywords(page.keywords);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSeoPage({path: selectedPath, title, description, keywords});
      toast.success("متادیتا ذخیره شد");
      await fetchAll();
    } catch {
      toast.error("خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  };

  const titleLen = title.length;
  const descLen = description.length;
  const SITE_URL = "https://teb-khayyer.ir";

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      <Title order={4}>مدیریت SEO</Title>

      <SimpleGrid cols={{base: 1, lg: 2}} spacing="md">
        <Card withBorder shadow="sm" radius="md" p="md">
          <Stack gap="md">
            <Group gap="sm"><IconDeviceDesktop size="1.2rem"/><Text fw={600}>ویرایش متادیتا</Text></Group>
            <Select label="انتخاب صفحه" data={pages.map((p) => ({value: p.path, label: p.path}))} value={selectedPath} onChange={(v) => v && selectPage(v)}/>
            <TextInput label="عنوان" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60}/>
            <Text size="xs" c={titleLen > 60 ? "red" : "dimmed"}>{titleLen}/۶۰ کاراکتر</Text>
            <Textarea label="توضیحات" value={description} onChange={(e) => setDescription(e.target.value)} autosize minRows={2} maxLength={160}/>
            <Text size="xs" c={descLen > 160 ? "red" : "dimmed"}>{descLen}/۱۶۰ کاراکتر</Text>
            <TextInput label="کلمات کلیدی (با کاما جدا کنید)" value={keywords} onChange={(e) => setKeywords(e.target.value)}/>
            <Button leftSection={<IconCheck size="1rem"/>} loading={saving} onClick={handleSave}>ذخیره</Button>
          </Stack>
        </Card>

        <Card withBorder shadow="sm" radius="md" p="md">
          <Stack gap="md">
            <Group gap="sm"><IconBrandGoogle size="1.2rem"/><Text fw={600}>پیش‌نمایش جستجوی گوگل</Text></Group>
            <div style={{fontFamily: "arial, sans-serif", direction: "ltr", textAlign: "left"}}>
              <Text size="sm" c="dimmed">{SITE_URL}{selectedPath}</Text>
              <Text size="lg" c="#1a0dab" fw={500} style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                {title || "عنوان صفحه"}
              </Text>
              <Text size="sm" c="#4d5156" lineClamp={2}>
                {description || "توضیحات صفحه در اینجا نمایش داده می‌شود..."}
              </Text>
            </div>
            <Divider label="نکات سئو" labelPosition="right"/>
            <Stack gap={4}>
              <Text size="xs" c={titleLen > 0 && titleLen <= 60 ? "green" : "orange"}>
                {titleLen > 0 && titleLen <= 60 ? "عنوان مناسب" : "عنوان باید بین ۱ تا ۶۰ کاراکتر باشد"}
              </Text>
              <Text size="xs" c={descLen > 0 && descLen <= 160 ? "green" : "orange"}>
                {descLen > 0 && descLen <= 160 ? "توضیحات مناسب" : "توضیحات باید بین ۱ تا ۱۶۰ کاراکتر باشد"}
              </Text>
              <Text size="xs" c={keywords.length > 0 ? "green" : "orange"}>
                {keywords.length > 0 ? "کلمات کلیدی وارد شده" : "کلمات کلیدی را وارد کنید"}
              </Text>
            </Stack>
          </Stack>
        </Card>
      </SimpleGrid>

      <Card withBorder shadow="sm" radius="md" p="md">
        <Text fw={600} mb="md">صفحاتی که متادیتا ندارند</Text>
        {loading ? (
          <Text c="dimmed">در حال بررسی...</Text>
        ) : missing.length === 0 ? (
          <Alert color="green" variant="light" icon={<IconCheck size="1.2rem"/>}>تمام صفحات متادیتای لازم را دارند</Alert>
        ) : (
          <Table striped>
            <Table.Thead><Table.Tr><Table.Th>نوع</Table.Th><Table.Th>شناسه</Table.Th><Table.Th>نام</Table.Th></Table.Tr></Table.Thead>
            <Table.Tbody>
              {missing.map((item, i) => (
                <Table.Tr key={i}>
                  <Table.Td><Badge color="orange" size="sm">{item.type}</Badge></Table.Td>
                  <Table.Td style={{fontSize: 11}}>{item.id}</Table.Td>
                  <Table.Td>{item.name}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
