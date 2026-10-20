import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "../components/SmoothScroll";
import { BASE } from "./base";
import { seo } from "./content";

// Identidade editorial ink-on-cream (AD-1):
// Fraunces — serif display de alto contraste, usada nos títulos.
// Inter — sans neutra, usada no corpo e nos labels.
// `variable` nomeia a custom property diretamente como `--font-display`/
// `--font-sans` para que globals.css nunca precise repetir o nome da fonte.
//
// Fraunces é carregada em DUAS chamadas, não uma com style:["normal","italic"]
// — next/font baixa o produto cartesiano peso×estilo de uma única chamada, e
// nenhum texto do site usa 600 itálico (grep em globals.css: itálico só
// aparece em peso 400 — .prova-band-framing — e 500 — .section-head h2 .em).
// Separar normal (3 pesos) de itálico (2 pesos, sua própria variável) corta
// esse arquivo nunca usado em vez de baixá-lo por "vir de brinde" no array.
const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal"],
  variable: "--font-display",
  display: "swap",
});

const displayItalic = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic"],
  variable: "--font-display-italic",
  display: "swap",
});

// Inter: peso 700 nunca é usado em globals.css (grep font-weight — só 400
// implícito, 500 e 600 aparecem), então não é pedido.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

// Base absoluta para resolver URLs relativas em metadata (OG/Twitter image,
// canonical) — sem ela o Next não sabe que o site vive sob o path de projeto
// do GitHub Pages, não na raiz do domínio.
const SITE_URL = "https://luisroquette-labs.github.io/marcos-luft-site/";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: seo.title,
  description: seo.description,
  openGraph: {
    title: seo.title,
    description: seo.ogDescription,
    type: "website",
    locale: "pt_BR",
    images: [{ url: `${BASE}/hero-banner.jpeg` }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${displayItalic.variable} ${inter.variable}`}>
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
