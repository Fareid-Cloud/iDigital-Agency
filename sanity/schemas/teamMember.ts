import { defineField, defineType } from "sanity";

export default defineType({
  name: "teamMember",
  title: "الفريق / Team",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "الاسم / Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "roleAr",
      title: "المسمى الوظيفي (عربي)",
      type: "string",
    }),
    defineField({
      name: "roleEn",
      title: "Role (English)",
      type: "string",
    }),
    defineField({
      name: "photo",
      title: "الصورة / Photo",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "linkedin",
      title: "LinkedIn URL",
      type: "url",
    }),
    defineField({
      name: "instagram",
      title: "Instagram URL",
      type: "url",
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
    select: { title: "name", subtitle: "roleEn", media: "photo" },
  },
});
