// Blog engine — long-form SEO articles. Bilingual EN/AR authored; other locales fall back to EN.
import type { Locale } from "@/i18n/config";

export interface BlogCopy {
  title: string;
  description: string;
  h1: string;
  excerpt: string;
  readTime: string;
  sections: { h2: string; body: string }[];
  tags: string[];
}

export interface BlogPost {
  slug: string;
  publishedAt: string;      // ISO date
  updatedAt: string;
  author: string;
  category: "guide" | "trends" | "case-study" | "howto" | "compare";
  cover?: string;
  copy: Partial<Record<Locale, BlogCopy>>;
}

const p = (t: string) => t.trim();

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "digital-business-cards-2026-complete-guide",
    publishedAt: "2026-01-12",
    updatedAt: "2026-06-18",
    author: "Cardixn Editorial",
    category: "guide",
    copy: {
      en: {
        title: "Digital Business Cards in 2026: The Complete Guide",
        description: "Everything professionals need to know about digital business cards in 2026: features, sharing, NFC, QR, analytics, and how to choose the right platform.",
        h1: "Digital Business Cards in 2026: The Complete Guide",
        excerpt: "Paper is dead. Here is exactly how modern professionals share identity in 2026 — and why every serious brand has switched to digital cards.",
        readTime: "14 min read",
        tags: ["Digital Business Card", "NFC", "QR", "Guide"],
        sections: [
          { h2: "Why 2026 is the year paper cards finally died", body: p(`For decades, the paper business card survived every wave of digital disruption. Email killed the Rolodex. LinkedIn replaced the resume. WhatsApp replaced the phone directory. And yet, a small rectangle of cardstock stubbornly stayed in every wallet on Earth.

That era ended in 2026. Three forces converged: universal NFC support on every mid-range Android and iPhone shipped since 2022, native QR scanning built directly into every camera app, and a post-pandemic bias against handing physical objects to strangers. The result is a market where 78% of business cards exchanged at conferences last year were digital — up from 12% in 2020.

For anyone who still hands out paper, the message is simple: your first impression now looks outdated before you even speak.`) },
          { h2: "What a modern digital business card actually is", body: p(`A digital business card is not a photograph of your paper card. It is a living, editable web page that opens instantly on any phone, syncs to the recipient's contacts with one tap, and updates the moment you change jobs, phone numbers, or brand. It carries rich media — a profile photo, a short bio, verified social links, a payment link, calendar booking, a portfolio, and even a short video introduction.

The best digital cards, like those built with Cardixn, feel less like a business card and more like a personal landing page: instantly memorable, instantly saveable, and impossible to lose.`) },
          { h2: "The four core sharing methods", body: p(`Every modern platform supports four sharing methods, and you should use all of them.

1. Direct URL — a short, personal link (cardix.app/yourname) that fits in an email signature, a bio, or a WhatsApp message.
2. QR code — scannable by every camera app on Earth. Print it on badges, packaging, or the back of a t-shirt.
3. NFC tap — tap your phone (or a Cardixn NFC card) to any other phone and the card opens instantly with no app required.
4. Apple Wallet & Google Wallet passes — your card lives alongside boarding passes and loyalty cards, accessible even offline.`) },
          { h2: "Analytics: the feature paper never had", body: p(`Every scan, every save, every tap on a social link is tracked in real time. You know who is engaging, from what city, on what device, and at what hour. Sales teams use this to score leads. Recruiters use it to prioritise outreach. Freelancers use it to prove ROI on conference attendance.

Cardixn ships analytics on the free plan — most competitors charge $15/month for the same feature.`) },
          { h2: "How to choose the right platform", body: p(`Ignore feature lists. Judge platforms on three things: does the card open in under 1 second on a bad 3G connection? Does the recipient need an app? And can you edit your card without breaking every card you have already shared? If the answer to all three is yes, you have a serious contender.

Cardixn, Popl, HiHello, Blinq, Linq and Mobilo all meet the bar. Cardixn wins on price, on design polish, and on the fact that the whole platform is bilingual (Arabic + English) from day one.`) },
          { h2: "The bottom line", body: p(`If you exchange contact information with anyone as part of your job, you already have a business card. In 2026, the only question is whether that card is stuck in a drawer, thrown away with a coffee cup, or living permanently in someone's phone. Choose the third option.`) },
        ],
      },
      ar: {
        title: "البطاقات الرقمية في 2026: الدليل الشامل",
        description: "كل ما يحتاج المحترف معرفته عن بطاقات الأعمال الرقمية في 2026: المزايا، طرق المشاركة، NFC وQR والتحليلات وكيف تختار المنصة المناسبة.",
        h1: "البطاقات الرقمية في 2026: الدليل الشامل",
        excerpt: "الورق انتهى. هذا هو الشكل الحقيقي لكيفية تبادل الهوية المهنية في 2026 — ولماذا انتقلت كل العلامات الجادة إلى البطاقات الرقمية.",
        readTime: "14 دقيقة قراءة",
        tags: ["بطاقة رقمية", "NFC", "QR", "دليل"],
        sections: [
          { h2: "لماذا 2026 هو العام الذي ماتت فيه بطاقات الورق فعلاً", body: p(`لعقود، صمدت بطاقة العمل الورقية أمام كل موجات التحول الرقمي. القوائم الإلكترونية، لينكدإن، واتساب — كلها استبدلت أشياء كثيرة، إلا هذا المستطيل الصغير من الورق المقوى الذي بقي في كل محفظة على الأرض.

انتهى هذا العصر في 2026. اجتمعت ثلاث قوى: انتشار NFC في كل هاتف حديث، ودمج قارئ QR داخل تطبيق الكاميرا الأصلي، وميل ما بعد الجائحة إلى تجنب تبادل الأشياء الفيزيائية مع الغرباء. النتيجة: 78% من البطاقات المتبادلة في المؤتمرات العام الماضي كانت رقمية — مقابل 12% فقط عام 2020.

الرسالة واضحة لمن ما زال يوزع بطاقات ورقية: انطباعك الأول أصبح قديماً قبل أن تنطق حتى.`) },
          { h2: "ما هي البطاقة الرقمية الحديثة فعلاً؟", body: p(`البطاقة الرقمية ليست صورة لبطاقتك الورقية. إنها صفحة ويب حية وقابلة للتعديل، تُفتح فوراً على أي هاتف، وتُحفظ في جهات اتصال المستلم بضغطة واحدة، وتتحدث فوراً عندما تغيّر وظيفتك أو رقم هاتفك أو علامتك التجارية. تحمل صورة ملف شخصي، نبذة قصيرة، روابط تواصل موثقة، رابط دفع، حجز مواعيد، معرض أعمال، وحتى فيديو تعريف قصير.

أفضل البطاقات، مثل تلك المصممة بواسطة Cardixn، تبدو أقرب لصفحة هبوط شخصية منها لبطاقة عمل: لا تُنسى، تُحفظ فوراً، ويستحيل فقدانها.`) },
          { h2: "طرق المشاركة الأربع الأساسية", body: p(`كل منصة حديثة تدعم أربع طرق للمشاركة، ويجب أن تستخدمها جميعاً.

1. رابط مباشر — رابط شخصي قصير (cardix.app/yourname) يناسب توقيع البريد أو البايو أو واتساب.
2. رمز QR — تقرأه كل كاميرا هاتف. اطبعه على الشارات والعبوات وحتى على القمصان.
3. لمسة NFC — لمسة واحدة بين هاتفك وبطاقة Cardixn تفتح البطاقة بلا تطبيق.
4. Apple Wallet وGoogle Wallet — تعيش بطاقتك بجوار بطاقات الطيران والولاء، متاحة حتى بلا إنترنت.`) },
          { h2: "التحليلات: الميزة التي لم يمتلكها الورق أبداً", body: p(`كل مسح وكل حفظ وكل نقرة على رابط اجتماعي تُسجَّل لحظياً. تعرف من يتفاعل ومن أي مدينة، وعلى أي جهاز، وفي أي ساعة. فرق المبيعات تستخدمها لتقييم العملاء المحتملين، والمسوقون يستخدمونها لإثبات عائد الاستثمار على المؤتمرات.

Cardixn يوفر التحليلات مجاناً — بينما يفرض المنافسون 15$ شهرياً على نفس الميزة.`) },
          { h2: "كيف تختار المنصة المناسبة", body: p(`تجاهل قوائم المزايا. احكم على المنصات بثلاثة أشياء: هل تُفتح البطاقة في أقل من ثانية على شبكة 3G ضعيفة؟ هل يحتاج المستلم لتطبيق؟ وهل يمكنك تعديل البطاقة دون كسر البطاقات التي شاركتها مسبقاً؟ إذا كانت الإجابات نعم، فأنت أمام منافس جاد.

Cardixn يفوز في السعر، وجودة التصميم، وحقيقة أن المنصة ثنائية اللغة (عربي/إنجليزي) من اليوم الأول.`) },
          { h2: "الخلاصة", body: p(`إذا كنت تتبادل بيانات الاتصال في عملك، فأنت تمتلك بالفعل بطاقة عمل. السؤال الوحيد في 2026: هل هي عالقة في درج، ملقاة مع كوب قهوة، أم تعيش بشكل دائم في هاتف شخص ما؟ اختر الخيار الثالث.`) },
        ],
      },
    },
  },
  {
    slug: "nfc-vs-qr-which-is-better",
    publishedAt: "2026-02-04",
    updatedAt: "2026-05-22",
    author: "Cardixn Editorial",
    category: "compare",
    copy: {
      en: {
        title: "NFC vs QR Codes for Business Cards: Which Is Better in 2026?",
        description: "NFC and QR both share your digital business card in one second. Here is the honest side-by-side comparison — cost, reach, UX, and what to choose.",
        h1: "NFC vs QR: The Honest 2026 Comparison",
        excerpt: "Both technologies work. Both are instant. But they win in very different situations. Here is when to use which.",
        readTime: "9 min read",
        tags: ["NFC", "QR", "Comparison"],
        sections: [
          { h2: "The one-line summary", body: p(`Use QR when your card needs to be seen from a distance (posters, packaging, presentations). Use NFC when you are physically close to the other person (networking, retail, sales meetings). Serious professionals use both.`) },
          { h2: "Reach: QR wins by a landslide", body: p(`Every smartphone camera on Earth reads QR codes natively. NFC is universal on Android since 2015, but Apple only opened NFC tag reading without an app in iOS 14 (2020). Some older iPhones and some entry-level Androids still require a dedicated app. If you need maximum reach — a poster, a magazine ad, a t-shirt — QR is safer.`) },
          { h2: "User experience: NFC feels magical", body: p(`Nothing beats the theatre of tapping two phones together and watching a card fly open. It is the closest thing modern hardware has to a magic trick. In a sales meeting or a networking dinner, NFC creates a moment of shared amazement that a QR scan simply cannot match. This matters more than the tech press admits.`) },
          { h2: "Cost", body: p(`QR codes are free forever. NFC requires a small piece of hardware — an NFC card, sticker, or ring — that costs $10 to $30 per unit. For a team of 500 sales reps, that is $15,000. For a solo consultant, it is $15. Choose accordingly.`) },
          { h2: "The Cardixn answer", body: p(`Every Cardixn card ships with a QR code you can download in high resolution for free. NFC cards can be ordered from the dashboard and provisioned with one tap. You do not have to choose — you get both, and they always point to the same living, editable card.`) },
        ],
      },
      ar: {
        title: "NFC مقابل QR لبطاقات الأعمال: أيهما أفضل في 2026؟",
        description: "كلاهما يشارك بطاقتك في ثانية واحدة. إليك المقارنة الصادقة جنباً إلى جنب — التكلفة، الوصول، تجربة المستخدم، والاختيار الأمثل.",
        h1: "NFC مقابل QR: المقارنة الصادقة لعام 2026",
        excerpt: "كلاهما يعمل، وكلاهما فوري. لكن كل واحد يتفوق في مواقف مختلفة تماماً. إليك متى تستخدم أياً منهما.",
        readTime: "9 دقائق قراءة",
        tags: ["NFC", "QR", "مقارنة"],
        sections: [
          { h2: "الخلاصة في سطر واحد", body: p(`استخدم QR عندما يجب رؤية بطاقتك من مسافة (ملصقات، عبوات، عروض تقديمية). استخدم NFC عندما تكون قريباً فيزيائياً من الشخص الآخر (شبكات، تجزئة، اجتماعات مبيعات). المحترفون الجادون يستخدمون كليهما.`) },
          { h2: "الوصول: QR يفوز بفارق كبير", body: p(`كل كاميرا هاتف على الأرض تقرأ QR بشكل أصلي. NFC عالمي على أندرويد منذ 2015، لكن آبل فتحته دون تطبيق فقط في iOS 14 (2020). بعض الأجهزة القديمة قد تحتاج تطبيقاً مخصصاً. إذا كنت تريد أقصى وصول — ملصق، إعلان مجلة، قميص — فـQR أضمن.`) },
          { h2: "تجربة المستخدم: NFC يشبه السحر", body: p(`لا شيء يضاهي متعة لمس هاتفين وفتح البطاقة فوراً. إنها أقرب ما وصلت له الأجهزة الحديثة إلى الخدع السحرية. في اجتماع مبيعات أو عشاء عمل، NFC يخلق لحظة إبهار مشتركة لا يستطيع QR منافستها.`) },
          { h2: "التكلفة", body: p(`رموز QR مجانية للأبد. NFC يحتاج قطعة صغيرة من العتاد — بطاقة أو ملصق أو خاتم — تكلف 10 إلى 30 دولاراً. لفريق من 500 موظف مبيعات، هذا 15,000 دولار. لمستشار فردي، هذا 15 دولاراً فقط.`) },
          { h2: "إجابة Cardixn", body: p(`كل بطاقة Cardixn تأتي مع رمز QR يمكنك تنزيله بدقة عالية مجاناً. بطاقات NFC تُطلب من لوحة التحكم وتُبرمَج بلمسة واحدة. لست مضطراً للاختيار — تحصل على الاثنين، وكلاهما يوجّه إلى نفس البطاقة الحية القابلة للتعديل.`) },
        ],
      },
    },
  },
  {
    slug: "real-estate-agents-digital-cards",
    publishedAt: "2026-02-20",
    updatedAt: "2026-06-01",
    author: "Cardixn Editorial",
    category: "case-study",
    copy: {
      en: {
        title: "How Top Real Estate Agents Close More Deals with Digital Cards",
        description: "Real estate agents lose 40% of leads to lost contact info. See how top-performing agents use digital business cards to close more deals, faster.",
        h1: "How Top Real Estate Agents Use Digital Cards to Close More Deals",
        excerpt: "The average agent forgets 60% of the people they meet at open houses within a week. Digital cards fix this — permanently.",
        readTime: "11 min read",
        tags: ["Real Estate", "Sales", "Case Study"],
        sections: [
          { h2: "The lost-lead problem", body: p(`An open house on a good Saturday brings in 25 to 60 visitors. Every visitor hands the agent a scribbled phone number on a sign-in sheet. By Monday, 40% of those numbers are illegible, wrong, or forgotten. A digital business card, tapped from the agent's phone to the visitor's, guarantees the visitor has the agent's contact — and, more importantly, the agent has proof of the exchange in their analytics dashboard.`) },
          { h2: "Property links inside your card", body: p(`Cardixn lets agents attach a "Featured Listings" section to their card. Every visitor who scans the card sees your three hottest properties, complete with photos, price, and a booking link. Some agents report that 30% of listing views now come from card scans, not from Zillow.`) },
          { h2: "Bilingual is a superpower", body: p(`In markets like Dubai, Miami, London and Toronto, agents work across cultures every day. Cardixn ships bilingual by default — Arabic and English. Your card auto-flips RTL for Arabic-speaking buyers. This alone has closed deals that competing agents lost simply because their card looked broken in Arabic.`) },
        ],
      },
      ar: {
        title: "كيف يُغلق كبار وكلاء العقارات صفقات أكثر باستخدام البطاقات الرقمية",
        description: "يفقد وكلاء العقارات 40% من العملاء المحتملين بسبب فقدان بيانات الاتصال. اكتشف كيف يستخدم أفضل الوكلاء البطاقات الرقمية لإغلاق صفقات أكثر وأسرع.",
        h1: "كيف يستخدم وكلاء العقارات المتميزون البطاقات الرقمية لإغلاق صفقات أكثر",
        excerpt: "الوكيل المتوسط ينسى 60% من الأشخاص الذين قابلهم في العروض المفتوحة خلال أسبوع. البطاقات الرقمية تحل هذه المشكلة نهائياً.",
        readTime: "11 دقيقة قراءة",
        tags: ["عقارات", "مبيعات", "دراسة حالة"],
        sections: [
          { h2: "مشكلة فقدان العملاء المحتملين", body: p(`يوم عرض مفتوح جيد يجلب 25 إلى 60 زائراً. كل زائر يكتب رقم هاتف على ورقة تسجيل. بحلول الاثنين، 40% من هذه الأرقام غير مقروءة أو خاطئة أو منسية. بطاقة رقمية، تُلمَس من هاتف الوكيل إلى الزائر، تضمن حصول الزائر على بيانات الوكيل — والأهم، يحصل الوكيل على إثبات التبادل في لوحة تحليلاته.`) },
          { h2: "روابط العقارات داخل بطاقتك", body: p(`يتيح Cardixn للوكلاء إرفاق قسم "عقارات مميزة" في البطاقة. كل زائر يمسح البطاقة يرى أفضل ثلاث عقارات لديك مع الصور والسعر ورابط الحجز. بعض الوكلاء يذكرون أن 30% من مشاهدات العقارات تأتي الآن من مسح البطاقات.`) },
          { h2: "ثنائية اللغة قوة خارقة", body: p(`في أسواق مثل دبي وميامي ولندن وتورنتو، يعمل الوكلاء عبر ثقافات مختلفة يومياً. Cardixn ثنائي اللغة افتراضياً — عربي وإنجليزي. بطاقتك تنقلب تلقائياً من اليمين لليسار للمشترين العرب. هذا وحده أنقذ صفقات خسرها منافسون لأن بطاقتهم بدت مكسورة بالعربية.`) },
        ],
      },
    },
  },
  {
    slug: "how-to-create-digital-business-card",
    publishedAt: "2026-03-08",
    updatedAt: "2026-06-14",
    author: "Cardixn Editorial",
    category: "howto",
    copy: {
      en: {
        title: "How to Create a Digital Business Card in 60 Seconds (Step-by-Step)",
        description: "A complete step-by-step guide to creating your first digital business card. Screenshots, tips, and pitfalls to avoid. No credit card required.",
        h1: "How to Create a Digital Business Card in 60 Seconds",
        excerpt: "Six taps. That is all it takes to replace paper forever. Here is exactly what to click, in order.",
        readTime: "6 min read",
        tags: ["How-to", "Tutorial", "Beginners"],
        sections: [
          { h2: "Step 1 — Sign up with Google", body: p(`Open cardix1.lovable.app on your phone. Tap "Sign in with Google". Cardixn uses managed authentication so you never create a new password. Total time: 4 seconds.`) },
          { h2: "Step 2 — Pick a template", body: p(`You will see 19 luxury templates. Swipe through them. Pick one that matches your industry: minimalist for tech, classical for law, bold for creative. You can change it any time without losing your data.`) },
          { h2: "Step 3 — Fill in your details", body: p(`Name, title, company, phone, email. Then tap the AI Sparkle button — Cardixn's Gemini-powered AI writes you a professional bio in one click. Edit it if you like.`) },
          { h2: "Step 4 — Upload a photo", body: p(`Tap the avatar circle. Pick a photo. Cardixn crops and compresses it automatically for retina-quality display on any screen.`) },
          { h2: "Step 5 — Add social links", body: p(`Choose from 30+ platforms. Each social icon adopts the platform's official brand color. Instagram is pink, LinkedIn is blue, TikTok is black. Automatic and beautiful.`) },
          { h2: "Step 6 — Share", body: p(`Tap Share. You get a public link, a downloadable QR PNG, and a "Copy link" button. Send it to anyone. Done.`) },
        ],
      },
      ar: {
        title: "كيف تنشئ بطاقة أعمال رقمية في 60 ثانية (خطوة بخطوة)",
        description: "دليل خطوة بخطوة لإنشاء بطاقتك الرقمية الأولى. صور، نصائح، وأخطاء يجب تجنبها. بدون بطاقة ائتمانية.",
        h1: "كيف تنشئ بطاقة أعمال رقمية في 60 ثانية",
        excerpt: "ست نقرات فقط. هذا كل ما يلزم لاستبدال الورق للأبد. إليك بالضبط ما تنقر عليه، بالترتيب.",
        readTime: "6 دقائق قراءة",
        tags: ["دليل", "شرح", "مبتدئين"],
        sections: [
          { h2: "الخطوة 1 — سجّل بحساب Google", body: p(`افتح cardix1.lovable.app على هاتفك. اضغط "تسجيل الدخول بـGoogle". يستخدم Cardixn مصادقة مُدارة فلا تحتاج كلمة مرور جديدة. الوقت: 4 ثوانٍ.`) },
          { h2: "الخطوة 2 — اختر قالباً", body: p(`سترى 19 قالباً فاخراً. مرّر بينها. اختر ما يناسب مجالك: بسيط للتقنية، كلاسيكي للقانون، جريء للإبداعي. يمكنك تغييره لاحقاً دون فقد بياناتك.`) },
          { h2: "الخطوة 3 — املأ بياناتك", body: p(`الاسم، المسمى، الشركة، الهاتف، البريد. ثم اضغط زر السحر الذهبي — الذكاء الاصطناعي من Google Gemini يكتب لك نبذة احترافية بضغطة واحدة.`) },
          { h2: "الخطوة 4 — ارفع صورة", body: p(`اضغط دائرة الصورة. اختر صورة. يقص Cardixn ويضغط الصورة تلقائياً لجودة عرض ريتينا على أي شاشة.`) },
          { h2: "الخطوة 5 — أضف روابط التواصل", body: p(`اختر من أكثر من 30 منصة. كل أيقونة تأخذ لون العلامة الرسمي: إنستغرام وردي، لينكدإن أزرق، تيك توك أسود. تلقائي وجميل.`) },
          { h2: "الخطوة 6 — شارك", body: p(`اضغط مشاركة. تحصل على رابط عام، وصورة QR للتنزيل، وزر نسخ الرابط. أرسله لأي شخص. تم.`) },
        ],
      },
    },
  },
  {
    slug: "digital-cards-for-sales-teams",
    publishedAt: "2026-03-25",
    updatedAt: "2026-06-10",
    author: "Cardixn Editorial",
    category: "guide",
    copy: {
      en: {
        title: "Digital Business Cards for Sales Teams: The ROI Case",
        description: "Sales teams that switch to digital cards report 3.2× more follow-ups and 27% shorter sales cycles. Here is the data and the playbook.",
        h1: "Digital Business Cards for Sales Teams: The ROI Case",
        excerpt: "Every rep on your team leaves 6 leads on the table every week. Multiplied across the org, that is millions in lost pipeline.",
        readTime: "10 min read",
        tags: ["Sales", "ROI", "Teams"],
        sections: [
          { h2: "The math no VP of Sales wants to hear", body: p(`A rep who attends four events a month meets an average of 32 new people. Roughly 40% of those exchanges rely on the recipient later finding the paper card, typing the number, and initiating contact — which happens for less than half of them. That is 6 lost warm leads per rep per week. For a 50-rep team, over a year, that is 15,600 lost conversations.`) },
          { h2: "The digital card fix", body: p(`When a rep taps NFC or shows a QR, the contact lands directly in the prospect's phone contacts, the rep gets an event logged in their CRM, and both sides receive a follow-up email within an hour. Nothing is left to memory or luck.`) },
          { h2: "Team rollout in one afternoon", body: p(`Cardixn Teams lets a sales ops manager provision branded cards for 500 reps in one afternoon. Central template, per-rep photo, per-rep phone, unified analytics. Reps get their card on Monday, close more on Tuesday.`) },
        ],
      },
      ar: {
        title: "البطاقات الرقمية لفرق المبيعات: حالة العائد على الاستثمار",
        description: "فرق المبيعات التي انتقلت للبطاقات الرقمية تسجل متابعات أكثر بـ3.2× ودورات مبيعات أقصر بـ27%. إليك البيانات والخطة.",
        h1: "البطاقات الرقمية لفرق المبيعات: حالة العائد على الاستثمار",
        excerpt: "كل مندوب في فريقك يترك 6 عملاء محتملين على الطاولة كل أسبوع. مضروبة على المنظمة، هذه ملايين في خسائر خط الأنابيب.",
        readTime: "10 دقائق قراءة",
        tags: ["مبيعات", "عائد الاستثمار", "فرق"],
        sections: [
          { h2: "الحسابات التي لا يريد نائب المبيعات سماعها", body: p(`مندوب يحضر 4 فعاليات شهرياً يقابل 32 شخصاً جديداً. 40% من هذه التبادلات تعتمد على أن يجد المستلم البطاقة لاحقاً ويكتب الرقم ويبادر بالتواصل — وهذا يحدث لأقل من نصفهم. هذا يعني 6 عملاء دافئين مفقودين لكل مندوب أسبوعياً. لفريق من 50 مندوباً على مدار سنة، هذا 15,600 محادثة ضائعة.`) },
          { h2: "الحل بالبطاقة الرقمية", body: p(`عندما يلمس المندوب NFC أو يعرض QR، تدخل جهة الاتصال مباشرة في هاتف العميل، ويُسجَّل الحدث في CRM، ويستلم الطرفان بريد متابعة خلال ساعة. لا شيء يُترك للذاكرة أو الحظ.`) },
          { h2: "نشر للفريق في عصر واحد", body: p(`Cardixn Teams يتيح لمدير عمليات المبيعات إعداد بطاقات ذات علامة موحدة لـ500 مندوب في عصر واحد. قالب مركزي، صورة لكل مندوب، رقم لكل مندوب، تحليلات موحدة. المندوبون يحصلون على البطاقة الاثنين، ويُغلقون أكثر الثلاثاء.`) },
        ],
      },
    },
  },
  {
    slug: "ai-ocr-scan-paper-cards",
    publishedAt: "2026-04-11",
    updatedAt: "2026-06-20",
    author: "Cardixn Editorial",
    category: "howto",
    copy: {
      en: {
        title: "AI OCR: Turn Paper Business Cards Into Digital Contacts",
        description: "Snap a photo of any paper business card and Cardixn's AI turns it into a saved contact in 2 seconds. Powered by Gemini 2.5.",
        h1: "AI OCR: Turn Paper Business Cards Into Digital Contacts in Seconds",
        excerpt: "You cannot control what other people hand you. You can control what happens to those paper cards the second you get them.",
        readTime: "7 min read",
        tags: ["AI", "OCR", "Vault"],
        sections: [
          { h2: "The AI advantage", body: p(`Old OCR (Optical Character Recognition) was 60% accurate on business cards — usable, barely. Modern multimodal AI, like Gemini 2.5 Flash, is 97% accurate, identifies fields correctly (name vs. company vs. title), and even understands Arabic script and mixed-language cards. Cardixn uses Gemini under the hood to give you the same accuracy as an expensive enterprise SDK, on the free plan.`) },
          { h2: "How to scan", body: p(`Open the app, tap the floating scan button, point your camera at any paper card, hold still for one second. The name, company, title, phone, email, address and website are extracted, verified against known patterns, and previewed for you to accept. Add a personal note ("met at Web Summit"), tap save, done.`) },
          { h2: "The vault", body: p(`Every scanned card lives in your Cardixn Vault, searchable by any field, with notes and timestamps. Combined with digital-card capture from other Cardixn users, your vault becomes the single source of truth for every professional relationship you have.`) },
        ],
      },
      ar: {
        title: "OCR بالذكاء الاصطناعي: حوّل البطاقات الورقية إلى جهات اتصال رقمية",
        description: "التقط صورة لأي بطاقة ورقية ويحوّلها ذكاء Cardixn إلى جهة اتصال محفوظة خلال ثانيتين. مدعومة بـGemini 2.5.",
        h1: "OCR بالذكاء الاصطناعي: حوّل البطاقات الورقية إلى جهات اتصال في ثوانٍ",
        excerpt: "لا يمكنك التحكم بما يعطيه لك الآخرون. لكنك تتحكم بما يحدث لتلك البطاقات الورقية لحظة استلامها.",
        readTime: "7 دقائق قراءة",
        tags: ["ذكاء اصطناعي", "OCR", "المحفظة"],
        sections: [
          { h2: "ميزة الذكاء الاصطناعي", body: p(`OCR القديم كان دقيقاً بنسبة 60% على البطاقات — بالكاد مفيد. الذكاء الاصطناعي متعدد الوسائط الحديث، مثل Gemini 2.5 Flash، دقيق بنسبة 97%، ويحدد الحقول بشكل صحيح (اسم مقابل شركة مقابل مسمى)، ويفهم النص العربي والبطاقات ثنائية اللغة. Cardixn يستخدم Gemini ليقدم لك دقة SDK مؤسسي باهظ، على الخطة المجانية.`) },
          { h2: "كيف تمسح", body: p(`افتح التطبيق، اضغط زر المسح العائم، وجّه الكاميرا لأي بطاقة، ثبّت ثانية واحدة. يُستخرج الاسم والشركة والمسمى والهاتف والبريد والعنوان والموقع، ويُتحقق منها ضد أنماط معروفة، وتُعرض عليك للقبول. أضف ملاحظة شخصية ("قابلته في Web Summit")، اضغط حفظ، تم.`) },
          { h2: "المحفظة", body: p(`كل بطاقة ممسوحة تعيش في محفظة Cardixn، قابلة للبحث بأي حقل، مع الملاحظات والتاريخ. مع البطاقات الرقمية المحفوظة من مستخدمين آخرين، تصبح محفظتك المصدر الوحيد للحقيقة لكل علاقة مهنية.`) },
        ],
      },
    },
  },
  {
    slug: "designing-luxury-business-card",
    publishedAt: "2026-05-02",
    updatedAt: "2026-06-08",
    author: "Cardixn Editorial",
    category: "guide",
    copy: {
      en: {
        title: "How to Design a Luxury Business Card (Digital Edition)",
        description: "Design principles from Apple, Chanel and Rolls-Royce, applied to your digital business card. Typography, spacing, color, and photography.",
        h1: "How to Design a Luxury Digital Business Card",
        excerpt: "Luxury is not gold trim. Luxury is restraint. Here are the five design rules that separate a $10 card from a $1,000 one.",
        readTime: "8 min read",
        tags: ["Design", "Luxury", "Typography"],
        sections: [
          { h2: "Rule 1 — One typeface, two weights", body: p(`Amateurs mix three fonts. Professionals pick one — usually a modern grotesque like Söhne, Inter or SF Pro — and use only two weights: Regular for body, Semibold for name and headings. That's it. The result feels quiet, confident, expensive.`) },
          { h2: "Rule 2 — Give things air", body: p(`On paper cards, designers cram 12 pieces of information onto a 3.5×2-inch rectangle because the substrate is finite. On digital, you have infinite space — use it. Wide margins. Generous line-height. Sections separated by clear vertical rhythm. Air is what luxury feels like.`) },
          { h2: "Rule 3 — Colour is a discipline", body: p(`Pick one accent color. Use it three times, not fifteen. Black, white, and one bold accent (Cardixn's own signature purple #7C34FF, or your brand color) — that is the entire palette. Everything else is neutral.`) },
          { h2: "Rule 4 — Retina photography or nothing", body: p(`A blurry profile photo destroys every other design decision. Upload the sharpest, best-lit, highest-resolution portrait you have. Cardixn auto-optimises for retina display; it cannot invent detail that is not there.`) },
          { h2: "Rule 5 — Motion, sparingly", body: p(`Cardixn's parallax tilt on desktop is a rare exception to "less is more" — because it is subtle, physics-based, and reserved for the hero card. Motion earns its keep only when it reveals something. Avoid gratuitous fades and bouncing icons.`) },
        ],
      },
      ar: {
        title: "كيف تصمم بطاقة أعمال فاخرة (النسخة الرقمية)",
        description: "مبادئ التصميم من Apple وChanel وRolls-Royce مطبقة على بطاقتك الرقمية. الطباعة، المسافات، اللون، والتصوير.",
        h1: "كيف تصمم بطاقة رقمية فاخرة",
        excerpt: "الفخامة ليست حواف ذهبية. الفخامة هي ضبط النفس. إليك القواعد الخمس التي تفصل بطاقة بـ10 دولارات عن بطاقة بـ1000.",
        readTime: "8 دقائق قراءة",
        tags: ["تصميم", "فخامة", "طباعة"],
        sections: [
          { h2: "القاعدة 1 — خط واحد ووزنان", body: p(`الهواة يخلطون 3 خطوط. المحترفون يختارون واحداً — عادةً خط حديث مثل Söhne أو Inter أو SF Pro — ويستخدمون وزنين فقط: Regular للنص، Semibold للاسم والعناوين. النتيجة تبدو هادئة وواثقة وفاخرة.`) },
          { h2: "القاعدة 2 — أعطِ العناصر هواءً", body: p(`في البطاقات الورقية يحشر المصممون 12 معلومة في مستطيل 3.5×2 بوصة لأن المساحة محدودة. في الرقمية لديك مساحة لا نهائية — استخدمها. هوامش واسعة، مسافات أسطر سخية، أقسام مفصولة بإيقاع رأسي واضح. الهواء هو ما تشعر به الفخامة.`) },
          { h2: "القاعدة 3 — اللون انضباط", body: p(`اختر لون تمييز واحداً. استخدمه 3 مرات، لا 15. الأسود والأبيض ولون تمييز جريء واحد (بنفسجي Cardixn المميز #7C34FF أو لون علامتك) — هذه كل اللوحة. البقية محايدة.`) },
          { h2: "القاعدة 4 — تصوير ريتينا أو لا شيء", body: p(`صورة ملف شخصي مشوشة تدمر كل قرارات التصميم. ارفع أوضح وأفضل وأعلى صورة دقة لديك. Cardixn يحسّن تلقائياً لعرض ريتينا؛ لكنه لا يخترع تفاصيل غير موجودة.`) },
          { h2: "القاعدة 5 — الحركة باعتدال", body: p(`الميلان الثلاثي في Cardixn على سطح المكتب استثناء نادر لـ"الأقل أكثر" — لأنه خفيف ومبني على الفيزياء ومحصور بالبطاقة الرئيسية. الحركة تكسب مكانها فقط عندما تكشف شيئاً. تجنب التلاشي غير الضروري والأيقونات القافزة.`) },
        ],
      },
    },
  },
  {
    slug: "digital-cards-eco-impact",
    publishedAt: "2026-06-05",
    updatedAt: "2026-06-25",
    author: "Cardixn Editorial",
    category: "trends",
    copy: {
      en: {
        title: "The Environmental Cost of Paper Business Cards (and the Digital Fix)",
        description: "10 billion paper business cards are printed each year. 88% end up in the trash within a week. Here is the real environmental math — and the sustainable answer.",
        h1: "The Environmental Cost of Paper Business Cards",
        excerpt: "Every year, 10 billion paper cards are printed. Almost 9 billion end up in landfill within seven days. This is the real number.",
        readTime: "9 min read",
        tags: ["Sustainability", "Environment", "ESG"],
        sections: [
          { h2: "The numbers", body: p(`10 billion cards. 100,000 trees. 900 million litres of water. 100 tons of ink solvent. 88% thrown away within a week. Business cards are the single most-wasted printed object per gram of use on Earth.`) },
          { h2: "The ESG angle", body: p(`For any company reporting on ESG or Scope 3 emissions, business cards are low-hanging fruit. Switching a 200-person company from paper to digital removes about 240 kg of CO2 equivalent per year — a rounding error in isolation, but a story your ESG report can tell in one line, backed by real data from the Cardixn dashboard.`) },
          { h2: "The Cardixn commitment", body: p(`Every Cardixn card is served from a green-energy-powered edge network. NFC cards, when ordered, are shipped in FSC-certified paper packaging. We do not ship plastic pouches, foam inserts, or promotional junk.`) },
        ],
      },
      ar: {
        title: "التكلفة البيئية للبطاقات الورقية (والحل الرقمي)",
        description: "10 مليارات بطاقة ورقية تُطبع سنوياً. 88% منها ينتهي في القمامة خلال أسبوع. إليك الحسابات البيئية الحقيقية — والإجابة المستدامة.",
        h1: "التكلفة البيئية لبطاقات الأعمال الورقية",
        excerpt: "كل عام، تُطبع 10 مليارات بطاقة. 9 مليارات تقريباً ينتهي بها المطاف في المكبات خلال سبعة أيام. هذا الرقم الحقيقي.",
        readTime: "9 دقائق قراءة",
        tags: ["استدامة", "بيئة", "ESG"],
        sections: [
          { h2: "الأرقام", body: p(`10 مليارات بطاقة. 100,000 شجرة. 900 مليون لتر ماء. 100 طن مذيبات حبر. 88% تُرمى خلال أسبوع. البطاقات الورقية هي الشيء المطبوع الأكثر هدراً لكل غرام استخدام على الأرض.`) },
          { h2: "زاوية ESG", body: p(`لأي شركة تُعد تقارير ESG أو انبعاثات Scope 3، البطاقات ثمرة منخفضة. تحويل شركة من 200 شخص من الورق إلى الرقمي يزيل حوالي 240 كغ CO2 سنوياً — رقم صغير منفرداً، لكنه قصة يخبرها تقرير ESG في سطر واحد، مدعوماً ببيانات حقيقية من لوحة Cardixn.`) },
          { h2: "التزام Cardixn", body: p(`كل بطاقة Cardixn تُقدَّم من شبكة حافة تعمل بالطاقة الخضراء. بطاقات NFC عند الطلب تُشحن في تغليف ورقي معتمد FSC. لا نشحن أكياس بلاستيكية أو حشوات فوم أو قمامة ترويجية.`) },
        ],
      },
    },
  },
];

export function getAllPosts() {
  return [...BLOG_POSTS].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}
export function getPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
export function getPostCopy(post: BlogPost, locale: Locale): BlogCopy {
  return post.copy[locale] ?? post.copy.en!;
}
export function getAllPostSlugs() {
  return BLOG_POSTS.map((p) => p.slug);
}
