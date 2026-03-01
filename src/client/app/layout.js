// src/client/app/layout.js
import "@styles/globals.css"
import { Toaster } from "react-hot-toast"
import React, { Suspense } from "react"
import ReactQueryProvider from "@lib/ReactQueryProvider"
import LayoutWrapper from "@components/layout/LayoutWrapper"
import { PostHogProvider } from "@components/PostHogProvider"

export const metadata = {
	title: "Sentient",
	description: "Your personal AI that actually gets work done"
}

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="true"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
					rel="stylesheet"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap"
					rel="stylesheet"
				/>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/>
				<meta name="theme-color" content="#F1A21D" />
			</head>
			<body className="font-sans" suppressHydrationWarning>
				<ReactQueryProvider>
					<Toaster position="bottom-right" />
					<div className="flex h-screen w-full text-white overflow-hidden">
						<Suspense>
							<LayoutWrapper>{children}</LayoutWrapper>
						</Suspense>
					</div>
				</ReactQueryProvider>
			</body>
		</html>
	)
}
