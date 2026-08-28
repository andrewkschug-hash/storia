import { Platform, StyleSheet, Text, View } from 'react-native';

import { palette, Typography } from '@/src/theme/tokens';

export type StoribaseLogoProps = {
  size?: number;
  showText?: boolean;
  textColor?: string;
  variant?: 'circle' | 'mark';
  style?: object;
};

/**
 * Official Storibase brand logo mark (Interlocking 'S' / Book pages + Speech arc).
 * Rendered via crisp vector math on Web and styled vector silhouette on native.
 */
export function StoribaseLogo({
  size = 32,
  showText = false,
  textColor,
  variant = 'circle',
  style,
}: StoribaseLogoProps) {
  const isWeb = Platform.OS === 'web';
  const radius = size / 2;

  // Render high-precision SVG directly on Web
  if (isWeb) {
    const isCircle = variant === 'circle';
    return (
      <View style={[styles.container, style]}>
        <div
          style={{
            width: size,
            height: size,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
          <svg
            viewBox="0 0 512 512"
            width={size}
            height={size}
            style={{ width: size, height: size, display: 'block' }}>
            {isCircle && <circle cx="256" cy="256" r="256" fill="#F7F5F0" />}

            <g transform="translate(0, 0)">
              {/* Left Book Leaf */}
              <path
                d="M192 110 L246 142 V240 L192 208 Z"
                fill="#F0EAE1"
                stroke="#C97858"
                strokeWidth="14"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d="M152 134 V226 L192 208 V110 Z"
                fill="#E5DCCE"
                stroke="#C97858"
                strokeWidth="14"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Right Book Leaf */}
              <path
                d="M320 110 L266 142 V240 L320 208 Z"
                fill="#FDFBF7"
                stroke="#C97858"
                strokeWidth="14"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d="M360 134 V226 L320 208 V110 Z"
                fill="#EFE8DC"
                stroke="#C97858"
                strokeWidth="14"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Book Spine Center Line */}
              <line
                x1="256"
                y1="148"
                x2="256"
                y2="242"
                stroke="#B65F45"
                strokeWidth="12"
                strokeLinecap="round"
              />

              {/* Interlocking Terracotta 'S' Ribbon */}
              <path
                d="M154 180 C 130 220 160 270 230 300 C 300 330 340 360 320 405 C 300 445 230 445 190 415"
                fill="none"
                stroke="#C97858"
                strokeWidth="30"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Slate Charcoal Speech & Dialogue Arc */}
              <path
                d="M256 244 C 330 275 365 315 352 365 C 335 430 240 455 178 410 L 148 438 L 158 385 C 140 355 146 315 180 278"
                fill="none"
                stroke="#252525"
                strokeWidth="22"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </div>
        {showText && (
          <Text
            style={[
              Typography.brand,
              styles.brandText,
              { color: textColor ?? palette.charcoal, fontSize: size * 0.8 },
            ]}>
            Storibase
          </Text>
        )}
      </View>
    );
  }

  // Native fallback container
  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.nativeCircle,
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: variant === 'circle' ? palette.ivory : 'transparent',
            borderWidth: variant === 'circle' ? 1.5 : 0,
            borderColor: 'rgba(201, 120, 88, 0.3)',
          },
        ]}>
        <View style={[styles.nativeMark, { width: size * 0.6, height: size * 0.6 }]}>
          <Text
            style={{
              fontFamily: 'CormorantGaramond_600SemiBold',
              fontSize: size * 0.55,
              lineHeight: size * 0.6,
              color: palette.terracotta,
              fontWeight: '700',
            }}>
            S
          </Text>
        </View>
      </View>
      {showText && (
        <Text
          style={[
            Typography.brand,
            styles.brandText,
            { color: textColor ?? palette.charcoal, fontSize: size * 0.8 },
          ]}>
          Storibase
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nativeCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  nativeMark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    letterSpacing: 0.5,
  },
});
