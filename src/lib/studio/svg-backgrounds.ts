// Curated editable SVG backgrounds. Each preset is plain SVG markup that gets
// parsed into individual studio `path` nodes — points and colors stay editable.
export type SvgBackgroundPreset = {
  key: string;
  en: string;
  ar: string;
  markup: string;
};

const wrap = (vb: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;

export const SVG_BACKGROUNDS: SvgBackgroundPreset[] = [
  {
    key: "amber-wave",
    en: "Amber wave",
    ar: "موجة كهرمانية",
    markup: wrap(
      "0 0 1131.82 999.97",
      `<path fill="#0e1007" d="M942.53,0H0v999.97h845.02c198.72-133.89,449.61-249.32,144.45-561.54C849.9,280.82,796.63,131.2,942.53,0Z"/>
       <path fill="#e99d2e" d="M835.26,384.26c184.34,186.61,255.06,394.55,255.32,615.71H326.81c382.79-55.97,615.71-334.04,508.45-615.71Z"/>`,
    ),
  },
  {
    key: "soft-diagonal",
    en: "Soft diagonal",
    ar: "قطر ناعم",
    markup: wrap(
      "0 0 1200 800",
      `<path fill="#101018" d="M0 0 H1200 V800 H0 Z"/>
       <path fill="#7c34ff" d="M0 800 C 320 620, 520 700, 780 470 C 980 290, 1080 160, 1200 0 L1200 800 Z"/>
       <path fill="#ffffff14" d="M0 800 C 260 700, 480 760, 720 560 C 900 410, 1020 300, 1200 150 L1200 300 C 1000 430, 880 540, 700 660 C 480 800, 260 800, 0 800 Z"/>`,
    ),
  },
  {
    key: "corner-arc",
    en: "Corner arc",
    ar: "قوس الزاوية",
    markup: wrap(
      "0 0 1200 800",
      `<path fill="#f5f2ec" d="M0 0 H1200 V800 H0 Z"/>
       <path fill="#123227" d="M1200 0 V800 H520 C 760 620, 900 400, 830 180 C 800 90, 900 30, 1200 0 Z"/>
       <path fill="#c8a24a" d="M1200 520 V800 H900 C 1010 720, 1120 630, 1200 520 Z"/>`,
    ),
  },
  {
    key: "ribbon",
    en: "Ribbon band",
    ar: "شريط منحني",
    markup: wrap(
      "0 0 1200 800",
      `<path fill="#0b1120" d="M0 0 H1200 V800 H0 Z"/>
       <path fill="#1d4ed8" d="M0 300 C 260 180, 500 420, 760 300 C 960 210, 1080 240, 1200 300 L1200 470 C 1040 400, 940 380, 760 470 C 500 600, 260 360, 0 470 Z"/>
       <path fill="#38bdf8" opacity="0.55" d="M0 470 C 260 360, 500 600, 760 470 C 940 380, 1040 400, 1200 470 L1200 560 C 1040 500, 940 480, 760 560 C 500 680, 260 460, 0 560 Z"/>`,
    ),
  },
  {
    key: "split-blade",
    en: "Split blade",
    ar: "نصل مائل",
    markup: wrap(
      "0 0 1200 800",
      `<path fill="#141414" d="M0 0 H1200 V800 H0 Z"/>
       <path fill="#e5e5e5" d="M0 0 H520 L300 800 H0 Z"/>
       <path fill="#d92b2b" d="M520 0 H640 L420 800 H300 Z"/>`,
    ),
  },
  {
    key: "dune",
    en: "Dune layers",
    ar: "طبقات الكثبان",
    markup: wrap(
      "0 0 1200 800",
      `<path fill="#1b1109" d="M0 0 H1200 V800 H0 Z"/>
       <path fill="#8a4b1f" d="M0 560 C 240 460, 420 620, 700 540 C 920 480, 1060 520, 1200 470 L1200 800 H0 Z"/>
       <path fill="#e0a76a" d="M0 680 C 260 600, 460 740, 760 660 C 980 600, 1080 640, 1200 610 L1200 800 H0 Z"/>`,
    ),
  },
];
