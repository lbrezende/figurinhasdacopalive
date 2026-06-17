import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Airbnb roda em Cereal VF; Inter é o substituto open-source documentado no DESIGN.md.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-canvas text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
