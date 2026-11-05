import type { Metadata } from "next";
import "./globals.css";
import { FinanceProvider } from "@/context/finance-context";

export const metadata: Metadata = {
  title: "Antigravity — Personal Finance & Expense Management",
  description: "Enterprise-grade personal wealth, expense tracking, and budget management suite.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F8F7F2] text-[#171A18]">
        <FinanceProvider>{children}</FinanceProvider>
      </body>
    </html>
  );
}
