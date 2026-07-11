"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";

export default function ContactForm() {
  const t = useTranslations("contact.form");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    params.set("name", String(form.get("name") || ""));
    params.set("email", String(form.get("email") || ""));
    params.set("phone", String(form.get("phone") || ""));
    params.set("message", String(form.get("message") || ""));

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
    } finally {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-magenta/20 bg-blush/60 p-8 text-center text-ink">
        ✓
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        name="name"
        required
        placeholder={t("name")}
        className="rounded-xl border border-line bg-white px-4 py-3.5 text-sm outline-none transition focus:border-magenta"
      />
      <input
        name="email"
        type="email"
        required
        placeholder={t("email")}
        className="rounded-xl border border-line bg-white px-4 py-3.5 text-sm outline-none transition focus:border-magenta"
      />
      <input
        name="phone"
        type="tel"
        placeholder={t("phone")}
        className="rounded-xl border border-line bg-white px-4 py-3.5 text-sm outline-none transition focus:border-magenta"
      />
      <textarea
        name="message"
        rows={4}
        required
        placeholder={t("message")}
        className="rounded-xl border border-line bg-white px-4 py-3.5 text-sm outline-none transition focus:border-magenta"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="flex items-center justify-center gap-2 rounded-full bg-magenta px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-magenta-light disabled:opacity-60"
      >
        {t("submit")}
        <Send size={15} />
      </button>
    </form>
  );
}
