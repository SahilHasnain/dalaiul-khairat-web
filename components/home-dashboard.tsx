"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getBookmarks, getCompletedPartsForToday, getSavedProgress, type PartProgress } from "@/lib/reader-storage";
import { getTodayPartNumbers } from "@/lib/dalail-utils";

type PartSummary = {
  number: number;
  day: string;
  title: string;
  description: string;
};

type DuaSummary = {
  id: number;
  slug: string;
  title: string;
  titleArabic: string;
};

export default function HomeDashboard({ parts, duas }: { parts: PartSummary[]; duas: DuaSummary[] }) {
  const [progress, setProgress] = useState<PartProgress | null>(null);
  const [completed, setCompleted] = useState<number[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [todayParts, setTodayParts] = useState<number[]>([]);
  const [today, setToday] = useState("");

  const refreshLocalState = useCallback(() => {
    setProgress(getSavedProgress());
    setCompleted(getCompletedPartsForToday());
    setBookmarkCount(getBookmarks().length);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTodayParts(getTodayPartNumbers());
      setToday(new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date()));
      refreshLocalState();
    });
    window.addEventListener("dalail-progress-change", refreshLocalState);
    window.addEventListener("dalail-completions-change", refreshLocalState);
    window.addEventListener("dalail-bookmarks-change", refreshLocalState);
    window.addEventListener("storage", refreshLocalState);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("dalail-progress-change", refreshLocalState);
      window.removeEventListener("dalail-completions-change", refreshLocalState);
      window.removeEventListener("dalail-bookmarks-change", refreshLocalState);
      window.removeEventListener("storage", refreshLocalState);
    };
  }, [refreshLocalState]);

  const todayPortions = todayParts.map((number) => parts.find((part) => part.number === number)).filter((part): part is PartSummary => Boolean(part));
  const completedTodayCount = todayParts.filter((number) => completed.includes(number)).length;
  const continuePart = progress ? parts.find((part) => part.number === progress.partNumber) : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(270px,.65fr)]" aria-labelledby="home-title">
        <div className="relative isolate min-h-[310px] overflow-hidden rounded-[26px] bg-gradient-to-br from-hero-start via-hero-middle to-hero-end p-7 text-hero-text shadow-hero sm:rounded-[28px] sm:p-11">
          <div className="pointer-events-none absolute -right-10 -bottom-28 -z-10 size-72 rounded-full bg-primary/10 blur-3xl sm:size-96" />
          <div className="pointer-events-none absolute -right-10 -bottom-32 -z-10 size-72 rounded-full border border-hero-control sm:size-80" />
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-hero-accent">{today || "Your daily salawat"} · Daily salawat</p>
          <h1 id="home-title" className="mt-3 max-w-[620px] font-serif text-[clamp(2.25rem,5vw,3.5rem)] font-medium leading-[1.03] tracking-[-.045em]">A little reading.<br />A lasting connection.</h1>
          <p className="mt-4 max-w-[470px] text-sm leading-7 text-hero-muted">Read Dalailul Khairat in Arabic and translations, one portion at a time. Your reading place and bookmarks stay on this device.</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {todayPortions[0] ? <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[13px] bg-hero-primary px-5 text-[13px] font-extrabold text-hero-foreground transition hover:bg-hero-primary-hover" href={`/read/${todayPortions[0].number}`}>Read today <span aria-hidden="true">→</span></Link> : <Link className="inline-flex min-h-11 items-center justify-center rounded-[13px] bg-hero-primary px-5 text-[13px] font-extrabold text-hero-foreground" href="/parts">Browse portions</Link>}
            <Link className="inline-flex min-h-11 items-center justify-center rounded-[13px] border border-hero-control bg-hero-control-soft px-5 text-[13px] font-extrabold text-hero-text transition hover:bg-hero-control-hover" href="/parts">Browse all parts</Link>
          </div>
        </div>

        <aside className="flex flex-col justify-between gap-5 rounded-[22px] border border-line bg-surface p-6 shadow-card" aria-label="Your reading progress">
          <div>
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[.08em] text-text-secondary"><span>Your reading</span><span className="font-serif text-2xl text-primary" aria-hidden="true">✦</span></div>
            <h2 className="mt-4 font-serif text-[25px] font-semibold leading-tight text-foreground">Continue where you left off</h2>
            <p className="mt-2 text-[13px] leading-6 text-text-secondary">
              {continuePart
                ? `${continuePart.day} · Part ${continuePart.number}${progress?.lineNumber ? ` · line ${progress.lineNumber}` : ""}`
                : "Your last read part will appear here when you begin."}
            </p>
          </div>
          <div>
            {continuePart ? (
              <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[13px] border border-primary-border bg-surface px-4 text-[13px] font-extrabold text-primary-dark transition hover:bg-primary-soft" href={`/read/${continuePart.number}${progress?.lineNumber ? `#line-${progress.lineNumber}` : ""}`}>Continue reading <span aria-hidden="true">→</span></Link>
            ) : (
              <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[13px] border border-primary-border bg-surface px-4 text-[13px] font-extrabold text-primary-dark transition hover:bg-primary-soft" href={todayPortions[0] ? `/read/${todayPortions[0].number}` : "/parts"}>Start reading <span aria-hidden="true">→</span></Link>
            )}
            <div className="mt-6 flex items-center justify-between gap-2 text-[11px] text-text-secondary">
              <span>Today’s portions</span>
              <span>{completedTodayCount} / {todayParts.length} complete</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={completedTodayCount} aria-valuemin={0} aria-valuemax={todayParts.length}>
              <div className="h-full rounded-full bg-gradient-to-r from-primary-dark to-primary-light transition-[width]" style={{ width: `${todayParts.length ? completedTodayCount / todayParts.length * 100 : 0}%` }} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 text-[11px] text-text-secondary"><span>Saved passages</span><Link href="/bookmarks" className="font-extrabold text-primary-dark hover:underline">{bookmarkCount} bookmarks</Link></div>
          </div>
        </aside>
      </section>

      <section className="mt-10" aria-labelledby="today-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-primary-dark">Your daily wird</p>
            <h2 id="today-title" className="mt-1 font-serif text-[22px] font-semibold tracking-tight text-foreground">Today’s portion{todayPortions.length > 1 ? "s" : ""}</h2>
          </div>
          <Link href="/parts" className="text-xs font-extrabold text-primary-dark hover:underline">View all parts →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {todayPortions.map((part) => {
            const isComplete = completed.includes(part.number);
            return (
              <Link key={part.number} href={`/read/${part.number}`} className="group flex min-h-[140px] flex-col justify-between rounded-[20px] border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary-border">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[.12em] text-primary-dark">{part.number === 8 ? "Cycle closing portion" : `Part ${part.number}`}</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${isComplete ? "bg-primary-soft text-primary-dark" : "bg-surface-secondary text-text-secondary"}`}>{isComplete ? "Complete today" : "Ready to read"}</span>
                </div>
                <div>
                  <h3 className="mt-3 font-serif text-xl font-semibold text-foreground">{part.day}</h3>
                  <p className="mt-1 text-xs leading-6 text-text-secondary">{part.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-text-secondary"><span>Text reader · Arabic + translations</span><span className="font-extrabold text-primary-dark">Open →</span></div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="duas-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-primary-dark">Begin and complete</p>
            <h2 id="duas-title" className="mt-1 font-serif text-[22px] font-semibold tracking-tight text-foreground">Opening duas</h2>
          </div>
          <span className="text-xs text-text-secondary">Text edition</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {duas.map((dua) => (
            <Link key={dua.id} href={`/dua/${dua.slug}`} className="group block rounded-[20px] border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary-border">
              <h3 className="font-serif text-lg font-semibold text-foreground">{dua.title}</h3>
              <p className="mt-2 text-right font-serif text-[22px] text-primary-dark" lang="ar" dir="rtl">{dua.titleArabic}</p>
              <span className="mt-3 block text-[11px] font-black text-primary-dark">Read text →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
