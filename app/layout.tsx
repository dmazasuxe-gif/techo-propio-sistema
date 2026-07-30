import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Techo Propio Pro | Sistema de Expediente Técnico",
  description: "Sistema inteligente para la automatización, cálculo de metrados, APU y presupuestos para la modalidad de Construcción en Sitio Propio (CSP).",
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
