import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PathwayWorldCard } from '@/src/components/pathway/PathwayWorldCard';
import { StoryPathPanel } from '@/src/components/storiesLibrary/StoryPathPanel';
import type { ExtraStoryRow } from '@/src/components/storiesLevelInsert';
import { A2_PLUS_PATHWAYS, type PathwayDefinition } from '@/src/pathway/paths';
import type { ChapterListItem } from '@/src/progress/useReadingProgress';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  a2PlusAccess: boolean;
  lockedHint: string;
  primaryPathwayStoryId: string | null;
  a2PlusRows: ExtraStoryRow[];
  onSelectAvailable: (pathway: PathwayDefinition) => void;
  onOpenStoryChapter: (storyId: string, chapterId: string) => void;
  onShowHint: (message: string) => void;
  onOpenPathwayGate?: () => void;
};

export function A2PlusPathwayPanel({
  a2PlusAccess,
  lockedHint,
  primaryPathwayStoryId,
  a2PlusRows,
  onSelectAvailable,
  onOpenStoryChapter,
  onShowHint,
  onOpenPathwayGate,
}: Props) {
  const { colors } = useTheme();
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);

  if (!a2PlusAccess) {
    return (
      <View style={styles.editorialBreak}>
        <View style={[styles.hairline, { backgroundColor: colors.divider }]} />
        <View style={styles.breakTextContent}>
          <Text style={[Typography.chapterEyebrow, { color: colors.tint, letterSpacing: 1.4 }]}>
            🌿 A Well-Deserved Break · A2+
          </Text>
          <Text style={[styles.breakTitle, { color: colors.text }]}>
            Luca's Reading Corner
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
            After completing his journey in Rome, Luca takes a quiet evening at home to unwind with independent Italian novels.
          </Text>
          <Text style={[Typography.caption, { color: colors.tint, marginTop: Spacing.xs }]}>
            {lockedHint}
          </Text>
        </View>
        <View style={[styles.hairline, { backgroundColor: colors.divider }]} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.editorialBreak}>
        <View style={[styles.hairline, { backgroundColor: colors.divider }]} />
        <View style={styles.breakTextContent}>
          <Text style={[Typography.chapterEyebrow, { color: colors.tint, letterSpacing: 1.4 }]}>
            🌿 A Well-Deserved Break · A2+
          </Text>
          <Text style={[styles.breakTitle, { color: colors.text }]}>
            Luca's Reading Corner
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
            After a demanding week at the Rome café, Luca is taking a quiet evening at home in his apartment to unwind. He has three intriguing Italian novels on his coffee table, and he needs your help choosing which one to read!
          </Text>
          {onOpenPathwayGate ? (
            <Pressable
              accessibilityRole="button"
              onPress={onOpenPathwayGate}
              style={({ pressed }) => [
                styles.noteButton,
                {
                  backgroundColor: colors.accentSoft,
                  borderColor: colors.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}>
              <Text style={[Typography.label, { color: colors.tint, fontFamily: 'Literata_600SemiBold' }]}>
                📖 Why is Luca reading? Read his note →
              </Text>
            </Pressable>
          ) : null}
        </View>
        <View style={[styles.hairline, { backgroundColor: colors.divider }]} />
      </View>

      <View style={{ gap: Spacing.md, marginTop: Spacing.md }}>
        {A2_PLUS_PATHWAYS.map((pathway) => {
          const row =
            pathway.storyId != null
              ? a2PlusRows.find((item) => item.storyId === pathway.storyId)
              : undefined;
          const chapters = (row?.chapters ?? []) as ChapterListItem[];
          const expanded = pathway.storyId != null && expandedStoryId === pathway.storyId;
          const currentChapterId =
            chapters.find((c) => c.status === 'available')?.id ??
            chapters.find((c) => c.status === 'completed')?.id ??
            chapters[0]?.id ??
            '';

          return (
            <View key={pathway.id}>
              <PathwayWorldCard
                pathway={pathway}
                primary={pathway.storyId === primaryPathwayStoryId}
                selected={expanded}
                onPress={
                  pathway.status === 'available'
                    ? () => {
                        if (!pathway.storyId) return;
                        setExpandedStoryId((prev) =>
                          prev === pathway.storyId ? null : pathway.storyId,
                        );
                        onSelectAvailable(pathway);
                      }
                    : undefined
                }
              />
              {expanded && chapters.length > 0 ? (
                <StoryPathPanel
                  chapters={chapters}
                  currentChapterId={currentChapterId}
                  storyId={pathway.storyId!}
                  progress={null}
                  useStoryPath={false}
                  onOpenChapter={(chapterId) => onOpenStoryChapter(pathway.storyId!, chapterId)}
                  onOpenStoryChapter={onOpenStoryChapter}
                  onOpenGrammar={() => undefined}
                  onOpenRecap={() => undefined}
                  onOpenSpeak={() => undefined}
                  onShowHint={onShowHint}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: Spacing.xs,
  },
  editorialBreak: {
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  breakTextContent: {
    paddingHorizontal: Spacing.xs,
    gap: 4,
  },
  breakTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    lineHeight: 30,
    marginTop: 2,
  },
  noteButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
});

