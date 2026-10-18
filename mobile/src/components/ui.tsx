import type { PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme, type PressableProps, type TextProps, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts, Palette } from '@/constants/theme';

export function useAppColors() {
  return Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

export function Page({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const colors = useAppColors();
  const content = scroll ? (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : <View style={styles.content}>{children}</View>;
  return <SafeAreaView edges={['top']} style={[styles.page, { backgroundColor: colors.background }]}>{content}</SafeAreaView>;
}

export function Heading({ children, style, ...props }: TextProps) {
  const colors = useAppColors();
  return <Text {...props} style={[styles.heading, { color: colors.text }, style]}>{children}</Text>;
}

export function Label({ children, style, ...props }: TextProps) {
  const colors = useAppColors();
  return <Text {...props} style={[styles.label, { color: colors.textSecondary }, style]}>{children}</Text>;
}

export function Card({ children, style, ...props }: ViewProps) {
  const colors = useAppColors();
  return <View {...props} style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }, style]}>{children}</View>;
}

export function AppButton({ children, onPress, secondary = false, style, accessibilityLabel }: PropsWithChildren<{
  onPress: PressableProps['onPress'];
  secondary?: boolean;
  style?: PressableProps['style'];
  accessibilityLabel?: string;
}>) {
  const colors = useAppColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed, hovered }) => [styles.button, secondary ? { backgroundColor: colors.backgroundElement, borderWidth: 1, borderColor: colors.border } : { backgroundColor: Palette.amber }, pressed && styles.pressed, typeof style === 'function' ? style({ pressed, hovered }) : style]}
    >
      <Text style={[styles.buttonText, { color: secondary ? colors.text : '#272116' }]}>{children}</Text>
    </Pressable>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  const colors = useAppColors();
  return <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>{action}</View>;
}

export function RowLink({ title, subtitle, onPress, trailing }: { title: string; subtitle?: string; onPress: () => void; trailing?: string }) {
  const colors = useAppColors();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, { borderBottomColor: colors.border }, pressed && styles.rowPressed]}>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.rowTrailing}>{trailing ?? '›'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 36, gap: 16 },
  heading: { fontFamily: Fonts.serif, fontSize: 31, lineHeight: 38, fontWeight: '700' },
  label: { fontSize: 13, lineHeight: 20 },
  card: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 12 },
  button: { minHeight: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  buttonText: { fontSize: 14, lineHeight: 20, fontWeight: '800' },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  row: { minHeight: 66, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, gap: 10, paddingVertical: 11 },
  rowPressed: { opacity: 0.65 },
  rowText: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 14, fontWeight: '700' },
  rowSubtitle: { fontSize: 12, lineHeight: 18 },
  rowTrailing: { color: Palette.amberDark, fontSize: 25, fontWeight: '500' },
});
