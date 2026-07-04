import type { Metadata } from "next";
import { Google_Sans } from "next/font/google";
import { getSiteSettings } from "@/app/_lib/settings";
import "./globals.css";

const googleSans = Google_Sans({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-sans"
});

export async function generateMetadata(): Promise<Metadata> {
	const settings = await getSiteSettings();

	return {
		title: settings.siteName,
		description: settings.description
	};
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={googleSans.variable}>
			<body>{children}</body>
		</html>
	);
}
