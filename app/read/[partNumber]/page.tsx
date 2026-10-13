import Reader from "@/components/reader";
import { DALAIL_LANGUAGES, DALAIL_PARTS, getPart } from "@/lib/dalail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ partNumber: string }>;
};

export function generateStaticParams() {
  return DALAIL_PARTS.map((part) => ({ partNumber: String(part.number) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { partNumber } = await params;
  const part = getPart(Number(partNumber));
  if (!part) return { title: "Part not found" };
  const title = part.number === 8 ? "Monday · Cycle closing portion" : `${part.day} · Part ${part.number}`;
  return { title, description: part.description };
}

export default async function ReadPartPage({ params }: PageProps) {
  const { partNumber: partNumberText } = await params;
  const partNumber = Number(partNumberText);
  const part = getPart(partNumber);
  if (!part || !Number.isInteger(partNumber)) notFound();

  const title = part.number === 8 ? "Monday · Cycle closing portion" : `${part.day} · Part ${part.number}`;
  return (
    <Reader
      kind="part"
      parentId={part.number}
      title={title}
      subtitle={part.description}
      dayLabel={part.number === 8 ? "Part 8 · Cycle closing" : `Part ${part.number} · ${part.day}`}
      titleArabic={part.title}
      lines={part.lines}
      languages={DALAIL_LANGUAGES}
      previousPart={part.number > 1 ? part.number - 1 : undefined}
      nextPart={part.number < DALAIL_PARTS.length ? part.number + 1 : undefined}
    />
  );
}
