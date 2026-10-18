import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton, Card, Heading, Label, Page, RowLink, SectionTitle, useAppColors } from '@/components/ui';
import { Palette } from '@/constants/theme';
import { DALAIL_TITLE, DUAS, getPart, getPartTitle, PARTS } from '@/lib/content';
import { getBookmarks, getSavedProgress, isPartCompleteToday, type SavedBookmark, type SavedProgress } from '@/lib/storage';

function getTodayPartNumber() {
  return new Date().getDay() === 0 ? 7 : new Date().getDay();
}

export default function HomeScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const [progress, setProgress] = useState<SavedProgress | null>(null);
  const [completed, setCompleted] = useState(false);
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const todayPart = getPart(getTodayPartNumber()) ?? PARTS[0];

  useFocusEffect(useCallback(() => {
    let active = true;
    void Promise.all([getSavedProgress(), isPartCompleteToday(todayPart.number), getBookmarks()]).then(([saved, isComplete, savedBookmarks]) => {
      if (!active) return;
      setProgress(saved);
      setCompleted(isComplete);
      setBookmarks(savedBookmarks);
    });
    return () => { active = false; };
  }, [todayPart.number]));

  const openReader = (partNumber: number, line?: number) => router.push({ pathname: '/read/[partNumber]', params: { partNumber: String(partNumber), line: line === undefined ? '' : String(line) } } as never);

  return (
    <Page>
      <Label style={styles.eyebrow}>DAILY SALAWAT</Label>
      <Heading>{DALAIL_TITLE}</Heading>
      <Label>Read one portion at a time. Your place and bookmarks stay on this device.</Label>

      <Card style={[styles.hero, { backgroundColor: colors.backgroundSelected }]}>
        <Label style={{ color: Palette.amberDark }}>TODAY’S PORTION</Label>
        <Text style={[styles.heroTitle, { color: colors.text }]}>{getPartTitle(todayPart)}</Text>
        <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>{todayPart.description}</Text>
        <View style={styles.actions}>
          <View style={styles.actionFlex}><AppButton onPress={() => openReader(todayPart.number)}>{completed ? 'Read again' : 'Start today’s reading'}</AppButton></View>
          {progress ? <View style={styles.actionFlex}><AppButton secondary onPress={() => openReader(progress.partNumber, progress.lineNumber)}>Continue · Part {progress.partNumber}</AppButton></View> : null}
        </View>
      </Card>

      <View>
        <SectionTitle title="Weekly cycle" action={<Pressable onPress={() => router.navigate('/parts' as never)}><Text style={styles.actionText}>All parts</Text></Pressable>} />
        <Card style={styles.listCard}>
          {PARTS.map((part) => <RowLink key={part.number} title={getPartTitle(part)} subtitle={`Part ${part.number} · ${part.lines.length} lines`} onPress={() => openReader(part.number)} trailing={part.number === todayPart.number ? 'Today' : undefined} />)}
        </Card>
      </View>

      <View>
        <SectionTitle title="Opening duas" />
        <Card style={styles.listCard}>
          {DUAS.map((dua) => <RowLink key={dua.slug} title={dua.title} subtitle="Arabic and English" onPress={() => router.push(`/dua/${dua.slug}` as never)} />)}
        </Card>
      </View>

      {bookmarks.length > 0 ? <Pressable onPress={() => router.navigate('/bookmarks' as never)}><Label style={styles.footerLink}>{bookmarks.length} saved {bookmarks.length === 1 ? 'passage' : 'passages'} · View bookmarks</Label></Pressable> : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontSize: 10, letterSpacing: 2.2, fontWeight: '900', color: Palette.amberDark },
  hero: { padding: 21, gap: 12 },
  heroTitle: { fontSize: 22, fontWeight: '800' },
  heroDescription: { fontSize: 13, lineHeight: 20 },
  actions: { gap: 9, marginTop: 3 },
  actionFlex: { width: '100%' },
  actionText: { color: Palette.amberDark, fontSize: 12, fontWeight: '800' },
  listCard: { paddingVertical: 0, paddingHorizontal: 14, gap: 0 },
  footerLink: { color: Palette.amberDark, textAlign: 'center', paddingVertical: 8 },
});
