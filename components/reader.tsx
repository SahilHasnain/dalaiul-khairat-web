"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DalailLanguage, DalailLine } from "@/lib/dalail-types";
import { getBookmarks, getCompletedPartsForToday, getSavedProgress, saveProgress, toggleBookmark, togglePartCompletion } from "@/lib/reader-storage";

type ReaderProps = {
  kind: "part" | "dua";
  parentId: number | string;
  title: string;
  titleArabic?: string;
  subtitle: string;
  lines: DalailLine[];
  languages: DalailLanguage[];
  dayLabel?: string;
  previousPart?: number;
  nextPart?: number;
};

export default function Reader({ kind, parentId, title, titleArabic, subtitle, lines, languages, dayLabel, previousPart, nextPart }: ReaderProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const lastSavedLineRef = useRef<number | null>(null);
  const [mode, setMode] = useState<"arabic" | "translation" | "both">("both");
  const [translationKey, setTranslationKey] = useState("trans");
  const [fontScale, setFontScale] = useState(1);
  const [bookmarkedLines, setBookmarkedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(lines[0]?.number ?? 0);
  const [completed, setCompleted] = useState(false);

  const translationOptions = languages.filter((language) => language.key !== "arabicText");
  const selectedLanguage = translationOptions.find((language) => language.key === translationKey) ?? translationOptions[2];
  const partNumber = kind === "part" ? Number(parentId) : null;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setBookmarkedLines(getBookmarks().map((bookmark) => bookmark.id));
      if (kind === "part" && partNumber) {
        const progress = getSavedProgress();
        if (progress?.partNumber === partNumber) {
          setCurrentLine(progress.lineNumber);
          lastSavedLineRef.current = progress.lineNumber;
          document.getElementById(`line-${progress.lineNumber}`)?.scrollIntoView({ block: "start" });
        }
        setCompleted(getCompletedPartsForToday().includes(partNumber));
      }

      const hash = window.location.hash.match(/^#line-(\d+)$/);
      if (hash) {
        const lineNumber = Number(hash[1]);
        document.getElementById(`line-${lineNumber}`)?.scrollIntoView({ block: "start" });
        setCurrentLine(lineNumber);
      }
    });

    const refreshBookmarks = () => setBookmarkedLines(getBookmarks().map((bookmark) => bookmark.id));
    window.addEventListener("dalail-bookmarks-change", refreshBookmarks);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("dalail-bookmarks-change", refreshBookmarks);
    };
  }, [kind, partNumber]);

  const handleScroll = useCallback(() => {
    const container = contentRef.current;
    if (!container) return;
    const readingAnchor = window.innerWidth < 760 ? 225 : 170;
    const visibleContentHeight = Math.max(1, window.innerHeight - readingAnchor - 48);
    const scrollableContentHeight = Math.max(1, container.scrollHeight - visibleContentHeight);
    const progress = Math.max(0, Math.min(1, (readingAnchor - container.getBoundingClientRect().top) / scrollableContentHeight));
    const progressPercent = Math.round(progress * 100);
    if (progressFillRef.current) progressFillRef.current.style.width = `${progressPercent}%`;
    progressTrackRef.current?.setAttribute("aria-valuenow", String(progressPercent));

    const anchor = 170;
    const current = Array.from(container.querySelectorAll<HTMLElement>("[data-reader-line]"))
      .find((element) => element.getBoundingClientRect().bottom > anchor);
    if (!current) return;
    const number = Number(current.dataset.readerLine);
    if (!Number.isFinite(number)) return;
    setCurrentLine(number);
    if (kind === "part" && partNumber && lastSavedLineRef.current !== number) {
      lastSavedLineRef.current = number;
      saveProgress(partNumber, number);
    }
  }, [kind, partNumber]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const toggleLineBookmark = (line: DalailLine) => {
    const saved = toggleBookmark({
      kind,
      parentId,
      lineNumber: line.number,
      label: kind === "part" ? `${dayLabel ?? "Part"} · line ${line.number}` : `${title} · line ${line.number}`,
    });
    setBookmarkedLines(getBookmarks().map((bookmark) => bookmark.id));
    return saved;
  };

  const markComplete = () => {
    if (!partNumber) return;
    setCompleted(togglePartCompletion(partNumber));
  };

  return (
    <div className="mx-auto w-[min(100%-1.5rem,65.625rem)] py-6 pb-20 sm:w-[min(100%-2rem,65.625rem)] sm:py-8">
      <div ref={progressTrackRef} className="fixed inset-x-0 top-[115px] z-30 h-1 bg-surface-muted sm:top-[76px]" role="progressbar" aria-label="Reading progress" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100}>
        <div ref={progressFillRef} className="h-full rounded-r-full bg-primary transition-[width] duration-100" style={{ width: "0%" }} />
      </div>
      <div className="flex items-start justify-between gap-5 max-sm:block">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-primary-dark">{kind === "part" ? dayLabel : "Dua"}</p>
          <h1 className="mt-2 font-serif text-[clamp(1.75rem,4vw,2.625rem)] font-semibold leading-tight tracking-tight text-foreground">{title}</h1>
          {titleArabic ? <p className="mt-3 font-serif text-[27px] leading-relaxed text-primary-dark" lang="ar" dir="rtl">{titleArabic}</p> : null}
          <p className="mt-2 max-w-[720px] text-[13px] leading-7 text-text-secondary">{subtitle}</p>
        </div>
        <Link className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-line px-4 text-xs font-extrabold text-text-secondary transition hover:bg-surface hover:text-primary-dark max-sm:mt-4" href={kind === "part" ? "/parts" : "/"}>← Back</Link>
      </div>

      <div className="sticky top-[120px] z-10 my-4 flex flex-wrap items-center gap-2.5 rounded-[17px] border border-line bg-background/95 p-2.5 shadow-card backdrop-blur-xl sm:top-[81px] sm:my-5" aria-label="Reader settings">
        <div className="flex items-center gap-1 rounded-xl border border-line bg-surface-secondary p-1" role="group" aria-label="Text view">
          <span className="px-1 text-[9px] font-black uppercase tracking-wider text-text-secondary">View</span>
          {(["arabic", "translation", "both"] as const).map((item) => (
            <button key={item} type="button" className={`min-h-8 rounded-lg px-2.5 text-[10px] font-extrabold transition ${mode === item ? "bg-primary text-primary-foreground" : "text-text-secondary hover:bg-surface"}`} onClick={() => setMode(item)} aria-pressed={mode === item}>
              {item === "arabic" ? "Arabic" : item === "translation" ? "Translation" : "Both"}
            </button>
          ))}
        </div>
        {mode !== "arabic" && (
          <label className="flex items-center gap-2 rounded-xl border border-line bg-surface-secondary px-2.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Translate</span>
            <select className="min-h-9 max-w-[155px] rounded-lg bg-transparent py-1 pr-5 text-[11px] font-bold text-foreground outline-none" value={translationKey} onChange={(event) => setTranslationKey(event.target.value)} aria-label="Choose translation language">
              {translationOptions.map((language) => <option key={language.key} value={language.key}>{language.name}</option>)}
            </select>
          </label>
        )}
        <div className="ml-auto flex items-center gap-1.5" aria-label="Text size controls">
          <button className="grid size-8 place-items-center rounded-lg border border-line bg-surface text-lg text-primary-dark" type="button" onClick={() => setFontScale((value) => Math.max(.8, +(value - .1).toFixed(1)))} aria-label="Decrease text size">−</button>
          <span className="px-1 text-[9px] font-black uppercase tracking-wider text-text-secondary">Text</span>
          <button className="grid size-8 place-items-center rounded-lg border border-line bg-surface text-lg text-primary-dark" type="button" onClick={() => setFontScale((value) => Math.min(1.5, +(value + .1).toFixed(1)))} aria-label="Increase text size">+</button>
        </div>
      </div>

      <div ref={contentRef} className="grid gap-3">
        {lines.map((line) => {
          const arabic = line.texts.arabicText ?? "";
          const translation = line.texts[translationKey] ?? "";
          const bookmarkId = `${kind}:${parentId}:${line.number}`;
          const saved = bookmarkedLines.includes(bookmarkId);
          return (
            <article key={line.number} id={`line-${line.number}`} data-reader-line={line.number} className="scroll-mt-40 overflow-hidden rounded-[18px] border border-line bg-surface shadow-card">
              <div className="flex items-center justify-between border-b border-line px-3.5 py-2 text-[10px] text-text-tertiary">
                <span>{dayLabel ? `Line ${line.number}` : `Passage ${line.number}`}</span>
                <button type="button" className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-extrabold transition ${saved ? "bg-primary-soft text-primary-dark" : "text-text-tertiary hover:bg-primary-soft hover:text-primary-dark"}`} onClick={() => toggleLineBookmark(line)} aria-pressed={saved}>
                  <span aria-hidden="true">{saved ? "◆" : "◇"}</span> {saved ? "Saved" : "Bookmark"}
                </button>
              </div>
              <div className={`px-3 pb-4 pt-1 sm:px-5 ${mode === "both" ? "grid grid-cols-1 sm:grid-cols-2" : ""}`}>
                {mode !== "translation" && arabic ? <p className={`py-3 font-serif leading-[2] text-right text-foreground sm:text-[1.7rem] ${mode === "both" ? "sm:col-start-2 sm:row-start-1" : ""}`} lang="ar" dir="rtl" style={{ fontSize: `${1.7 * fontScale}rem` }}>{arabic}</p> : null}
                {mode !== "arabic" && translation ? (
                  <p className={`py-3 font-serif leading-[1.9] text-text-secondary ${selectedLanguage.direction === "rtl" ? "text-right leading-[2]" : ""} ${mode === "both" ? "sm:col-start-1 sm:row-start-1 sm:border-r sm:border-line sm:pr-5" : ""}`} lang={selectedLanguage.code} dir={selectedLanguage.direction} style={{ fontSize: `${1.15 * fontScale}rem` }}>{translation}</p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 rounded-[18px] border border-primary-border bg-primary-soft p-4 max-sm:flex-col max-sm:items-start">
        <div className="text-xs leading-6 text-foreground">
          {kind === "part" ? <><strong>{completed ? "Portion marked complete." : "Reading progress is saved locally."}</strong><br />Currently at line {currentLine} of {lines.length}.</> : <><strong>Your place is saved in this browser.</strong><br />Your bookmarks are available from the top navigation.</>}
        </div>
        <div className="flex flex-wrap gap-2">
          {kind === "part" ? <button className="inline-flex min-h-10 items-center justify-center rounded-xl border border-primary-border bg-surface px-3.5 text-[11px] font-extrabold text-primary-dark transition hover:bg-primary-soft" type="button" onClick={markComplete}>{completed ? "Undo complete" : "Mark today complete"}</button> : null}
          <Link className="inline-flex min-h-10 items-center justify-center rounded-xl border border-primary-border bg-surface px-3.5 text-[11px] font-extrabold text-primary-dark transition hover:bg-primary-soft" href="/bookmarks">Saved passages</Link>
        </div>
      </div>
      {kind === "part" ? (
        <nav className="mt-3 flex justify-between gap-3" aria-label="Part navigation">
          {previousPart ? <Link className="max-w-[48%] text-xs font-extrabold text-primary-dark hover:underline" href={`/read/${previousPart}`}>← Part {previousPart}</Link> : <span />}
          {nextPart ? <Link className="max-w-[48%] text-xs font-extrabold text-primary-dark hover:underline" href={`/read/${nextPart}`}>Part {nextPart} →</Link> : <Link className="max-w-[48%] text-xs font-extrabold text-primary-dark hover:underline" href="/parts">All parts →</Link>}
        </nav>
      ) : null}
    </div>
  );
}
