import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PaperToSic@l - Diputación de Sevilla",
  description: "Sistema de validación e inscripción de facturas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} font-sans`} suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-background-light dark:bg-background-dark">
        {children}
      </body>
    </html>
  );
}
