import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import BadgeMode from "@/components/BadgeMode";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DrawerLocal – Your receipts, sorted. Your data, never uploaded.",
  description: "Offline-first receipt extraction with open‑weight AI. Private, fast, auditable, and built for freelancers.",
  icons: {
    icon: "/favicon.ico",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-[#090a0f] text-zinc-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <TopBar />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
        <BadgeMode />
      </body>
    </html>
  );
}
