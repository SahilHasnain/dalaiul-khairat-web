import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Card, Heading, Label, Page, useAppColors } from '@/components/ui';
import { Palette } from '@/constants/theme';
import { getBookmarks, toggleBookmark, type SavedBookmark } from '@/lib/storage';

export default function BookmarksScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);

  const refresh = useCallback(() => {
    let active = true;
    void getBookmarks().then((items) => { if (active) setBookmarks(items); });
    return () => { active = false; };
  }, []);

  useFocusEffect(refresh);

  const openBookmark = (bookmark: SavedBookmark) => {
    router.push(bookmark.kind === 'part'
      ? { pathname: '/read/[partNumber]', params: { partNumber: String(bookmark.parentId), line: String(bookmark.lineNumber) } } as never
      : { pathname: '/dua/[slug]', params: { slug: String(bookmark.parentId), line: String(bookmark.lineNumber) } } as never);
  };

  const removeBookmark = async (bookmark: SavedBookmark) => setBookmarks(await toggleBookmark(bookmark));

  return (
    <Page>
      <Heading>Saved passages</Heading>
      <Label>Bookmarks are stored locally on this device.</Label>
      {bookmarks.length === 0 ? (
        <Card style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No bookmarks yet</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Save a line while reading and it will appear here.</Text>
        </Card>
      ) : bookmarks.map((bookmark) => (
        <Card key={bookmark.id} style={styles.bookmarkCard}>
          <Pressable style={styles.bookmarkContent} onPress={() => openBookmark(bookmark)} accessibilityRole="button">
            <Text style={[styles.bookmarkTitle, { color: colors.text }]}>{bookmark.title}</Text>
            <Text style={[styles.bookmarkMeta, { color: colors.textSecondary }]}>Open this passage</Text>
          </Pressable>
          <Pressable onPress={() => void removeBookmark(bookmark)} accessibilityRole="button" accessibilityLabel={`Remove ${bookmark.title} bookmark`} hitSlop={8}>
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </Card>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  empty: { paddingVertical: 28 },
  emptyTitle: { fontSize: 17, fontWeight: '800' },
  emptyText: { fontSize: 13, lineHeight: 20 },
  bookmarkCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bookmarkContent: { flex: 1, gap: 5 },
  bookmarkTitle: { fontSize: 14, fontWeight: '800' },
  bookmarkMeta: { fontSize: 12 },
  remove: { color: Palette.amberDark, fontSize: 12, fontWeight: '800' },
});
