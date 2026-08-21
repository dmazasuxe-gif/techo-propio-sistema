import type { Metadata } from "next";
import { Outfit, Montserrat, Work_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  title: "CONSTRUCTORA MAZA QUIROZ",
  description: "Sistema de gestión técnica para expedientes de Techo Propio",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Constructora Maza Quiroz - Techo Propio",
    description: "Construimos tu hogar con el programa Techo Propio. Conoce más sobre nuestros proyectos y beneficios.",
    siteName: "Constructora Maza Quiroz",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Constructora Maza Quiroz Logo",
      },
    ],
    locale: "es_PE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable} ${montserrat.variable} ${workSans.variable} h-full antialiased`}>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
  </head>
      <body className="font-sans min-h-full flex flex-col bg-[#0a0c10] text-[#e2e8f0]">
        {children}
      </body>
    </html>
  );
}
