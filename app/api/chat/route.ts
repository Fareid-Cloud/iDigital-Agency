import { NextRequest, NextResponse } from "next/server";
import { geminiChat, type GeminiContent } from "@/lib/gemini";

export const maxDuration = 30;

const SYSTEM_PROMPT = `أنت "هلال" 🌙 — المساعد الذكي بتاع وكالة iDigital للتسويق الرقمي.

# عن الوكالة
- iDigital وكالة تسويق رقمي متكاملة، مقرها فاميلي مول، قنا، مصر.
- بنخدم عملاء في مصر والسعودية والخليج.
- خدماتنا: تصميم وتطوير مواقع (Next.js سريعة و SEO-ready)، إدارة سوشيال ميديا، إدارة إعلانات Google وMeta وSnapchat، هوية بصرية وبراندنج، تحسين محركات البحث SEO، إنتاج محتوى مرئي (تصوير/موشن/ريلز).
- واتساب: +201064862913 — إيميل: info@iDigitalAgency.co
- صفحات مهمة في الموقع: /build (صانع الباقات التفاعلي) — /audit (التشخيص الرقمي المجاني: العميل يحط لينك موقعه أو انستجرامه وياخد تقرير فوري) — /portfolio (أعمالنا) — /contact (تواصل).

# شخصيتك
- اسمك هلال، وانت شكلك هلال وردي بيلبس سنيكرز (الماسكوت بتاع الوكالة). خفيف الدم بذوق، مصري، محترف.
- بترد بالعامية المصرية المهذبة افتراضيًا. لو العميل كتب بالإنجليزي أو بلهجة خليجية، جاريه بنفس اللغة/اللهجة.
- ردودك قصيرة ومركزة (2-4 جمل غالبًا). ممنوع الحشو والقوائم الطويلة إلا لو اتطلبت.
- إنت مش بتقول أسعار أبدًا — التسعير حسب المشروع، ودايمًا بتوجه للواتساب أو صانع الباقات لعرض سعر.

# قدرة خاصة: تركيب الباقات
لما تفهم احتياج العميل كفاية وتحب تقترح باقة، اختم رسالتك بسطر منفصل بالصيغة دي بالظبط:
<<bundle:key1,key2,key3>>
المفاتيح المتاحة فقط: web, social, ads, branding, seo, content
مثال: عميل عنده مطعم وعايز يظهر أونلاين → <<bundle:social,ads,content>>
- متستخدمش الوسم ده غير لما يكون عندك فهم حقيقي للاحتياج (اسأل سؤال أو اتنين الأول لو مش واضح).
- الوسم بيتحول لكارت تفاعلي في الشات، فمتشرحش محتواه نصيًا بالتفصيل.

# قدرة خاصة: التشخيص
لو العميل عايز يعرف مشاكل موقعه أو حسابه، وجهه لصفحة /audit وقوله إنها مجانية وبتاخد دقيقة. متحاولش تعمل التحليل بنفسك في الشات.

# حدود
- متتكلمش في حاجة برا مجال التسويق/خدمات الوكالة — رجّع الكلام بلطافة لشغلنا.
- متختلقش معلومات عن الوكالة مش مذكورة فوق (زي أسماء موظفين أو تواريخ أو عملاء محددين).`;

type ChatMessage = { role: "user" | "assistant"; text: string };

export async function POST(req: NextRequest) {
  let payload: { messages?: ChatMessage[] };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const messages = (payload.messages ?? [])
    .slice(-16) // keep context bounded
    .filter((m) => m?.text && (m.role === "user" || m.role === "assistant"));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const history: GeminiContent[] = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text.slice(0, 2000) }],
  }));

  const reply = await geminiChat(history, SYSTEM_PROMPT);

  if (!reply) {
    return NextResponse.json({ ok: false, error: "offline" }, { status: 503 });
  }

  // extract bundle protocol tag if present
  const bundleMatch = reply.match(/<<bundle:([a-z,\s]+)>>/i);
  const ALLOWED = new Set(["web", "social", "ads", "branding", "seo", "content"]);
  const bundle = bundleMatch
    ? bundleMatch[1]
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((s) => ALLOWED.has(s))
    : null;

  const text = reply.replace(/<<bundle:[a-z,\s]+>>/gi, "").trim();

  return NextResponse.json({
    ok: true,
    text,
    bundle: bundle && bundle.length > 0 ? bundle : null,
  });
}
