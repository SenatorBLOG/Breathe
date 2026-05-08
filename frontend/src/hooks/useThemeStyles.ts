// src/hooks/useThemeStyles.ts
// Use this hook to get theme-aware colors for inline styles and gradient buttons
import { useTheme, type Theme } from '../contexts/ThemeContext';

interface ThemeStyles {
  // Gradient for primary CTA buttons
  btnGradient:  string;
  btnShadow:    string;
  // Text colors
  textPrimary:  string;
  textSecondary:string;
  textMuted:    string;
  textDim:      string;
  // Backgrounds
  cardBg:       string;
  cardBgHover:  string;
  pageBg:       string;
  // Borders
  border:       string;
  borderHover:  string;
  // Accent
  accent:       string;
  accentLight:  string;
  // Nav
  navBg:        string;
}

const STYLES: Record<Theme, ThemeStyles> = {
  night: {
    btnGradient:   'linear-gradient(135deg,#1A5FCC,#3A82F7)',
    btnShadow:     '0 0 24px rgba(58,130,247,0.4)',
    textPrimary:   '#EEF5FF',
    textSecondary: '#7AC4FF',
    textMuted:     '#7AABCC',   // ↑ brighter: was #5A8FBB
    textDim:       '#7090B4',   // ↑ WCAG AA: was #3A5070 (contrast ~2.6:1 → 6.6:1)
    cardBg:        'rgba(12,24,44,0.88)',
    cardBgHover:   'rgba(16,32,60,0.94)',
    pageBg:        '#010814',
    border:        'rgba(58,130,247,0.18)',  // ↑ blue-tinted, more visible
    borderHover:   'rgba(58,130,247,0.45)',
    accent:        '#3A82F7',   // ↑ bright blue as primary accent (was dark #1A5FCC)
    accentLight:   '#7AC4FF',
    navBg:         'rgba(6,12,26,0.96)',
  },
  day: {
    btnGradient:   'linear-gradient(135deg,#8A5A00,#9E6800)', // ↑ WCAG AA: white text 4.74:1+ across full gradient
    btnShadow:     '0 0 24px rgba(154,104,0,0.45)',
    textPrimary:   '#0A0A1E',
    textSecondary: '#1A2A5E',
    textMuted:     '#4A5A80',   // 5.89:1 on pageBg ✅
    textDim:       '#536280',   // ↑ WCAG AA: was #6A7A9A (3.78:1 → 5.39:1 on pageBg) ✅
    cardBg:        'rgba(255,252,240,0.92)',
    cardBgHover:   'rgba(255,250,230,0.98)',
    pageBg:        '#F5F0E8',
    border:        'rgba(180,140,60,0.40)',
    borderHover:   'rgba(200,140,30,0.65)',
    accent:        '#8B5E08',   // ↑ WCAG AA: was #C8860A (2.71:1 → 4.62:1 on pageBg) ✅
    accentLight:   '#956000',   // ↑ WCAG AA: was #E8A020 (2.07:1 → 4.67:1 on pageBg) ✅
    navBg:         'rgba(245,240,220,0.97)',
  },
  nature: {
    btnGradient:   'linear-gradient(135deg,#1A9A50,#2ECC71)',
    btnShadow:     '0 0 24px rgba(46,204,113,0.45)',
    textPrimary:   '#EDFFF5',
    textSecondary: '#4AE8A0',   // bright mint — keep
    textMuted:     '#90CCA8',   // ↑ much brighter: was #5BA870
    textDim:       '#72A880',   // ↑ WCAG AA: was #4A7858 (contrast ~3.7:1 → 6.4:1)
    cardBg:        'rgba(16,42,22,0.90)',    // ↑ lighter + more opaque vs bg
    cardBgHover:   'rgba(22,56,30,0.96)',
    pageBg:        '#0A1A0E',
    border:        'rgba(74,200,110,0.22)',  // ↑ bright green tint, visible
    borderHover:   'rgba(74,220,120,0.50)',
    accent:        '#2ECC71',   // ↑ bright green as accent (was dark #1A7A40)
    accentLight:   '#4AE8A0',
    navBg:         'rgba(6,18,8,0.97)',
  },
};

export function useThemeStyles(): ThemeStyles {
  const { theme } = useTheme();
  return STYLES[theme];
}

export { STYLES as THEME_STYLES };