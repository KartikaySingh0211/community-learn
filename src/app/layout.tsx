import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "CommunityLearn",
	description: "A community-driven learning platform",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<AuthProvider>
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased bg-yellow-100`}
				>
					<Navbar />
					<main>{children}</main>
				</body>
			</AuthProvider>
		</html>
	);
}
