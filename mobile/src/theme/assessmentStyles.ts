import type { SelfAssessment } from '@/src/vocabulary/selfAssessment';
import type { ThemeColors } from '@/src/theme/tokens';

export type AssessmentButtonStyle = {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  indicatorColor: string;
};

export function selfAssessmentStyle(
  assessment: SelfAssessment,
  colors: ThemeColors,
  selected = false,
): AssessmentButtonStyle {
  const base = stylesForAssessment(assessment, colors);
  if (!selected) {
    return {
      ...base,
      backgroundColor: colors.backgroundElevated,
      borderColor: colors.border,
      textColor: colors.text,
    };
  }
  return base;
}

function stylesForAssessment(
  assessment: SelfAssessment,
  colors: ThemeColors,
): AssessmentButtonStyle {
  switch (assessment) {
    case 'got_it':
      return {
        backgroundColor: colors.assessmentGotItBg,
        borderColor: colors.assessmentGotItBorder,
        textColor: colors.assessmentGotItText,
        indicatorColor: colors.assessmentGotItIndicator,
      };
    case 'almost':
      return {
        backgroundColor: colors.assessmentAlmostBg,
        borderColor: colors.assessmentAlmostBorder,
        textColor: colors.assessmentAlmostText,
        indicatorColor: colors.assessmentAlmostIndicator,
      };
    case 'not_yet':
      return {
        backgroundColor: colors.assessmentNotYetBg,
        borderColor: colors.assessmentNotYetBorder,
        textColor: colors.assessmentNotYetText,
        indicatorColor: colors.assessmentNotYetIndicator,
      };
  }
}
