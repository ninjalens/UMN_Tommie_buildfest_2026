import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Food Hub One-Stop",
  description: "Patron · Provider · Supplier — One-stop food data sharing and pickup platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
