"use client";
import {
  ActionIcon,
  Anchor,
  Badge,
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
  Tooltip,
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
  IconSearch,
} from "@tabler/icons-react";
import classes from "./HeaderMegaMenu.module.css";
import AppConfig from "@/config/AppConfig";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import CartList from "@/app/(web)/CartList";
import { usePathname } from "next/navigation";
import { Product, ProductCategory, User } from "@prisma/client";
import { SettingKeyInfo } from "@/generated/SettingKey.enum";
import { useCart } from "@/utils/localCart";

export let _openCart = () => {};
export let _closeCart = () => {};

export function WebHeader(parentProps: {
  user?: User;
  phone?: string;
  freeShippingThreshold?: string | number;
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
  const cart = useCart();
  const cartCount = Object.values(cart).reduce((sum, item) => sum + (item.quantity || 0), 0);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  _openCart = openCart;
  _closeCart = closeCart;

  useEffect(() => {
    closeCart();
    closeDrawer();
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onItemAdded = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setAddedToast(detail?.name ? `«${detail.name}» به سبد اضافه شد` : "کالا اضافه شد");
    };
    window.addEventListener("cart-item-added", onItemAdded as EventListener);
    return () => window.removeEventListener("cart-item-added", onItemAdded as EventListener);
  }, []);

  useEffect(() => {
    if (!addedToast) return;
    const t = setTimeout(() => setAddedToast(null), 2500);
    return () => clearTimeout(t);
  }, [addedToast]);

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
      <Link
        href="/category/all"
        className="center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-blue-400 bg-gray-50/80 hover:bg-blue-50/50 text-gray-700 transition-all text-xs"
        title="جستجوی زنده و تصویری در محصولات طِب خیّر"
      >
        <IconSearch size={15} className="text-blue-600" />
        <span className="font-bold">
          جستجو در <span className="text-red-600 font-black">طِب خیّر</span>
        </span>
      </Link>
      <Link href={"tel:04533790667"} className={"center gap-2"}>
        <p>{parentProps?.phone || SettingKeyInfo["MAIN_PHONE"]?.default}</p>
        <IconPhoneCall className={"text-primary"} />
      </Link>
      <div className={"flex flex-col items-center gap-0.5 relative"}>
        <div className={"center gap-1 relative"}>
          <Tooltip label={addedToast || "سبد خرید"} opened={addedToast ? true : undefined} position="bottom" withArrow>
            <ActionIcon
              onClick={toggleCart}
              variant={"transparent"}
              size={"lg"}
              className={"relative"}
            >
              <IconGardenCart />
              {cartCount > 0 && (
                <Badge
                  size="xs"
                  circle
                  color="red"
                  variant="filled"
                  style={{
                    position: "absolute",
                    top: -4,
                    left: -4,
                    minWidth: 18,
                    height: 18,
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cartCount.toLocaleString("fa-IR")}
                </Badge>
              )}
            </ActionIcon>
          </Tooltip>
          {addedToast && (
            <Text size="xs" c="green" fw={600} className={"whitespace-nowrap animate-pulse"}>
              کالا اضافه شد
            </Text>
          )}
        </div>
        <Link href={"/category/all"} className={"block"}>
          <Text size="xs" c="orange" fw={500} className={"whitespace-nowrap cursor-pointer hover:underline"}>
            خریدت رو کاملتر کن تا رایگان ارسال بشه برات
          </Text>
        </Link>
      </div>
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
      <div className={classes.announcement}>
        ارسال رایگان سفارش‌های بالای {Number(parentProps.freeShippingThreshold || 500000).toLocaleString("fa-IR")} تومان در سراسر کشور
      </div>
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
