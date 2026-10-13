import BookmarkList from "@/components/bookmark-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Return to passages you saved while reading Dalailul Khairat.",
};

export default function BookmarksPage() {
  return <BookmarkList />;
}
