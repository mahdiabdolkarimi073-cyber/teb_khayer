"use client";
import {
  ActionIcon,
  Anchor,
  Box,
  Burger,
  Button,
  Center,
  Collapse,
  Divider,
  Drawer,
  Group,
  HoverCard,
  rem,
  ScrollArea,
  SimpleGrid,
  Text,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";

import { useDisclosure, useViewportSize } from "@mantine/hooks";
import {
  IconChevronDown,
  IconChevronLeft,
  IconGardenCart,
  IconNotification,
  IconPhoneCall,
} from "@tabler/icons-react";
import classes from "./HeaderMegaMenu.module.css";
import AppConfig from "@/config/AppConfig";
import React, { useEffect } from "react";
import Link from "next/link";
import CartList from "@/app/(web)/CartList";
import { usePathname } from "next/navigation";
import { Product, ProductCategory, User } from "@prisma/client";
import { SettingKeyInfo } from "@/generated/SettingKey.enum";

export let _openCart = () => {};
export let _closeCart = () => {};

export function WebHeader(parentProps: {
  user?: User;
  phone?: string;
  categories: (ProductCategory & { products?: Product[] })[];
}) {
  const { width } = useViewportSize();
  const mockdata = parentProps?.categories?.map?.((c) => ({
    ...c,
    icon: IconNotification,
    title: c?.name,
    description: "Combusken battles with the intensely hot flames it spews",
  }));

  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const pathname = usePathname();
  const [cartOpened, { toggle: toggleCart, close: closeCart, open: openCart }] =
    useDisclosure();
  const theme = useMantineTheme();

  _openCart = openCart;
  _closeCart = closeCart;

  useEffect(() => {
    closeCart();
    closeDrawer();
  }, [pathname]);

  const links = mockdata.map((item) => (
    <UnstyledButton className={classes.subLink} key={item.title}>
      <Link href={`/category/${item?.id}`} className={"max-w-fit"}>
        <div className={"center justify-start gap-1 flex-nowrap"}>
          <img
            loading="lazy"
            src={item?.thumbnail}
            className={"w-[40px] h-[40px] object-cover rounded-2xl"}
          />

          <div className={"flex-grow blocl relative "}>
            <Text size="sm" fw={500} lineClamp={1} className={"w-full"}>
              {item.title?.slice?.(0, 25)}
            </Text>

            {item?.products?.map?.((p) => (
              <Link href={`/product/${p?.id}`} className={"w-full my-1"}>
                <div
                  className={"center flex-nowrap justify-between gap-2 w-full"}
                >
                  <Text
                    size={"xs"}
                    fw={200}
                    c={"dimmed"}
                    className={"flex-grow"}
                    lineClamp={1}
                  >
                    {p?.name}
                  </Text>

                  <Text c={"dimmed"}>
                    <IconChevronLeft size={"1rem"} className={"w-[20px]"} />
                  </Text>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Link>
    </UnstyledButton>
  ));

  const Btns = (props: any) => (
    <Group {...props}>
      <Link href={"tel:04533790667"} className={"center gap-2"}>
        <p>{parentProps?.phone || SettingKeyInfo["MAIN_PHONE"]?.default}</p>
        <IconPhoneCall className={"text-primary"} />
      </Link>
      <ActionIcon onClick={toggleCart} variant={"transparent"}>
        <IconGardenCart />
      </ActionIcon>
      {!parentProps?.user ? (
        <>
          <Link href={"/auth"}>
            <Button variant="default">ورود</Button>
          </Link>
          <Link href={"/auth"}>
            <Button>ثبت نام</Button>
          </Link>
        </>
      ) : (
        <Link href={"/dashboard/cart"}>
          <Button>داشبورد</Button>
        </Link>
      )}
    </Group>
  );

  return (
    <Box>
      <div className={classes.announcement}>ارسال رایگان سفارش‌های بالای ۵۰۰ هزار تومان در سراسر کشور</div>
      <header className={classes.header}>
        <Group justify="space-between" className={"container mx-auto"} h="100%">
          <Link href={"/"} className="block h-full">
            <div className={"center h-full gap-2"}>
              <img
                loading="lazy"
                src={"/logo.webp"}
                alt={AppConfig.name}
                className={"h-full"}
              />
              <h2 className={"text-2xl"}>{AppConfig.name}</h2>
            </div>
          </Link>

          <Group h="100%" gap={0} visibleFrom="sm">
            <Link href="/" className={classes.link}>
              خانه
            </Link>
            <Link href="/category/all" className={classes.link}>
              فروشگاه
            </Link>
            <Link href="/category/list" className={classes.link}>
              دسته‌بندی‌ها
            </Link>
            <HoverCard
              width={800}
              position="bottom"
              radius="md"
              shadow="md"
              withinPortal
            >
              <HoverCard.Target>
                <div className={classes.link}>
                  <Center inline className={"gap-1"}>
                    <Box component="span" mr={5}>
                      محصولات
                    </Box>
                    <IconChevronDown
                      style={{ width: rem(16), height: rem(16) }}
                      color={theme.colors.blue[6]}
                    />
                  </Center>
                </div>
              </HoverCard.Target>

              <HoverCard.Dropdown style={{ overflow: "hidden" }}>
                <Group justify="space-between" px="md">
                  <Text fw={500}>محصولات</Text>
                  <Link href={"/category/all"}>
                    <Anchor href="#" fz="xs">
                      مشاهده همه
                    </Anchor>
                  </Link>
                </Group>

                <Divider my="sm" />

                <SimpleGrid cols={2} spacing={0}>
                  {links}
                </SimpleGrid>
              </HoverCard.Dropdown>
            </HoverCard>
            <Link href="/track" className={classes.link}>
              پیگیری سفارش
            </Link>
            <Link href="/contact" className={classes.link}>
              ارتباط باما
            </Link>
            <Link href="/about" className={classes.link}>
              درباره ما
            </Link>
          </Group>

          <Btns visibleFrom={"sm"} />

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="sm"
          />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        // size={width > 756 ? '25%':"85%"}
        size="xl"
        padding="md"
        title={"منو"}
        position={"right"}
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Divider my="sm" />

          <Link href="/" className={classes.link}>
            خانه
          </Link>
          <Link href="/category/all" className={classes.link}>
            فروشگاه
          </Link>
          <Link href="/category/list" className={classes.link}>
            دسته‌بندی‌ها
          </Link>
          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                محصولات
              </Box>
              <IconChevronDown
                style={{ width: rem(16), height: rem(16) }}
                color={theme.colors.blue[6]}
              />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>{links}</Collapse>
          <Link href="/track" className={classes.link}>
            پیگیری سفارش
          </Link>
          <Link href="/contact" className={classes.link}>
            ارتباط باما
          </Link>
          <Link href="/about" className={classes.link}>
            درباره ما
          </Link>

          <Divider my="sm" />
          <Btns justify={"center"} dir={"column"} />
        </ScrollArea>
      </Drawer>
      <Drawer
        opened={cartOpened}
        onClose={closeCart}
        padding="sm"
        // size={width > 756 ? "25%" : "85%"}
        size="xl"
        position={"right"}
        title={"سبد خرید من"}
        zIndex={1000001}
      >
        <CartList />
      </Drawer>
    </Box>
  );
}

export default WebHeader;
