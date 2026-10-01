"use client";

import {Modal, Stack, Text, ThemeIcon, Title} from "@mantine/core";
import {IconShare, IconSquarePlus, IconDeviceMobile} from "@tabler/icons-react";

export default function IOSInstallGuide({opened, onClose}: {opened: boolean; onClose: () => void}) {
  return (
    <Modal opened={opened} onClose={onClose} centered title="نصب روی آیفون" dir="rtl">
      <Stack gap="lg">
        <Text c="dimmed" ta="center" style={{lineHeight: 1.9}}>
          برای استفاده سریع و تمام‌صفحه، سایت را به صفحه اصلی آیفون اضافه کنید.
        </Text>
        <div className="flex items-center gap-3">
          <ThemeIcon size="xl" radius="xl" color="blue"><IconShare size="1.3rem"/></ThemeIcon>
          <div><Title order={4}>۱. دکمه اشتراک‌گذاری را بزنید</Title><Text size="sm" c="dimmed">در مرورگر Safari پایین صفحه قرار دارد.</Text></div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeIcon size="xl" radius="xl" color="green"><IconSquarePlus size="1.3rem"/></ThemeIcon>
          <div><Title order={4}>۲. افزودن به صفحه اصلی</Title><Text size="sm" c="dimmed">گزینه Add to Home Screen را انتخاب کنید.</Text></div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeIcon size="xl" radius="xl" color="orange"><IconDeviceMobile size="1.3rem"/></ThemeIcon>
          <div><Title order={4}>۳. نصب را تأیید کنید</Title><Text size="sm" c="dimmed">آیکون اپلیکیشن روی صفحه اصلی شما قرار می‌گیرد.</Text></div>
        </div>
      </Stack>
    </Modal>
  );
}
