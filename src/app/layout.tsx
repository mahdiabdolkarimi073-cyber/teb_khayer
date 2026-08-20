import "./globals.css";
import type {Metadata} from "next";
import {ModalsProvider} from "@mantine/modals";
import {DirectionProvider, MantineProvider} from "@mantine/core";
import mantineTheme from "@/app/theme";
import React from "react";
import OverrideWindow from "@/app/OverrideWindow";
import AppConfig from "@/config/AppConfig";
import {ToastContainer} from "react-toastify";

export const metadata: Metadata = {
	title: "طب خیر",
	description: "گروه طب خیّر با هدف آموزش جامع طب سنتی و طب ایرانی اسلامی و طب چینی",
	icons: {
		icon: "/logo.webp"
	}

};

export default function RootLayout({
								children,
							}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html dir="rtl" lang="fa" data-mantine-color-scheme="light">
		<head>
			<meta name="google-site-verification" content="c8J6q-8hvFGSNIyCm1EBT9ovyeoOw4uU844hT2xvF1Q"/>
			<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
		</head>
		<body>
		<DirectionProvider initialDirection={'rtl'}>
			<MantineProvider theme={mantineTheme}>
				<OverrideWindow/>
				{children}
				<ModalsProvider>
					<></>
				</ModalsProvider>
				<ToastContainer
					position="top-center"
					autoClose={5000}
					hideProgressBar={false}
					newestOnTop
					closeOnClick
					rtl={true}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="light"
					bodyStyle={{
						fontFamily: "var(--font)"
					}}
				/>
			</MantineProvider>

		</DirectionProvider>
		</body>
		</html>
	);
}
