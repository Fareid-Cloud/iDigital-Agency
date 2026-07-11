import { defineField, defineType } from "sanity";

export default defineType({
  name: "jobOpening",
  title: "وظائف / Careers",
  type: "document",
  fields: [
    defineField({
      name: "titleAr",
      title: "المسمى الوظيفي (عربي)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "titleEn",
      title: "Job title (English)",
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
      name: "department",
      title: "القسم / Department",
      type: "string",
    }),
    defineField({
      name: "employmentType",
      title: "نوع الدوام / Employment type",
      type: "string",
      options: {
        list: [
          { title: "دوام كامل / Full-time", value: "full-time" },
          { title: "دوام جزئي / Part-time", value: "part-time" },
          { title: "فريلانس / Freelance", value: "freelance" },
          { title: "تدريب / Internship", value: "internship" },
        ],
      },
    }),
    defineField({
      name: "location",
      title: "مكان العمل / Location",
      type: "string",
      initialValue: "قنا، مصر (عن بُعد متاح) / Qena, Egypt (remote available)",
    }),
    defineField({
      name: "descriptionAr",
      title: "وصف الوظيفة (عربي)",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "descriptionEn",
      title: "Job description (English)",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "isOpen",
      title: "الوظيفة متاحة؟ / Currently open",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "publishedAt",
      title: "تاريخ النشر / Posted at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: { title: "titleEn", subtitle: "department" },
  },
});
