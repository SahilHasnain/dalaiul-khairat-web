"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCompletedPartsForToday } from "@/lib/reader-storage";
import { normalizeSearchText } from "@/lib/dalail-utils";

type PartSummary = {
  number: number;
  day: string;
  title: string;
  description: string;
};

export default function PartBrowser({ parts }: { parts: PartSummary[] }) {
  const [query, setQuery] = useState("");
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    const refresh = () => setCompleted(getCompletedPartsForToday());
    refresh();
    window.addEventListener("dalail-completions-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("dalail-completions-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filtered = useMemo(() => {
    const normalized = normalizeSearchText(query);
    if (!normalized) return parts;
    return parts.filter((part) => normalizeSearchText(`${part.day} ${part.title} ${part.description}`).includes(normalized));
  }, [parts, query]);

  return (
    <>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-[18px] border border-line bg-surface p-3 shadow-card">
        <label className="sr-only" htmlFor="part-filter">Filter portions</label>
        <input id="part-filter" className="min-w-0 min-h-11 rounded-xl border border-line bg-surface-secondary px-3 text-sm text-foreground outline-none placeholder:text-text-tertiary focus:border-primary focus:ring-4 focus:ring-primary/15" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a day or part" />
        {query ? <button className="rounded-xl border border-line px-4 text-xs font-extrabold text-text-secondary hover:bg-surface-secondary" type="button" onClick={() => setQuery("")}>Clear</button> : <span className="self-center px-2 text-[10px] font-black uppercase tracking-wider text-text-tertiary">8 parts</span>}
      </div>
      {filtered.length ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {filtered.map((part) => {
            const isComplete = completed.includes(part.number);
            return (
              <Link href={`/read/${part.number}`} key={part.number} className="group flex min-h-[150px] flex-col justify-between rounded-[20px] border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary-border">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[.12em] text-primary-dark">{part.number === 8 ? "Part 8 · Closing" : `Part ${part.number}`}</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${isComplete ? "bg-primary-soft text-primary-dark" : "bg-surface-secondary text-text-secondary"}`}>{isComplete ? "Complete today" : part.day}</span>
                </div>
                <div>
                  <h2 className="mt-4 font-serif text-xl font-semibold text-foreground">{part.day}</h2>
                  <p className="mt-1 text-xs leading-6 text-text-secondary">{part.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-text-secondary"><span>Arabic · English</span><span className="font-extrabold text-primary-dark">Read →</span></div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-[18px] border border-dashed border-primary-border p-8 text-center text-sm text-text-secondary">No portions match “{query}”. Try a day name or part number.</div>
      )}
    </>
  );
}
