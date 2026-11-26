import type { Metadata } from "next";
import { Manrope } from "next/font/google"; // 1. Importamos Manrope
import "./globals.css";

// 2. Configuramos la fuente
const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PhishWarden MJ",
  description: "Plataforma de concientización en ciberseguridad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      {/* 3. Le aplicamos la fuente a toda la página en el body */}
      <body className={`${manrope.className} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}