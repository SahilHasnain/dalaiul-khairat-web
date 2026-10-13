import Reader from "@/components/reader";
import { DALAIL_DUAS, DALAIL_LANGUAGES, getDua } from "@/lib/dalail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return DALAIL_DUAS.map((dua) => ({ slug: dua.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dua = getDua(slug);
  return dua
    ? { title: dua.title, description: `${dua.title} from Dalailul Khairat.` }
    : { title: "Dua not found" };
}

export default async function DuaPage({ params }: PageProps) {
  const { slug } = await params;
  const dua = getDua(slug);
  if (!dua) notFound();
  return (
    <Reader
      kind="dua"
      parentId={dua.slug}
      title={dua.title}
      titleArabic={dua.titleArabic}
      subtitle="Read the dua in Arabic, transliteration, or a translation."
      lines={dua.lines}
      languages={DALAIL_LANGUAGES}
    />
  );
}
