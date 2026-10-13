import Link from "next/link";

const navItems = [
  { href: "/", label: "Today" },
  { href: "/parts", label: "Browse parts" },
  { href: "/bookmarks", label: "Bookmarks" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 sm:min-h-[76px] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5">
        <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label="Dalailul Khairat home">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-primary-border bg-primary-soft font-serif text-2xl text-primary-dark" aria-hidden="true">۞</span>
          <span className="min-w-0">
            <span className="block font-serif text-[16px] font-bold tracking-tight text-foreground">Dalailul Khairat</span>
            <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[.14em] text-text-tertiary">A text reading companion</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-full px-3 py-2 text-[12px] font-bold text-text-secondary transition hover:bg-primary-soft hover:text-foreground sm:px-3.5 sm:text-[13px]">
              {item.label}
            </Link>
          ))}
          <Link href="/search" className="ml-1 inline-flex shrink-0 items-center gap-2 rounded-full border border-primary-border px-3 py-2 text-[11px] font-extrabold text-primary-dark transition hover:bg-primary-soft sm:px-3.5 sm:text-[12px]">
            <span aria-hidden="true" className="text-base leading-none">⌕</span> Search
          </Link>
        </nav>
      </div>
    </header>
  );
}
