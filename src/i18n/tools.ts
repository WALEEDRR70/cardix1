// Free tools registry — SEO magnets. Each is a working utility with unique metadata.
import type { Locale } from "@/i18n/config";
import { tx } from "@/lib/tx";

export interface ToolMeta {
  slug: string;
  icon: string; // lucide icon name
  copy: Partial<Record<Locale, { title: string; description: string; h1: string; subtitle: string; longIntro: string }>>;
}

export const TOOLS: ToolMeta[] = [
  {
    slug: "qr-generator",
    icon: "QrCode",
    copy: {
      en: {
        title: "Free QR Code Generator — Custom Colors, Logo, High-Res PNG | Cardixn",
        description: "Generate a free QR code for any URL, WiFi network, phone number or vCard. Customize colors, add a logo, download high-resolution PNG. No signup.",
        h1: "Free QR Code Generator",
        subtitle: "Instant, high-resolution, brand-colored QR codes. No signup.",
        longIntro: "Generate a QR code for any link, phone number, email, WiFi network or plain text in one click. Cardixn's free QR generator produces high-resolution PNG files ready for print, presentations, packaging, or NFC-plus-QR combo cards. Adjust foreground and background color, add error-correction, and download at up to 2000×2000 pixels. Unlimited use, no watermark, no account required.",
      },
      ar: {
        title: "منشئ رموز QR مجاني — ألوان مخصصة وصور عالية الدقة | Cardixn",
        description: "أنشئ رمز QR مجاني لأي رابط أو شبكة WiFi أو رقم هاتف أو بطاقة vCard. خصّص الألوان وأضف شعاراً وحمّل PNG بدقة عالية. بدون تسجيل.",
        h1: "منشئ رموز QR مجاني",
        subtitle: "رموز QR فورية بدقة عالية وألوان علامتك التجارية. بدون تسجيل.",
        longIntro: "أنشئ رمز QR لأي رابط أو رقم هاتف أو بريد أو شبكة WiFi أو نص عادي بضغطة واحدة. منشئ Cardixn المجاني يُنتج ملفات PNG عالية الدقة جاهزة للطباعة والعروض والعبوات وبطاقات NFC+QR المدمجة. اضبط لون الأمامية والخلفية وأضف تصحيح الأخطاء وحمّل بدقة تصل إلى 2000×2000 بكسل. استخدام غير محدود، بدون علامة مائية، بدون حساب.",
      },
    },
  },
  {
    slug: "vcard-generator",
    icon: "Contact",
    copy: {
      en: {
        title: "Free vCard Generator — Downloadable .vcf Contact File | Cardixn",
        description: "Create a downloadable .vcf vCard file with your contact information. Compatible with iPhone, Android, Outlook and Gmail. 100% free, no signup.",
        h1: "Free vCard (.vcf) Generator",
        subtitle: "The one-file contact standard that works on every phone.",
        longIntro: "A vCard (.vcf file) is the universal contact format that iPhone, Android, Outlook, Gmail and every modern address book understands. Enter your details, tap download, and you get a single file you can attach to emails, share on WhatsApp, or embed in a QR code. Cardixn's generator is free, unlimited, and never stores your data on our servers.",
      },
      ar: {
        title: "منشئ vCard مجاني — ملف جهة اتصال .vcf قابل للتنزيل | Cardixn",
        description: "أنشئ ملف .vcf قابل للتنزيل ببياناتك. متوافق مع iPhone وAndroid وOutlook وGmail. مجاني 100%، بدون تسجيل.",
        h1: "منشئ vCard (.vcf) مجاني",
        subtitle: "معيار جهات الاتصال الموحد الذي يعمل على كل هاتف.",
        longIntro: "ملف vCard (.vcf) هو التنسيق العالمي لجهات الاتصال الذي يفهمه iPhone وAndroid وOutlook وGmail وكل دفتر عناوين حديث. أدخل بياناتك، اضغط تنزيل، واحصل على ملف واحد يمكنك إرفاقه في البريد أو مشاركته على واتساب أو تضمينه في رمز QR. منشئ Cardixn مجاني وغير محدود ولا يخزّن بياناتك على خوادمنا.",
      },
    },
  },
  {
    slug: "email-signature",
    icon: "Mail",
    copy: {
      en: {
        title: "Free Email Signature Generator — HTML for Gmail & Outlook | Cardixn",
        description: "Build a professional HTML email signature in under a minute. Copy and paste into Gmail, Outlook, or Apple Mail. Includes social links and QR.",
        h1: "Free Email Signature Generator",
        subtitle: "A professional signature in every reply you send.",
        longIntro: "First impressions include the last thing you send. A polished email signature adds a photo, title, phone, website and social links to every message — without you retyping them. Cardixn's generator outputs clean, table-based HTML compatible with Gmail, Outlook (desktop and web), Apple Mail and Superhuman. Copy the rendered signature or the raw HTML and paste it into your mail client's signature settings.",
      },
      ar: {
        title: "منشئ توقيع البريد الإلكتروني — HTML لـGmail وOutlook | Cardixn",
        description: "أنشئ توقيع بريد إلكتروني احترافي بـHTML خلال دقيقة. انسخه والصقه في Gmail أو Outlook أو Apple Mail. مع روابط التواصل ورمز QR.",
        h1: "منشئ توقيع البريد الإلكتروني",
        subtitle: "توقيع احترافي في كل رد ترسله.",
        longIntro: "الانطباع الأول يشمل آخر شيء ترسله. توقيع بريد أنيق يضيف صورة ومسمى وهاتف وموقع وروابط تواصل لكل رسالة — دون إعادة كتابة. منشئ Cardixn يُنتج HTML نظيف مبني على جداول، متوافق مع Gmail وOutlook (سطح المكتب والويب) وApple Mail وSuperhuman. انسخ التوقيع المعروض أو HTML الخام والصقه في إعدادات توقيع بريدك.",
      },
    },
  },
];

export function getTool(slug: string) {
  return TOOLS.find((t) => t.slug === slug);
}
export function getToolCopy(t: ToolMeta, locale: Locale) {
  const authored = t.copy[locale];
  if (authored) return authored;
  // No hand-authored copy for this locale — translate the English source.
  const en = t.copy.en!;
  return {
    title: tx(en.title, locale),
    description: tx(en.description, locale),
    h1: tx(en.h1, locale),
    subtitle: tx(en.subtitle, locale),
    longIntro: tx(en.longIntro, locale),
  };
}
export function getAllToolSlugs() {
  return TOOLS.map((t) => t.slug);
}
