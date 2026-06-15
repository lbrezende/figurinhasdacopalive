import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Figura Certa — Complete seu álbum sem caçar troca",
  description:
    "O app que organiza seu álbum, acha quem na sua cidade tem a figurinha que falta e marca o ponto e a hora do encontro.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${jakarta.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
