import { NextRequest, NextResponse } from "next/server";
import { geminiJSON } from "@/lib/gemini";

export const maxDuration = 60;

/* ---------------------------------- types --------------------------------- */

type Scores = { seo: number; tech: number; brand: number; conversion: number };
type Findings = { strengths: string[]; issues: string[]; ideas: string[] };

type SiteSignals = {
  title: string | null;
  titleLen: number;
  description: string | null;
  descLen: number;
  ogImage: string | null;
  favicon: boolean;
  h1Count: number;
  lang: string | null;
  canonical: boolean;
  viewport: boolean;
  hreflang: boolean;
  imgCount: number;
  imgAltCount: number;
  lazyImgCount: number;
  scriptCount: number;
  htmlKB: number;
  hasAnalytics: boolean;
  hasPixel: boolean;
  hasWhatsapp: boolean;
  hasTel: boolean;
  hasForm: boolean;
  https: boolean;
};

/* ------------------------------ URL validation ---------------------------- */

function normalizeUrl(raw: string): URL | null {
  let input = raw.trim();
  if (!/^https?:\/\//i.test(input)) input = `https://${input}`;
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(url.protocol)) return null;
  const host = url.hostname.toLowerCase();
  // basic SSRF guard: no localhost / private ranges / bare IPs on internal nets
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === "0.0.0.0" ||
    host === "[::1]"
  ) {
    return null;
  }
  return url;
}

function isInstagram(raw: string): string | null {
  const m = raw
    .trim()
    .match(/(?:instagram\.com\/|^@)([A-Za-z0-9._]{2,30})/i);
  return m ? m[1].replace(/\/$/, "") : null;
}

/* ----------------------------- signal extraction -------------------------- */

