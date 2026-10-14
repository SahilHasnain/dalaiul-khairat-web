import Link from "next/link";
import { searchDalail } from "@/lib/dalail";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Search the Text",
  description: "Search Dalailul Khairat and jump directly to a passage.",
};

type SearchParams = Promise<{ q?: string | string[] }>;

export default function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchPageContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const results = query ? searchDalail(query, "trans") : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
      <p className="text-[10px] font-black uppercase tracking-[.18em] text-primary-dark">Find a passage</p>
      <h1 className="mt-2 font-serif text-[clamp(1.875rem,4vw,2.875rem)] font-semibold leading-tight tracking-tight text-foreground">Search the text</h1>
      <p className="mt-3 max-w-[680px] text-[15px] leading-7 text-text-secondary">Search the English text across the eight parts and opening duas.</p>

      <form className="mt-6 grid gap-2.5 rounded-[18px] border border-line bg-surface p-3 shadow-card sm:grid-cols-[minmax(0,1fr)_auto]" action="/search" method="get">
        <input className="min-w-0 min-h-11 rounded-xl border border-line bg-surface-secondary px-3 text-[13px] text-foreground outline-none placeholder:text-text-tertiary focus:border-primary focus:ring-4 focus:ring-primary/15" type="search" name="q" defaultValue={query} placeholder="Search a word or phrase" aria-label="Search text" />
        <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[13px] bg-primary px-5 text-[13px] font-extrabold text-primary-foreground transition hover:bg-primary-dark hover:text-hero-text" type="submit">Search text <span aria-hidden="true">⌕</span></button>
      </form>

      {query ? (
        <section className="mt-9" aria-live="polite">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="font-serif text-[22px] font-semibold tracking-tight text-foreground">{results.length ? `${results.length} matches` : "No matches found"}</h2>
            <span className="text-xs text-text-secondary">Searching English</span>
          </div>
          {results.length ? (
            <div className="grid gap-2.5">
              {results.map((result, index) => (
                <Link className="rounded-[20px] border border-line bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary-border sm:px-5" href={result.href} key={`${result.kind}-${result.lineNumber}-${index}`}>
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-primary-dark"><span>{result.subtitle}</span><span>·</span><span>Line {result.lineNumber}</span></span>
                  <h3 className="mt-2 font-serif text-lg font-semibold text-foreground">{result.title}</h3>
                  <p className="mt-2 whitespace-pre-line text-[13px] leading-7 text-text-secondary" lang="en" dir="ltr">{result.snippet}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[18px] border border-dashed border-primary-border p-8 text-center text-sm text-text-secondary">Try another spelling or phrase.</div>
          )}
        </section>
      ) : (
        <div className="mt-9 rounded-[20px] border border-primary-border bg-primary-soft p-5">
          <p className="text-[13px] leading-6 text-text-secondary">Try a phrase such as “salawat”, “Muhammad”, or “blessings”.</p>
        </div>
      )}
    </div>
  );
}

function SearchFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
      <p className="text-[10px] font-black uppercase tracking-[.18em] text-primary-dark">Find a passage</p>
      <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-foreground">Search the text</h1>
      <div className="mt-6 rounded-[18px] border border-line bg-surface p-5 text-sm text-text-secondary">Preparing search…</div>
    </div>
  );
}
