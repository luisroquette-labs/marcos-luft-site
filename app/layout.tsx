import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "../components/SmoothScroll";
import { BASE } from "./base";

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

// Base absoluta para resolver URLs relativas em metadata (OG/Twitter image,
// canonical) — sem ela o Next não sabe que o site vive sob o path de projeto
// do GitHub Pages, não na raiz do domínio.
const SITE_URL = "https://luisroquette-labs.github.io/marcos-luft-site/";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Marcos Luft — Assessoria de Imprensa e Comunicação Institucional",
  description:
    "26+ anos unindo jornalismo de rede nacional (Rede Globo/RBS TV) e comunicação institucional de longo prazo. Assessoria de imprensa, gestão de imagem, produção de conteúdo e cobertura de eventos em Santo Ângelo e região.",
  openGraph: {
    title: "Marcos Luft — Assessoria de Imprensa e Comunicação Institucional",
    description:
      "Da redação nacional para a sua mesa: 26+ anos de experiência em jornalismo e comunicação institucional, hoje à disposição de câmaras, campanhas e empresas.",
    type: "website",
    locale: "pt_BR",
    images: [{ url: `${BASE}/hero-banner.jpeg` }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${inter.variable}`}>
      <body>
        {/* .reveal starts at opacity:0 (globals.css) and only reaches 1 once
            components/Reveal.tsx's IntersectionObserver fires — with JS
            disabled that observer never runs, so content would stay
            invisible forever. This override only exists for that case. */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
