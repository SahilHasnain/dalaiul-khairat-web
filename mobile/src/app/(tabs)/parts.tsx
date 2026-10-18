import { useRouter } from 'expo-router';
import { Card, Heading, Label, Page, RowLink } from '@/components/ui';
import { PARTS, getPartTitle } from '@/lib/content';

export default function PartsScreen() {
  const router = useRouter();
  return (
    <Page>
      <Heading>Weekly cycle</Heading>
      <Label>Choose a portion to read in Arabic and English.</Label>
      <Card style={{ paddingVertical: 0, paddingHorizontal: 14, gap: 0 }}>
        {PARTS.map((part) => <RowLink key={part.number} title={getPartTitle(part)} subtitle={`${part.lines.length} lines · ${part.description}`} onPress={() => router.push(`/read/${part.number}` as never)} />)}
      </Card>
    </Page>
  );
}
