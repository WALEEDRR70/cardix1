import type { Locale } from "@/i18n/config";

// Per-locale SEO title + description for the landing page.
// Falls back to English when a locale isn't listed.
type Seo = { title: string; description: string };

const en: Seo = {
  title: "Cardix — Premium digital business cards",
  description: "Design luxury digital business cards. Share via QR, NFC or link. AI paper-card scanner, real-time analytics, 20 languages.",
};

export const LANDING_SEO: Record<Locale, Seo> = {
  en,
  ar: { title: "كارديكس — بطاقات أعمال رقمية فاخرة", description: "صمّم بطاقات أعمال رقمية فاخرة. شارك عبر QR أو NFC أو رابط. ماسح ذكي للبطاقات الورقية، تحليلات لحظية، 20 لغة." },
  fr: { title: "Cardix — Cartes de visite numériques premium", description: "Créez des cartes de visite numériques élégantes. Partagez par QR, NFC ou lien. Scanner IA de cartes papier, analyses en temps réel, 20 langues." },
  de: { title: "Cardix — Premium digitale Visitenkarten", description: "Gestalten Sie edle digitale Visitenkarten. Teilen per QR, NFC oder Link. KI-Papier-Scanner, Live-Analysen, 20 Sprachen." },
  es: { title: "Cardix — Tarjetas de visita digitales premium", description: "Diseña tarjetas de visita digitales de lujo. Comparte por QR, NFC o enlace. Escáner IA de tarjetas de papel, analíticas en tiempo real, 20 idiomas." },
  it: { title: "Cardix — Biglietti da visita digitali premium", description: "Progetta biglietti da visita digitali eleganti. Condividi via QR, NFC o link. Scanner IA per biglietti cartacei, analitiche in tempo reale, 20 lingue." },
  pt: { title: "Cardix — Cartões de visita digitais premium", description: "Desenhe cartões de visita digitais de luxo. Compartilhe via QR, NFC ou link. Scanner IA de cartões de papel, analytics em tempo real, 20 idiomas." },
  ru: { title: "Cardix — Премиальные цифровые визитки", description: "Создавайте роскошные цифровые визитки. Делитесь через QR, NFC или ссылку. ИИ-сканер бумажных визиток, аналитика в реальном времени, 20 языков." },
  tr: { title: "Cardix — Premium dijital kartvizitler", description: "Lüks dijital kartvizitler tasarlayın. QR, NFC veya bağlantı ile paylaşın. Yapay zekâ kâğıt tarayıcı, canlı analiz, 20 dil." },
  nl: { title: "Cardix — Premium digitale visitekaartjes", description: "Ontwerp luxe digitale visitekaartjes. Deel via QR, NFC of link. AI-papierscanner, live analyses, 20 talen." },
  pl: { title: "Cardix — Premium cyfrowe wizytówki", description: "Projektuj luksusowe cyfrowe wizytówki. Udostępniaj przez QR, NFC lub link. Skaner AI wizytówek papierowych, analityka w czasie rzeczywistym, 20 języków." },
  zh: { title: "Cardix — 高级数字名片", description: "设计精致的数字名片。通过二维码、NFC 或链接分享。AI 纸卡扫描、实时数据分析,支持 20 种语言。" },
  "zh-TW": { title: "Cardix — 高級數位名片", description: "設計精緻的數位名片。透過 QR、NFC 或連結分享。AI 紙本掃描、即時分析,支援 20 種語言。" },
  ja: { title: "Cardix — プレミアムなデジタル名刺", description: "洗練されたデジタル名刺をデザイン。QR、NFC、リンクで共有。AI紙名刺スキャナー、リアルタイム分析、20言語対応。" },
  ko: { title: "Cardix — 프리미엄 디지털 명함", description: "고급 디지털 명함을 디자인하세요. QR, NFC 또는 링크로 공유. AI 종이 명함 스캐너, 실시간 분석, 20개 언어." },
  hi: { title: "Cardix — प्रीमियम डिजिटल विज़िटिंग कार्ड", description: "शानदार डिजिटल विज़िटिंग कार्ड डिज़ाइन करें। QR, NFC या लिंक से शेयर करें। AI पेपर-कार्ड स्कैनर, रीयल-टाइम एनालिटिक्स, 20 भाषाएँ।" },
  id: { title: "Cardix — Kartu nama digital premium", description: "Rancang kartu nama digital mewah. Bagikan lewat QR, NFC, atau tautan. Pemindai kartu kertas AI, analitik real-time, 20 bahasa." },
  ms: { title: "Cardix — Kad perniagaan digital premium", description: "Reka kad perniagaan digital mewah. Kongsi melalui QR, NFC atau pautan. Pengimbas kad kertas AI, analitik masa nyata, 20 bahasa." },
  th: { title: "Cardix — นามบัตรดิจิทัลระดับพรีเมียม", description: "ออกแบบนามบัตรดิจิทัลสุดหรู แชร์ผ่าน QR, NFC หรือลิงก์ เครื่องสแกนนามบัตรกระดาษด้วย AI, การวิเคราะห์เรียลไทม์, 20 ภาษา" },
  vi: { title: "Cardix — Danh thiếp kỹ thuật số cao cấp", description: "Thiết kế danh thiếp kỹ thuật số sang trọng. Chia sẻ qua QR, NFC hoặc liên kết. Máy quét danh thiếp giấy AI, phân tích thời gian thực, 20 ngôn ngữ." },
};

export function getLandingSeo(locale: Locale): Seo {
  return LANDING_SEO[locale] ?? en;
}
