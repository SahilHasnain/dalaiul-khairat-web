import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Dalailul Khairat · A Text Reading Companion",
    template: "%s · Dalailul Khairat",
  },
  description: "Read Dalailul Khairat in Arabic and translations, follow the daily wird, and save your place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line text-text-secondary">
          <div className="mx-auto flex w-full max-w-6xl justify-between gap-4 px-4 py-5 text-[11px] max-sm:flex-col sm:px-5">
            <span>Dalailul Khairat · A quiet place to read and reflect</span>
            <span>Progress and bookmarks are saved on this device.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
