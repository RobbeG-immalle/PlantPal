import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

/** Typography scale for PlantPal. */
export const typography = {
  largeTitle: {
    fontFamily,
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
  },
  title1: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  title2: {
    fontFamily,
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  title3: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
  },
  headline: {
    fontFamily,
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontFamily,
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  callout: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
  },
  subheadline: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  footnote: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption1: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  caption2: {
    fontFamily,
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
  },
};
