import { sanityClient } from "./client";

export type Project = {
  _id: string;
  titleAr: string;
  titleEn: string;
  slug: { current: string };
  client?: string;
  category?: string;
  coverImage: any;
  gallery?: any[];
  summaryAr?: string;
  summaryEn?: string;
  projectUrl?: string;
  featured?: boolean;
};

export type TeamMember = {
  _id: string;
  name: string;
  roleAr?: string;
  roleEn?: string;
  photo: any;
  linkedin?: string;
  instagram?: string;
};

export type Post = {
  _id: string;
  titleAr: string;
  titleEn: string;
  slug: { current: string };
  coverImage: any;
  excerptAr?: string;
  excerptEn?: string;
  bodyAr?: any[];
  bodyEn?: any[];
  author?: { name: string };
  publishedAt: string;
};

export type JobOpening = {
  _id: string;
  titleAr: string;
  titleEn: string;
  slug: { current: string };
  department?: string;
  employmentType?: string;
  location?: string;
  descriptionAr?: any[];
  descriptionEn?: any[];
  isOpen: boolean;
};

const safeFetch = async <T>(query: string, params: Record<string, unknown> = {}, fallback: T): Promise<T> => {
  try {
    return await sanityClient.fetch<T>(query, params);
  } catch {
    // CMS not connected yet (no Sanity project configured) — fail gracefully.
    return fallback;
  }
};

export const getProjects = () =>
  safeFetch<Project[]>(
    `*[_type == "project"] | order(order asc, _createdAt desc)`,
    {},
    []
  );

export const getFeaturedProjects = () =>
  safeFetch<Project[]>(
    `*[_type == "project" && featured == true] | order(order asc)[0...6]`,
    {},
    []
  );

export const getProjectBySlug = (slug: string) =>
  safeFetch<Project | null>(
    `*[_type == "project" && slug.current == $slug][0]`,
    { slug },
    null
  );

export const getTeam = () =>
  safeFetch<TeamMember[]>(
    `*[_type == "teamMember"] | order(order asc)`,
    {},
    []
  );

export const getPosts = () =>
  safeFetch<Post[]>(
    `*[_type == "post"] | order(publishedAt desc){..., author->{name}}`,
    {},
    []
  );

export const getPostBySlug = (slug: string) =>
  safeFetch<Post | null>(
    `*[_type == "post" && slug.current == $slug][0]{..., author->{name}}`,
    { slug },
    null
  );

export const getOpenJobs = () =>
  safeFetch<JobOpening[]>(
    `*[_type == "jobOpening" && isOpen == true] | order(publishedAt desc)`,
    {},
    []
  );

export const getJobBySlug = (slug: string) =>
  safeFetch<JobOpening | null>(
    `*[_type == "jobOpening" && slug.current == $slug][0]`,
    { slug },
    null
  );
