import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import BadgeMode from "@/components/BadgeMode";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DrawerLocal – Your receipts, sorted. Your data, never uploaded.",
  description: "Offline receipt extraction with open‑weight AI. Private, fast, and free.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-primary`}> 
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-col flex-1">
            <TopBar />
            <main className="flex-1 p-6 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
        <BadgeMode />
      </body>
    </html>
  );
}