function extractSignals(html: string, url: URL): SiteSignals {
  const pick = (re: RegExp) => html.match(re)?.[1]?.trim() ?? null;

  const title = pick(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const description =
    pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ??
    pick(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const ogImage =
    pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i) ??
    pick(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["']/i);

  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const imgAltCount = imgTags.filter((t) => /alt=["'][^"']+["']/i.test(t)).length;
  const lazyImgCount = imgTags.filter((t) => /loading=["']lazy["']/i.test(t)).length;

  return {
    title,
    titleLen: title?.length ?? 0,
    description,
    descLen: description?.length ?? 0,
    ogImage,
    favicon: /<link[^>]+rel=["'][^"']*icon[^"']*["']/i.test(html),
    h1Count: (html.match(/<h1[\s>]/gi) ?? []).length,
    lang: pick(/<html[^>]+lang=["']([^"']+)["']/i),
    canonical: /<link[^>]+rel=["']canonical["']/i.test(html),
    viewport: /<meta[^>]+name=["']viewport["']/i.test(html),
    hreflang: /hreflang=/i.test(html),
    imgCount: imgTags.length,
    imgAltCount,
    lazyImgCount,
    scriptCount: (html.match(/<script\b/gi) ?? []).length,
    htmlKB: Math.round(Buffer.byteLength(html, "utf8") / 1024),
    hasAnalytics: /gtag\(|googletagmanager|google-analytics/i.test(html),
    hasPixel: /fbq\(|facebook\.net\/en_US\/fbevents/i.test(html),
    hasWhatsapp: /wa\.me\/|api\.whatsapp\.com/i.test(html),
    hasTel: /href=["']tel:/i.test(html),
    hasForm: /<form\b/i.test(html),
    https: url.protocol === "https:",
  };
}

/* ----------------------------- heuristic scoring -------------------------- */

const clamp = (n: number) => Math.max(8, Math.min(97, Math.round(n)));

function scoreSite(s: SiteSignals): Scores {
  let seo = 20;
  if (s.title) seo += 15;
  if (s.titleLen >= 25 && s.titleLen <= 65) seo += 10;
  if (s.description) seo += 15;
  if (s.descLen >= 70 && s.descLen <= 165) seo += 10;
  if (s.h1Count === 1) seo += 12;
  else if (s.h1Count > 1) seo += 4;
  if (s.lang) seo += 8;
  if (s.canonical) seo += 6;
  if (s.hreflang) seo += 6;

  let tech = 25;
  if (s.https) tech += 18;
  if (s.viewport) tech += 15;
  if (s.htmlKB < 150) tech += 15;
  else if (s.htmlKB < 350) tech += 8;
  if (s.scriptCount <= 15) tech += 12;
  else if (s.scriptCount <= 30) tech += 5;
  if (s.imgCount > 0 && s.lazyImgCount / s.imgCount > 0.3) tech += 10;

  let brand = 22;
  if (s.ogImage) brand += 25;
  if (s.favicon) brand += 15;
  if (s.title && s.description) brand += 15;
  if (s.imgCount > 0 && s.imgAltCount / s.imgCount > 0.5) brand += 12;

  let conversion = 15;
  if (s.hasWhatsapp) conversion += 25;
  if (s.hasTel) conversion += 15;
  if (s.hasForm) conversion += 18;
  if (s.hasAnalytics) conversion += 12;
  if (s.hasPixel) conversion += 10;

  return {
    seo: clamp(seo),
    tech: clamp(tech),
    brand: clamp(brand),
    conversion: clamp(conversion),
  };
}

function scoreInstagram(): Scores {
  // Estimates only — IG blocks server-side reads; scores flagged in the UI.
  return { seo: 35, tech: 62, brand: 55, conversion: 42 };
}

/* --------------------------- template fallbacks ---------------------------- */

function fallbackFindings(
  s: SiteSignals | null,
  locale: string,
  industry: string
): Findings {
  const ar = locale === "ar";
  const strengths: string[] = [];
  const issues: string[] = [];

  if (s) {
    if (s.https) strengths.push(ar ? "الموقع مؤمّن بشهادة HTTPS" : "Site is secured with HTTPS");
    if (s.viewport) strengths.push(ar ? "متوافق مع الموبايل (viewport مضبوط)" : "Mobile viewport is configured");
    if (s.hasWhatsapp) strengths.push(ar ? "فيه زر واتساب مباشر — ممتاز للسوق العربي" : "Direct WhatsApp button — great for Arab markets");
    if (s.hasAnalytics) strengths.push(ar ? "فيه تتبع Google Analytics شغال" : "Google Analytics tracking is present");

    if (!s.description) issues.push(ar ? "مفيش meta description — جوجل بيكتب وصفك بنفسه وده بيقلل الضغطات" : "No meta description — Google writes its own, lowering your CTR");
    if (s.h1Count !== 1) issues.push(ar ? `عدد عناوين H1 غير مثالي (${s.h1Count}) — المفروض عنوان رئيسي واحد` : `Non-ideal H1 count (${s.h1Count}) — should be exactly one`);
    if (!s.ogImage) issues.push(ar ? "مفيش صورة og:image — اللينك بيظهر من غير صورة لما يتشارك" : "No og:image — shared links appear without a preview image");
    if (!s.hasWhatsapp && !s.hasTel) issues.push(ar ? "مفيش وسيلة تواصل فورية (واتساب/اتصال) ظاهرة في الكود" : "No instant contact method (WhatsApp/tel) detected");
    if (!s.hasAnalytics) issues.push(ar ? "مفيش تتبع تحليلات — بتصرف على الموقع من غير ما تعرف مين بيزوره" : "No analytics — you can't see who visits or converts");
    if (s.scriptCount > 30) issues.push(ar ? `عدد سكريبتات كبير (${s.scriptCount}) بيبطّئ التحميل` : `High script count (${s.scriptCount}) slows loading`);
  }

  if (strengths.length === 0)
    strengths.push(ar ? "عندك حضور رقمي قائم نقدر نبني عليه" : "You have an existing digital presence to build on");
  if (issues.length === 0)
    issues.push(ar ? "الأساسيات كويسة — التحسين الجاي في المحتوى والحملات" : "Basics look fine — next gains are in content & campaigns");

  const ideas = ar
    ? [
        `محتوى موجّه لجمهور ${industry} بيبني ثقة قبل البيع`,
        "حملة Google Ads مستهدفة بالكلمات اللي عملاؤك بيدوروا بيها فعلاً",
        "ربط كل نقاط التواصل بواتساب واحد مع تتبع للتحويلات",
      ]
    : [
        `Content tailored to the ${industry} audience builds trust before the sale`,
        "A targeted Google Ads campaign on the exact keywords your customers search",
        "Unify contact points into one tracked WhatsApp funnel",
      ];

  return { strengths: strengths.slice(0, 4), issues: issues.slice(0, 4), ideas };
}

/* ---------------------------------- route --------------------------------- */

export async function POST(req: NextRequest) {
  let payload: { name?: string; industry?: string; link?: string; locale?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const name = (payload.name ?? "").toString().slice(0, 80);
  const industry = (payload.industry ?? "other").toString().slice(0, 40);
  const link = (payload.link ?? "").toString().slice(0, 300);
  const locale = payload.locale === "en" ? "en" : "ar";

  if (!link) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const igHandle = isInstagram(link);

  /* ------------------------------ Instagram mode ---------------------------- */
  if (igHandle) {
    const scores = scoreInstagram();
    const ai = await geminiJSON<Findings>(
      `You are a senior digital-marketing auditor at iDigital agency (Qena, Egypt; serves Egypt & Saudi/Gulf).
A business owner named "${name}" in the "${industry}" industry submitted their Instagram handle "@${igHandle}" for a quick audit.
You cannot see the account, so produce an expert best-practice audit for this industry on Instagram in the Arab market.
Respond ONLY with JSON: {"strengths": string[3], "issues": string[4], "ideas": string[3]}.
Language: ${locale === "ar" ? "Egyptian Arabic (عامية مصرية مهذبة)" : "English"}.
Make items specific to the industry, punchy, and non-generic. "issues" = the most common costly mistakes ${industry} accounts make; "ideas" = growth plays iDigital could run.`
    );

    const findings = ai ?? fallbackFindings(null, locale, industry);
    return NextResponse.json({
      ok: true,
      mode: "instagram",
      meta: { handle: igHandle, url: `https://instagram.com/${igHandle}` },
      scores,
      estimated: true,
      findings,
    });
  }

  /* -------------------------------- Website mode ---------------------------- */
  const url = normalizeUrl(link);
  if (!url) {
    return NextResponse.json({ ok: false, error: "bad_url" }, { status: 422 });
  }

  let html = "";
  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; iDigitalAuditBot/1.0; +https://iDigitalAgency.co)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    html = (await res.text()).slice(0, 400_000);
  } catch {
    return NextResponse.json({ ok: false, error: "unreachable" }, { status: 422 });
  }

  const signals = extractSignals(html, url);
  const scores = scoreSite(signals);

  const ai = await geminiJSON<Findings>(
    `You are a senior digital-marketing auditor at iDigital agency (Qena, Egypt; serves Egypt & Saudi/Gulf markets).
Business owner: "${name}", industry: "${industry}", website: ${url.hostname}.
Real extracted signals from their live HTML:
${JSON.stringify(signals, null, 2)}
Heuristic scores (0-100): ${JSON.stringify(scores)}.
Respond ONLY with JSON: {"strengths": string[3], "issues": string[4], "ideas": string[3]}.
Language: ${locale === "ar" ? "Egyptian Arabic (عامية مصرية مهذبة، مصطلحات تقنية بالإنجليزي عادي)" : "English"}.
Rules: every item must reference a REAL signal above or a concrete industry insight — no generic filler. "issues" should sting a little (honest consultant tone). "ideas" = specific growth plays iDigital could execute for this exact business.`
  );

  const findings = ai ?? fallbackFindings(signals, locale, industry);

  return NextResponse.json({
    ok: true,
    mode: "site",
    meta: {
      url: url.toString(),
      host: url.hostname,
      title: signals.title,
      description: signals.description,
      ogImage: signals.ogImage,
    },
    scores,
    estimated: false,
    findings,
  });
}
