"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DalailContent, DalailLine } from "@/lib/dalail-types";
import { getBookmarks, toggleBookmark, type SavedBookmark } from "@/lib/reader-storage";

type ResolvedBookmark = {
  bookmark: SavedBookmark;
  title: string;
  subtitle: string;
  href: string;
  text: string;
};

function findLine(lines: DalailLine[], lineNumber: number) {
  return lines.find((line) => line.number === lineNumber);
}

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [content, setContent] = useState<DalailContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = () => setBookmarks(getBookmarks());
    refresh();
    window.addEventListener("dalail-bookmarks-change", refresh);
    window.addEventListener("storage", refresh);
    fetch("/api/content")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load the reading text.");
        return response.json() as Promise<DalailContent>;
      })
      .then(setContent)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load bookmarks."))
      .finally(() => setLoading(false));
    return () => {
      window.removeEventListener("dalail-bookmarks-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const resolved: ResolvedBookmark[] = content ? bookmarks.map((bookmark) => {
    if (bookmark.kind === "part") {
      const part = content.parts.find((item) => item.number === Number(bookmark.parentId));
      const line = part ? findLine(part.lines, bookmark.lineNumber) : undefined;
      if (!part || !line) return null;
      return {
        bookmark,
        title: `${part.day} · Part ${part.number}`,
        subtitle: `Line ${line.number}`,
        href: `/read/${part.number}#line-${line.number}`,
        text: line.texts.trans || line.texts.translit || line.texts.arabicText || "",
      };
    }
    const dua = content.duas.find((item) => item.slug === String(bookmark.parentId));
    const duaLine = dua ? findLine(dua.lines, bookmark.lineNumber) : undefined;
    if (!dua || !duaLine) return null;
    return {
      bookmark,
      title: dua.title,
      subtitle: `Line ${duaLine.number}`,
      href: `/dua/${dua.slug}#line-${duaLine.number}`,
      text: duaLine.texts.trans || duaLine.texts.translit || duaLine.texts.arabicText || "",
    };
  }).filter((item): item is ResolvedBookmark => item !== null) : [];

  const remove = (item: ResolvedBookmark) => {
    toggleBookmark({
      kind: item.bookmark.kind,
      parentId: item.bookmark.parentId,
      lineNumber: item.bookmark.lineNumber,
      label: item.bookmark.label,
    });
    setBookmarks(getBookmarks());
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
      <p className="text-[10px] font-black uppercase tracking-[.18em] text-primary-dark">Your saved places</p>
      <h1 className="mt-2 font-serif text-[clamp(1.875rem,4vw,2.875rem)] font-semibold leading-tight tracking-tight text-foreground">Bookmarks</h1>
      <p className="mt-3 max-w-[680px] text-[15px] leading-7 text-text-secondary">Saved passages are stored in this browser so you can return to them easily.</p>

      {loading ? <div className="mt-8 rounded-[18px] border border-dashed border-primary-border p-8 text-center text-sm text-text-secondary">Loading saved passages…</div> : null}
      {error ? <div className="mt-8 rounded-[18px] border border-dashed border-primary-border p-8 text-center text-sm text-text-secondary">{error}</div> : null}
      {!loading && !error && resolved.length === 0 ? (
        <div className="mt-8 rounded-[18px] border border-dashed border-primary-border p-8 text-center text-sm text-text-secondary">
          <p>You haven’t saved any passages yet.</p>
          <Link href="/parts" className="mt-3 inline-block font-extrabold text-primary-dark hover:underline">Browse the daily parts →</Link>
        </div>
      ) : null}
      {!loading && !error && resolved.length > 0 ? (
        <div className="mt-6 grid gap-2.5">
          {resolved.map((item) => (
            <article className="flex items-center justify-between gap-3 rounded-[20px] border border-line bg-surface p-4 shadow-card" key={item.bookmark.id}>
              <Link href={item.href} className="min-w-0 flex-1">
                <h2 className="font-serif text-[17px] font-semibold text-foreground">{item.title}</h2>
                <p className="mt-1 text-[11px] leading-6 text-text-secondary">{item.subtitle} · {item.text.slice(0, 170)}{item.text.length > 170 ? "…" : ""}</p>
              </Link>
              <button className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-surface text-lg text-text-secondary transition hover:border-primary-border hover:text-danger-dark" type="button" onClick={() => remove(item)} aria-label={`Remove bookmark for ${item.title}`}>×</button>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
