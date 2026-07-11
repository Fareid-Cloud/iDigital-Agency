import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { getProjects, getPosts, getOpenJobs } from "@/lib/sanity/queries";

const STATIC_PATHS = [
  "",
  "/services",
  "/portfolio",
  "/about",
  "/blog",
  "/careers",
  "/contact",
  "/build",
  "/audit",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts, jobs] = await Promise.all([
    getProjects(),
    getPosts(),
    getOpenJobs(),
  ]);

  const dynamicPaths = [
    ...projects.map((p) => `/portfolio/${p.slug.current}`),
    ...posts.map((p) => `/blog/${p.slug.current}`),
    ...jobs.map((j) => `/careers/${j.slug.current}`),
  ];

  const allPaths = [...STATIC_PATHS, ...dynamicPaths];

  return allPaths.flatMap((path) => [
    { url: `${SITE.domain}/ar${path}`, alternates: { languages: { en: `${SITE.domain}/en${path}` } } },
    { url: `${SITE.domain}/en${path}`, alternates: { languages: { ar: `${SITE.domain}/ar${path}` } } },
  ]);
}
