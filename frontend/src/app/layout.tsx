import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/contexts/SessionContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
    title: "ImgHarvest — Image Scraper & ML Data Prep",
    description:
        "Search, review, and download ML-ready image datasets. Convert to PNG, JPG, or WebP and download as ZIP.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body suppressHydrationWarning>
                <SessionProvider>
                    <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-1">{children}</main>
                    </div>
                </SessionProvider>
            </body>
        </html>
    );
}
