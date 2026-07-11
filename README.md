# iDigital Agency — الموقع الرسمي

موقع iDigital مبني بـ Next.js 15 (App Router) + TypeScript + Tailwind CSS، عربي/إنجليزي بالكامل مع RTL، ولوحة تحكم Sanity Studio مدمجة على `/studio` لإضافة الأعمال والفريق والمقالات والوظائف من غير كود.

## 1) التشغيل محليًا

```bash
npm install
npm run dev
```

الموقع هيفتح على `http://localhost:3000` (بيحولك تلقائي لـ `/ar`).

## 2) ربط لوحة التحكم (Sanity CMS) — مجاني

1. اعمل حساب مجاني على https://www.sanity.io
2. جوه terminal المشروع نفذ: `npx sanity@latest init` واختار "Create new project"
3. هياخدلك `Project ID`، حطه في ملف `.env.local` (انسخه من `.env.example`):
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxx
   NEXT_PUBLIC_SANITY_DATASET=production
   ```
4. شغّل الموقع تاني، وادخل على `/ar/studio` أو `/en/studio` — هتلاقي لوحة تحكم كاملة فيها:
   - **أعمالنا (Projects)** — أضف مشروع، صورة غلاف، معرض صور، رابط حي
   - **الفريق (Team)** — أضف/احذف أعضاء بصورهم ولينكاتهم
   - **يوميات (Blog Posts)** — مقالات كاملة بصور وفيديوهات، اسم الكاتب بيظهر تلقائي لو ربطته بعضو فريق
   - **وظائف (Careers)** — أضف/أغلق وظائف مفتوحة، كل وظيفة بصفحة تفاصيل + تقديم بالإيميل

كل المحتوى بينشر فورًا على الموقع، من غير أي كود.

## 3) النشر على Vercel

1. ارفع المشروع على GitHub
2. من https://vercel.com اعمل "Import Project" واختار الريبو
3. ضيف environment variables اللي في `.env.example` (نفس القيم اللي حطيتها محليًا)
4. Deploy — Vercel هيبني المشروع تلقائي (فيه Next.js caching وimage optimization جاهزين)

## 4) ربط الدومين

لما تشتري `iDigitalAgency.co`:
- من إعدادات Vercel → Domains → ضيف الدومين
- حدّث DNS records عند مزود الدومين زي ما Vercel هيوريك بالظبط

## 5) البريد الإلكتروني لفورم التواصل

فورم "تواصل معنا" شغال ويحفظ الطلبات، لكن لسه مش بيبعت إيميل فعلي. عشان يبعت إيميل حقيقي:
1. اعمل حساب مجاني على https://resend.com
2. `npm install resend`
3. عدّل `app/api/contact/route.ts` وضيف كود إرسال الإيميل (فيه تعليق TODO في الملف بالظبط في المكان ده)

## بنية المشروع

```
app/[locale]/       صفحات الموقع (عربي/إنجليزي تلقائي)
app/studio/         لوحة التحكم (Sanity Studio)
components/         مكونات الواجهة القابلة لإعادة الاستخدام
sanity/schemas/     تعريف المحتوى القابل للتعديل من لوحة التحكم
messages/ar.json    نصوص الموقع بالعربي
messages/en.json    نصوص الموقع بالإنجليزي
lib/sanity/         الاتصال بلوحة التحكم وجلب البيانات
public/brand/       اللوجو
```

## ملاحظة تقنية

فيه تحذير غير مؤثر بيظهر وقت البناء بخصوص "middleware" (Next.js بيقترح الانتقال لـ "proxy" في نسخ مستقبلية) — الموقع شغال بيه تمام دلوقتي.
