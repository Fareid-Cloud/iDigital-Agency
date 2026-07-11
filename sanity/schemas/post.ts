import { defineField, defineType } from "sanity";

export default defineType({
  name: "post",
  title: "يوميات / Blog Posts",
  type: "document",
  fields: [
    defineField({
      name: "titleAr",
      title: "العنوان (عربي)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "titleEn",
      title: "Title (English)",
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
      name: "coverImage",
      title: "صورة الغلاف / Cover image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerptAr",
      title: "مقدمة المقال (عربي)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "excerptEn",
      title: "Excerpt (English)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "bodyAr",
      title: "محتوى المقال (عربي)",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
        {
          type: "object",
          name: "videoEmbed",
          title: "فيديو / Video embed",
          fields: [{ name: "url", type: "url", title: "Video URL" }],
        },
      ],
    }),
    defineField({
      name: "bodyEn",
      title: "Content (English)",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
        {
          type: "object",
          name: "videoEmbed",
          title: "Video embed",
          fields: [{ name: "url", type: "url", title: "Video URL" }],
        },
      ],
    }),
    defineField({
      name: "author",
      title: "الكاتب / Author",
      type: "reference",
      to: [{ type: "teamMember" }],
    }),
    defineField({
      name: "publishedAt",
      title: "تاريخ النشر / Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "seoDescription",
      title: "وصف SEO / Meta description",
      type: "text",
      rows: 2,
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "titleEn", media: "coverImage", subtitle: "publishedAt" },
  },
});
