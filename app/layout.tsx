import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "CONSTRUCTORA MAZA QUIROZ",
  description: "Sistema de gestión técnica para expedientes de Techo Propio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable} h-full antialiased`}>
      <body className="font-sans min-h-full flex flex-col bg-[#0a0c10] text-[#e2e8f0]">
        {children}
      </body>
    </html>
  );
}
