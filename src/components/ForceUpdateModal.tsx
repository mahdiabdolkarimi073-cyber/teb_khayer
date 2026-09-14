"use client";

import {Button, Stack, Text, ThemeIcon} from "@mantine/core";
import {IconRefresh} from "@tabler/icons-react";

export interface ForceUpdateModalProps {
  updateUrl: string;
  releaseNotes?: string;
}

export function ForceUpdateModal({updateUrl, releaseNotes}: ForceUpdateModalProps) {
  return (
    <Stack align="center" gap="md" dir="rtl">
      <ThemeIcon size={64} radius="xl" color="blue">
        <IconRefresh size={32}/>
      </ThemeIcon>
      <Text ta="center" fw={600} size="lg">
        به‌روزرسانی ضروری
      </Text>
      <Text ta="center" style={{lineHeight: 1.9}}>
        نسخه جدیدی از اپلیکیشن منتشر شده است. برای ادامه استفاده، لطفاً اپلیکیشن را به‌روزرسانی کنید.
      </Text>
      {releaseNotes && <Text size="sm" c="dimmed" ta="center">{releaseNotes}</Text>}
      <Button fullWidth size="lg" component="a" href={updateUrl} target="_blank" rel="noreferrer">
        به‌روزرسانی از بازار
      </Button>
    </Stack>
  );
}
