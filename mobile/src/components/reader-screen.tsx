import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, Card, Label, useAppColors } from '@/components/ui';
import { Palette } from '@/constants/theme';
import { getDua, getPart, getPartTitle, type DalailDua, type DalailPart, type ReaderLine } from '@/lib/content';
import { getBookmarks, getSavedProgress, isPartCompleteToday, saveProgress, toggleBookmark } from '@/lib/storage';

type ReaderKind = 'part' | 'dua';
type ReaderContent = DalailPart | DalailDua;

export default function ReaderScreen({ kind }: { kind: ReaderKind }) {
  const colors = useAppColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ partNumber?: string; slug?: string; line?: string }>();
  const content: ReaderContent | undefined = kind === 'part' ? getPart(Number(params.partNumber)) : getDua(String(params.slug ?? ''));
  const lines = content?.lines ?? [];
  const title = content ? kind === 'part' ? getPartTitle(content as DalailPart) : content.title : 'Reader';
  const parentId = kind === 'part' ? Number(params.partNumber) : String(params.slug ?? '');
  const scrollRef = useRef<ScrollView>(null);
  const trackRef = useRef<View>(null);
  const lineOffsetsRef = useRef<Record<number, number>>({});
  const contentHeightRef = useRef(1);
  const viewportHeightRef = useRef(1);
  const currentLineRef = useRef(lines[0]?.number ?? 0);
  const [progress, setProgress] = useState(0);
  const [currentLine, setCurrentLine] = useState(lines[0]?.number ?? 0);
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [fontScale, setFontScale] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [view, setView] = useState<'both' | 'arabic' | 'english'>('both');

  const bookmarkPrefix = `${kind}:${parentId}:`;
  const currentBookmarkId = (lineNumber: number) => `${bookmarkPrefix}${lineNumber}`;

  useEffect(() => {
    let active = true;
    void Promise.all([getBookmarks(), kind === 'part' ? getSavedProgress() : Promise.resolve(null), kind === 'part' ? isPartCompleteToday(Number(parentId)) : Promise.resolve(false)]).then(([saved, storedProgress, isComplete]) => {
      if (!active) return;
      setBookmarked(saved.filter((item) => item.id.startsWith(bookmarkPrefix)).map((item) => item.id));
      setCompleted(isComplete);
      const requestedLine = Number(params.line);
      const lineNumber = Number.isFinite(requestedLine) && params.line ? requestedLine : storedProgress?.partNumber === Number(parentId) ? storedProgress.lineNumber : undefined;
      if (lineNumber !== undefined) {
        const scrollToLine = () => {
          const y = lineOffsetsRef.current[lineNumber];
          if (y !== undefined) scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: false });
        };
        setCurrentLine(lineNumber);
        currentLineRef.current = lineNumber;
        requestAnimationFrame(scrollToLine);
        setTimeout(scrollToLine, 80);
      }
    });
    return () => { active = false; };
  }, [bookmarkPrefix, kind, params.line, parentId]);

  const seek = (clientX: number) => {
    trackRef.current?.measureInWindow((left, _top, width) => {
      if (!width) return;
      const fraction = Math.max(0, Math.min(1, (clientX - left) / width));
      const maxScroll = Math.max(0, contentHeightRef.current - viewportHeightRef.current);
      scrollRef.current?.scrollTo({ y: fraction * maxScroll, animated: false });
      setProgress(Math.round(fraction * 100));
    });
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    contentHeightRef.current = contentSize.height;
    viewportHeightRef.current = layoutMeasurement.height;
    const maxScroll = Math.max(1, contentSize.height - layoutMeasurement.height);
    setProgress(Math.round(Math.max(0, Math.min(1, contentOffset.y / maxScroll)) * 100));
    const visibleAnchor = contentOffset.y + 110;
    const activeLine = [...lines].reverse().find((line) => (lineOffsetsRef.current[line.number] ?? Infinity) <= visibleAnchor) ?? lines[0];
    if (activeLine && activeLine.number !== currentLineRef.current) {
      currentLineRef.current = activeLine.number;
      setCurrentLine(activeLine.number);
      if (kind === 'part') void saveProgress(Number(parentId), activeLine.number);
    }
  };

  const onContentSizeChange = (_width: number, height: number) => { contentHeightRef.current = height; };
  const onViewportLayout = (event: LayoutChangeEvent) => { viewportHeightRef.current = event.nativeEvent.layout.height; };

  if (!content) {
    return <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}><Label>Passage not found.</Label><AppButton onPress={() => router.back()}>Go back</AppButton></SafeAreaView>;
  }

  const toggleLine = async (line: ReaderLine) => {
    const id = currentBookmarkId(line.number);
    const updated = await toggleBookmark({ id, kind, parentId, lineNumber: line.number, title: `${title} · Line ${line.number}` });
    setBookmarked(updated.filter((item) => item.id.startsWith(bookmarkPrefix)).map((item) => item.id));
  };

  const toggleComplete = async () => {
    const { togglePartComplete: toggle } = await import('@/lib/storage');
    setCompleted(await toggle(Number(parentId)));
  };

  return (
    <SafeAreaView edges={['bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title }} />
      <View
        ref={trackRef}
        collapsable={false}
        style={styles.progressHitArea}
        accessibilityRole="adjustable"
        accessibilityLabel="Reading progress"
        accessibilityValue={{ min: 0, max: 100, now: progress, text: `${progress}% · line ${currentLine} of ${lines.length}` }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => seek(event.nativeEvent.pageX)}
        onResponderMove={(event) => seek(event.nativeEvent.pageX)}
      >
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={[styles.progressThumb, { left: `${progress}%`, backgroundColor: colors.background, borderColor: Palette.amber }]} />
      </View>

      <View style={[styles.toolbar, { borderBottomColor: colors.border, backgroundColor: colors.backgroundElement }]}>
        <View style={styles.viewControls}>
          {(['both', 'arabic', 'english'] as const).map((item) => (
            <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: view === item }} onPress={() => setView(item)} style={[styles.viewButton, view === item && styles.viewButtonActive]}>
              <Text style={[styles.viewButtonText, { color: view === item ? '#302513' : colors.textSecondary }]}>{item === 'both' ? 'Both' : item === 'arabic' ? 'Arabic' : 'English'}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.fontControls}>
          <Pressable accessibilityLabel="Decrease text size" onPress={() => setFontScale((value) => Math.max(0.8, +(value - 0.1).toFixed(1)))}><Text style={[styles.fontButton, { color: colors.text }]}>−</Text></Pressable>
          <Text style={[styles.fontLabel, { color: colors.textSecondary }]}>TEXT</Text>
          <Pressable accessibilityLabel="Increase text size" onPress={() => setFontScale((value) => Math.min(1.5, +(value + 0.1).toFixed(1)))}><Text style={[styles.fontButton, { color: colors.text }]}>+</Text></Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        onLayout={onViewportLayout}
        onContentSizeChange={onContentSizeChange}
        scrollEventThrottle={100}
      >
        {kind === 'dua' && (content as DalailDua).titleArabic ? <Text style={[styles.titleArabic, { color: Palette.amberDark }]} lang="ar" accessibilityLanguage="ar">{(content as DalailDua).titleArabic}</Text> : null}
        {lines.map((line) => {
          const arabic = line.texts.arabicText ?? '';
          const english = line.texts.trans ?? '';
          const isSaved = bookmarked.includes(currentBookmarkId(line.number));
          return (
            <Card key={line.number} onLayout={(event) => { lineOffsetsRef.current[line.number] = event.nativeEvent.layout.y; }} style={styles.lineCard}>
              <View style={styles.lineHeader}>
                <Label>Line {line.number}</Label>
                <Pressable onPress={() => void toggleLine(line)} accessibilityRole="button" accessibilityState={{ selected: isSaved }}>
                  <Text style={[styles.bookmarkButton, { color: isSaved ? Palette.amberDark : colors.textSecondary }]}>{isSaved ? '◆ Saved' : '◇ Save'}</Text>
                </Pressable>
              </View>
              {view !== 'english' && arabic ? <Text style={[styles.arabicText, { color: colors.text, fontSize: 27 * fontScale }]} lang="ar" accessibilityLanguage="ar">{arabic}</Text> : null}
              {view !== 'arabic' && english ? <Text style={[styles.englishText, { color: colors.textSecondary, fontSize: 16 * fontScale }]}>{english}</Text> : null}
            </Card>
          );
        })}
        {kind === 'part' ? <AppButton secondary onPress={() => void toggleComplete()}>{completed ? 'Undo today complete' : 'Mark today complete'}</AppButton> : null}
        <Label style={styles.savedLocal}>Your reading place and bookmarks are saved on this device.</Label>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  progressHitArea: { height: 24, justifyContent: 'center', paddingHorizontal: 0, position: 'relative' },
  progressTrack: { height: 4, width: '100%' },
  progressFill: { height: 4, backgroundColor: Palette.amber, borderTopRightRadius: 3, borderBottomRightRadius: 3 },
  progressThumb: { position: 'absolute', top: 6, marginLeft: -6, width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  toolbar: { minHeight: 54, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth },
  viewControls: { flexDirection: 'row', gap: 4 },
  viewButton: { minHeight: 34, paddingHorizontal: 10, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  viewButtonActive: { backgroundColor: Palette.amber },
  viewButtonText: { fontSize: 11, fontWeight: '800' },
  fontControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fontButton: { fontSize: 21, paddingHorizontal: 4 },
  fontLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  scroll: { flex: 1 },
  scrollContent: { maxWidth: 760, width: '100%', alignSelf: 'center', padding: 16, paddingBottom: 36, gap: 12 },
  titleArabic: { fontSize: 22, textAlign: 'right', fontWeight: '700', paddingVertical: 8 },
  lineCard: { padding: 14, gap: 7 },
  lineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookmarkButton: { fontSize: 11, fontWeight: '800', padding: 5 },
  arabicText: { fontFamily: 'serif', lineHeight: 55, textAlign: 'right', paddingVertical: 4 },
  englishText: { fontFamily: 'serif', lineHeight: 27, paddingVertical: 5 },
  savedLocal: { textAlign: 'center', marginVertical: 8 },
});
