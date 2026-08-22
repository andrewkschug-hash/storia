import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
};

export function A2PlusPathwayPanel({
  a2PlusAccess,
  lockedHint,
  primaryPathwayStoryId,
  a2PlusRows,
  onSelectAvailable,
  onOpenStoryChapter,
  onShowHint,
}: Props) {
  const { colors } = useTheme();
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(primaryPathwayStoryId);

  if (!a2PlusAccess) {
    return (
      <View style={[styles.locked, { borderColor: colors.border, backgroundColor: colors.backgroundElevated }]}>
        <Text style={[Typography.chapterTitle, { color: colors.text }]}>A2+ pathways</Text>
        <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
          {lockedHint}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={[Typography.body, { color: colors.textSecondary, marginBottom: Spacing.md }]}>
        Choose what kind of Italian story you want next.
      </Text>
      <View style={{ gap: Spacing.md }}>
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
    marginTop: Spacing.sm,
  },
  locked: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
});
