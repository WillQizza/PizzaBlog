import type { Metadata } from "next";
import { getSiteSettings } from "@/app/_lib/settings";
import "./globals.css";

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
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
