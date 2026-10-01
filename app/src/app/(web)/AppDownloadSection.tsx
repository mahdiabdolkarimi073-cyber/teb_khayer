"use client";

import {useState} from "react";
import {Badge, Button, Card, Container, Grid, Group, Stack, Text, ThemeIcon, Title} from "@mantine/core";
import {IconBell, IconBolt, IconBrandAndroid, IconBrandApple, IconCheck, IconDeviceMobile, IconShield, IconWifi, IconX} from "@tabler/icons-react";
import IOSInstallGuide from "@/app/(web)/IOSInstallGuide";
import {usePlatform} from "@/utils/usePlatform";

const androidUrl = "https://cafebazaar.ir";

const features = [
  {icon: IconBolt, title: "سرعت بالاتر", description: "بارگذاری سریع‌تر برای دسترسی راحت‌تر به آموزش‌ها"},
  {icon: IconBell, title: "اعلان‌های فوری", description: "اطلاع از دوره‌ها و خبرهای مهم در لحظه"},
  {icon: IconWifi, title: "دسترسی آفلاین", description: "مشاهده محتوای ذخیره‌شده بدون اینترنت"},
  {icon: IconDeviceMobile, title: "تجربه بومی", description: "طراحی اختصاصی و روان برای صفحه موبایل"},
  {icon: IconShield, title: "امنیت بیشتر", description: "ورود سریع و امن به حساب کاربری"},
];

const comparison = [
  ["اعلان فوری", true, false],
  ["دسترسی آفلاین", true, false],
  ["سرعت بارگذاری", "عالی", "خوب"],
  ["تجربه کاربری", "بومی", "مرورگر"],
];

export default function AppDownloadSection() {
  const [guideOpened, setGuideOpened] = useState(false);
  const platform = usePlatform();

  return (
    <section dir="rtl" className="w-full py-8 sm:py-14">
      <Container size="lg">
        <Card radius="xl" shadow="sm" withBorder p={"xl"} style={{overflow: "hidden", background: "linear-gradient(135deg, #f0fdfa 0%, #ffffff 55%, #eff6ff 100%)"}}>
          <Grid gutter={{base: "xl", md: 48}} align="center">
            <Grid.Col span={{base: 12, md: 6}}>
              <Stack gap="md">
                <Badge color="teal" variant="light" size="lg" w="fit-content">تجربه‌ای بهتر برای موبایل</Badge>
                <Title order={2} size="clamp(1.7rem, 4vw, 2.5rem)">اپلیکیشن ما را نصب کنید</Title>
                <Text size="lg" c="dimmed" style={{lineHeight: 1.9}}>
                  تجربه بهتر، سریع‌تر و راحت‌تر برای آموزش، خرید و دسترسی همیشگی به خدمات طب خیّر.
                </Text>
                <Grid gutter="sm">
                  {features.map(({icon: Icon, title, description}) => (
                    <Grid.Col span={{base: 12, sm: 6}} key={title}>
                      <Group align="flex-start" wrap="nowrap" gap="sm">
                        <ThemeIcon variant="light" color="teal" size="lg" radius="md"><Icon size="1.2rem"/></ThemeIcon>
                        <div>
                          <Text fw={700} size="sm">{title}</Text>
                          <Text size="xs" c="dimmed" style={{lineHeight: 1.7}}>{description}</Text>
                        </div>
                      </Group>
                    </Grid.Col>
                  ))}
                </Grid>
                <Group mt="sm" gap="sm" wrap="wrap">
                  <Button component="a" href={androidUrl} target="_blank" rel="noreferrer" size="md" color="green" leftSection={<IconBrandAndroid size={22}/>} fullWidth={platform === "android"}>
                    دریافت از بازار
                  </Button>
                  <Button size="md" color="dark" variant={platform === "ios" ? "filled" : "light"} leftSection={<IconBrandApple size={22}/>} onClick={() => setGuideOpened(true)} fullWidth={platform === "ios"}>
                    نصب روی iPhone
                  </Button>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{base: 12, md: 6}}>
              <Card radius="lg" withBorder bg="white" p="md">
                <Text fw={700} ta="center" mb="md">تفاوت اپلیکیشن با وب‌سایت</Text>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <Text fw={700} c="dimmed">ویژگی</Text><Text fw={700} c="teal" ta="center">اپلیکیشن</Text><Text fw={700} c="dimmed" ta="center">وب‌سایت</Text>
                  {comparison.map(([label, app, web]) => (
                    <div className="contents" key={String(label)}>
                      <Text py={"xs"} className="border-t">{label}</Text>
                      <Text py={"xs"} ta="center" c={app === true ? "green" : undefined} className="border-t">{app === true ? <IconCheck size="1.1rem"/> : app}</Text>
                      <Text py={"xs"} ta="center" c={web === false ? "red" : "dimmed"} className="border-t">{web === false ? <IconX size="1.1rem"/> : web}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Grid.Col>
          </Grid>
        </Card>
      </Container>
      <IOSInstallGuide opened={guideOpened} onClose={() => setGuideOpened(false)}/>
    </section>
  );
}
