import HomeDashboard from "@/components/home-dashboard";
import { DALAIL_DUAS, DALAIL_PARTS } from "@/lib/dalail";

export default function Home() {
  const parts = DALAIL_PARTS.map(({ number, day, title, description }) => ({ number, day, title, description }));
  const duas = DALAIL_DUAS.map(({ id, slug, title, titleArabic }) => ({ id, slug, title, titleArabic }));

  return <HomeDashboard parts={parts} duas={duas} />;
}
