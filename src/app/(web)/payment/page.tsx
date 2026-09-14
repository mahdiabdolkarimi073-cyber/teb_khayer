"use client";
import {IconCheck, IconX, IconPhoneCall, IconAlertCircle, IconRefresh, IconHome} from "@tabler/icons-react";
import {Button, Container, Paper, Text, Stack, Group, rem} from "@mantine/core";
import React from "react";
import Link from "next/link";
import { useAction } from "@/utils/server";
import { getVar } from "@backend/utils/setting";
import { SettingKey } from "@prisma/client";
import { SettingKeyInfo } from "@/generated/SettingKey.enum";

const Page = (props: any) => {
	const {status: statusText, msg = "خطا در پرداخت", redirect = '/dashboard/orders'} = props?.searchParams;
	const status = statusText === 'true';
	const { result: phone } = useAction(getVar, "MAIN_PHONE" as SettingKey);
	const supportPhone = phone || SettingKeyInfo["MAIN_PHONE"]?.default;

	const errorMessages: Record<string, string> = {
		"رسید تکراری است": "این پرداخت قبلاً ثبت شده است. سفارش شما در حال پردازش است و نیازی به پرداخت مجدد نیست.",
		"تراکنش تایید نشده است": "پرداخت شما توسط بانک تایید نشد. مبلغ کسر شده ظرف ۲۴ ساعت به حساب شما برمی‌گردد.",
		"تایید نشده است": "بانک این تراکنش را تایید نکرد. در صورت کسر مبلغ، حداکثر پس از ۲۴ ساعت بازگشت داده می‌شود.",
		"فیش پرداخت یافت نشد": "اطلاعات پرداخت یافت نشد. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.",
		"هیچ عملیاتی برای این پرداخت یافت نشد": "خطای سیستمی در ثبت سفارش. لطفاً با پشتیبانی تماس بگیرید.",
	};

	const friendlyMsg = status ? msg : (errorMessages[msg] || msg || "خطای ناشناخته در پرداخت");

	return (
		<Container size="sm" className="py-10">
			<Paper shadow="md" radius="lg" p="xl" className="text-center">
				<Stack align="center" gap="md">
					<div
						className="center"
						style={{
							width: rem(120), height: rem(120), borderRadius: "50%",
							background: status ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
						}}
					>
						{status ? (
							<IconCheck size="5rem" color="green" />
						) : (
							<IconX size="5rem" color="red" />
						)}
					</div>

					<Text fw={700} size="xl" c={status ? "green" : "red"}>
						{status ? "پرداخت موفق" : "پرداخت ناموفق"}
					</Text>

					<Text size="md" c="dimmed" maw={450} style={{lineHeight: 1.8}}>
						{friendlyMsg}
					</Text>

					{!status && (
						<Paper withBorder p="sm" radius="md" bg="rgba(239,68,68,0.05)" w="100%">
							<Stack gap={4} align="center">
								<Group gap={6}>
									<IconAlertCircle size="1rem" color="red" />
									<Text size="sm" fw={500}>راهنما</Text>
								</Group>
								<Text size="xs" c="dimmed" ta="center" style={{lineHeight: 1.8}}>
									اگر مبلغی از حساب شما کسر شده و پرداخت ناموفق بود، مبلغ حداکثر پس از ۲۴ ساعت به‌صورت خودکار بازگردانده می‌شود.
									در صورت بروز مشکل با پشتیبانی در تماس باشید.
								</Text>
							</Stack>
						</Paper>
					)}

					<Group justify="center" gap="sm" mt="md">
						{!status && (
							<Link href="/dashboard/checkout">
								<Button variant="light" leftSection={<IconRefresh size="1rem" />}>
									تلاش مجدد
								</Button>
							</Link>
						)}
						<Link href={redirect}>
							<Button color={status ? "green" : "blue"} leftSection={<IconHome size="1rem" />}>
								{status ? "مشاهده سفارش" : "بازگشت به داشبورد"}
							</Button>
						</Link>
					</Group>

					<Paper withBorder p="sm" radius="md" mt="lg" w="100%">
						<Group justify="center" gap={8}>
							<IconPhoneCall size="1rem" className="text-primary" />
							<Text size="sm" fw={500}>پشتیبانی:</Text>
							<a href={`tel:${supportPhone}`}>
								<Text size="sm" fw={700} c="blue">{supportPhone}</Text>
							</a>
						</Group>
					</Paper>
				</Stack>
			</Paper>
		</Container>
	);
};

export default Page;
