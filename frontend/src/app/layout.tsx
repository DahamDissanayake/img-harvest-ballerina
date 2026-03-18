import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
    title: "ImgHarvest - Image Scraper & ML Data Prep",
    description:
        "Search, review, and download ML-ready image datasets. Convert to PNG, JPG, or WebP and download as ZIP.",
    icons: {
        icon: [
            {
                url: "/icon.svg",
                type: "image/svg+xml",
            },
        ],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body suppressHydrationWarning>
                <Providers>
                    <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-1">{children}</main>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
