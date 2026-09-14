"use client";

import React, {useEffect, useState} from "react";
import {
  Alert, Badge, Card, Group, SimpleGrid, Stack, Text, Title, ThemeIcon, Divider, Textarea, Button, TextInput,
} from "@mantine/core";
import {
  IconRobot, IconMessage2, IconBrain, IconBolt, IconCheck, IconX, IconSettings, IconSparkles,
} from "@tabler/icons-react";
import {toast} from "react-toastify";
import {getProviderStatuses, ProviderStatus} from "@/app/(web)/admin/integrations/integrations.action";

export default function IntegrationsPage() {
  const [statuses, setStatuses] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<{role: string; content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [genProductName, setGenProductName] = useState("");
  const [genKeywords, setGenKeywords] = useState("");
  const [genResult, setGenResult] = useState("");
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      setStatuses(await getProviderStatuses());
    } catch {
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, {role: "user", content: chatInput}];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({action: "chat", messages: [{role: "system", content: "شما دستیار طب سنتی هستید."}, ...newMessages]}),
      });
      const data = await res.json();
      if (data.content) {
        setChatMessages([...newMessages, {role: "assistant", content: data.content}]);
      } else {
        toast.error(data.error || "خطا در دریافت پاسخ");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setChatLoading(false);
    }
  };

  const generateDescription = async () => {
    if (!genProductName.trim()) return;
    setGenLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({action: "generate_description", name: genProductName, keywords: genKeywords}),
      });
      const data = await res.json();
      if (data.content) {
        setGenResult(data.content);
      } else {
        toast.error(data.error || "خطا در تولید توضیحات");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      <Group justify="space-between">
        <Title order={4}>اتصال به سرویس‌های هوش مصنوعی و یکپارچه‌سازی</Title>
      </Group>

      <Alert color="blue" variant="light" icon={<IconBolt size="1.2rem"/>}>
        زیرساخت این سیستم به‌صورت ماژولار طراحی شده است. اضافه کردن سرویس‌های جدید (هوش مصنوعی، باشگاه مشتریان، پیامک، درگاه پرداخت جدید) بدون نیاز به بازطراحی امکان‌پذیر است.
      </Alert>

      <SimpleGrid cols={{base: 1, sm: 2, lg: 3}} spacing="md">
        {loading ? (
          Array.from({length: 5}).map((_, i) => <Card key={i} withBorder shadow="sm" radius="md" p="md"><Text c="dimmed">در حال بارگذاری...</Text></Card>)
        ) : (
          statuses.map((s, i) => <ProviderCard key={i} status={s}/>)
        )}
      </SimpleGrid>

      <Divider my="md"/>

      <SimpleGrid cols={{base: 1, lg: 2}} spacing="md">
        <Card withBorder shadow="sm" radius="md" p="md">
          <Group gap="sm" mb="md">
            <IconMessage2 size="1.2rem"/>
            <Text fw={600}>تست گفتگو با هوش مصنوعی</Text>
          </Group>
          <Stack gap="sm" style={{minHeight: 200, maxHeight: 400, overflowY: "auto"}}>
            {chatMessages.length === 0 && <Text c="dimmed" ta="center">پیامی ارسال کنید...</Text>}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === "user" ? "flex-start" : "flex-end",
                background: msg.role === "user" ? "#e3f2ff" : "#f1f3f5",
                padding: "8px 12px",
                borderRadius: 12,
                maxWidth: "80%",
              }}>
                <Text size="sm" style={{whiteSpace: "pre-wrap"}}>{msg.content}</Text>
              </div>
            ))}
            {chatLoading && <Text c="dimmed" ta="center">در حال تایپ...</Text>}
          </Stack>
          <Group gap="sm" mt="md">
            <TextInput
              placeholder="سوال خود را بنویسید..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {if (e.key === "Enter") sendChat()}}
              style={{flex: 1}}
            />
            <Button onClick={sendChat} loading={chatLoading}>ارسال</Button>
          </Group>
        </Card>

        <Card withBorder shadow="sm" radius="md" p="md">
          <Group gap="sm" mb="md">
            <IconSparkles size="1.2rem"/>
            <Text fw={600}>تولید توضیحات محصول با AI</Text>
          </Group>
          <Stack gap="sm">
            <TextInput label="نام محصول" value={genProductName} onChange={(e) => setGenProductName(e.target.value)}/>
            <TextInput label="کلمات کلیدی" value={genKeywords} onChange={(e) => setGenKeywords(e.target.value)}/>
            <Button onClick={generateDescription} loading={genLoading}>تولید</Button>
            {genResult && (
              <Textarea label="توضیحات تولیدشده" value={genResult} onChange={(e) => setGenResult(e.target.value)} autosize minRows={4}/>
            )}
          </Stack>
        </Card>
      </SimpleGrid>
    </div>
  );
}

function ProviderCard({status}: {status: ProviderStatus}) {
  const icon = status.type === "هوش مصنوعی" ? <IconBrain/> :
    status.type === "پیامک" ? <IconMessage2/> :
    status.type === "درگاه پرداخت" ? <IconSettings/> :
    status.type === "باشگاه مشتریان" ? <IconRobot/> :
    <IconBolt/>;

  return (
    <Card withBorder shadow="sm" radius="md" p="md">
      <Group justify="space-between" mb="sm">
        <Group gap="sm">
          <ThemeIcon variant="light" color={status.enabled ? "green" : "gray"} size="lg" radius="md">{icon}</ThemeIcon>
          <Text fw={600}>{status.type}</Text>
        </Group>
        <Badge color={status.enabled ? "green" : "red"} variant="light">
          {status.enabled ? "فعال" : "غیرفعال"}
        </Badge>
      </Group>
      <Stack gap={4}>
        {status.hasApiKey !== undefined && (
          <Group gap={4}>
            {status.hasApiKey ? <IconCheck size="0.9rem" color="green"/> : <IconX size="0.9rem" color="red"/>}
            <Text size="xs" c="dimmed">{status.hasApiKey ? "کلید API تنظیم شده" : "کلید API تنظیم نشده"}</Text>
          </Group>
        )}
        {status.endpoint && <Text size="xs" c="dimmed">آدرس: {status.endpoint}</Text>}
        {status.model && <Text size="xs" c="dimmed">مدل: {status.model}</Text>}
      </Stack>
    </Card>
  );
}
