import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "../components/SmoothScroll";

// Identidade editorial ink-on-cream (AD-1):
// Fraunces — serif display de alto contraste, usada nos títulos.
// Inter — sans neutra, usada no corpo e nos labels.
// `variable` nomeia a custom property diretamente como `--font-display`/
// `--font-sans` para que globals.css nunca precise repetir o nome da fonte.
const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marcos Luft — Assessoria de Imprensa e Comunicação Institucional",
  description:
    "26+ anos unindo jornalismo de rede nacional (Rede Globo/RBS TV) e comunicação institucional de longo prazo. Assessoria de imprensa, gestão de imagem, produção de conteúdo e cobertura de eventos em Santo Ângelo e região.",
  openGraph: {
    title: "Marcos Luft — Assessoria de Imprensa e Comunicação Institucional",
    description:
      "Da redação nacional para a sua mesa: 26+ anos de experiência em jornalismo e comunicação institucional, hoje à disposição de câmaras, campanhas e empresas.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${inter.variable}`}>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
