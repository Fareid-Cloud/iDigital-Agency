import { defineField, defineType } from "sanity";

export default defineType({
  name: "project",
  title: "أعمالنا / Projects",
  type: "document",
  fields: [
    defineField({
      name: "titleAr",
      title: "اسم المشروع (عربي)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "titleEn",
      title: "Project name (English)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "titleEn", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "client",
      title: "اسم العميل / Client",
      type: "string",
    }),
    defineField({
      name: "category",
      title: "التصنيف / Category",
      type: "string",
      options: {
        list: [
          { title: "تصميم مواقع / Web Design", value: "web" },
          { title: "براندنج / Branding", value: "branding" },
          { title: "سوشيال ميديا / Social Media", value: "social" },
          { title: "إعلانات / Ads", value: "ads" },
        ],
      },
    }),
    defineField({
      name: "coverImage",
      title: "صورة الغلاف / Cover image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "gallery",
      title: "معرض الصور / Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "summaryAr",
      title: "ملخص المشروع (عربي)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "summaryEn",
      title: "Project summary (English)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "projectUrl",
      title: "رابط المشروع / Live URL",
      type: "url",
    }),
    defineField({
      name: "featured",
      title: "إظهار في الرئيسية؟ / Featured on homepage",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "ترتيب الظهور / Display order",
      type: "number",
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "titleEn", subtitle: "client", media: "coverImage" },
  },
});
