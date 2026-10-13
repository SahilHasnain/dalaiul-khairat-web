import PartBrowser from "@/components/part-browser";
import { DALAIL_PARTS } from "@/lib/dalail";
import Link from "next/link";

export const metadata = {
  title: "Browse the Daily Parts",
  description: "Browse the eight Dalailul Khairat daily portions and open the text reader.",
};

export default function PartsPage() {
  const parts = DALAIL_PARTS.map(({ number, day, title, description }) => ({ number, day, title, description }));
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
      <p className="text-[10px] font-black uppercase tracking-[.18em] text-primary-dark">The weekly wird</p>
      <h1 className="mt-2 font-serif text-[clamp(1.875rem,4vw,2.875rem)] font-semibold leading-tight tracking-tight text-foreground">Browse the parts</h1>
      <p className="mt-3 max-w-[680px] text-[15px] leading-7 text-text-secondary">Eight portions form the weekly cycle. Choose a day to read in Arabic, transliteration, or a translation.</p>
      <PartBrowser parts={parts} />
      <div className="mt-5 flex flex-wrap gap-2">
        {DALAIL_PARTS.length > 0 ? <Link className="inline-flex min-h-11 items-center justify-center rounded-[13px] border border-primary-border bg-surface px-4 text-xs font-extrabold text-primary-dark transition hover:bg-primary-soft" href="/dua/opening">Read the opening dua →</Link> : null}
      </div>
    </div>
  );
}
