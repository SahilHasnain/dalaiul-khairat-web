import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';

import { Card, Heading, Label, Page, useAppColors } from '@/components/ui';
import { Palette } from '@/constants/theme';
import { searchDalail } from '@/lib/content';

export default function SearchScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchDalail(query), [query]);

  return (
    <Page>
      <Heading>Search the text</Heading>
      <Label>Search English text across the portions and opening duas.</Label>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search a word or phrase"
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel="Search English text"
        returnKeyType="search"
        clearButtonMode="while-editing"
        style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
      />
      {query.trim() ? <Label>{results.length ? `${results.length} matches` : 'No matches found'}</Label> : <Label>Try “salawat”, “Muhammad”, or “blessings”.</Label>}
      {results.map((result) => (
        <Pressable key={result.id} onPress={() => router.push(result.kind === 'part'
          ? { pathname: '/read/[partNumber]', params: { partNumber: String(result.parentId), line: String(result.lineNumber) } } as never
          : { pathname: '/dua/[slug]', params: { slug: String(result.parentId), line: String(result.lineNumber) } } as never)}>
          <Card style={styles.result}>
            <Text style={[styles.resultEyebrow, { color: Palette.amberDark }]}>{result.title} · Line {result.lineNumber}</Text>
            <Text style={[styles.resultTitle, { color: colors.text }]}>{result.subtitle}</Text>
            <Text style={[styles.resultText, { color: colors.textSecondary }]}>{result.text}</Text>
          </Card>
        </Pressable>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, fontSize: 15 },
  result: { gap: 6 },
  resultEyebrow: { fontSize: 11, fontWeight: '800' },
  resultTitle: { fontFamily: 'serif', fontSize: 17, fontWeight: '700' },
  resultText: { fontSize: 13, lineHeight: 20 },
});
