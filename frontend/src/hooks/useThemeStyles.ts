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
    textPrimary:   '#B8D9FF',
    textSecondary: '#7AC4FF',
    textMuted:     '#4A7AAA',
    textDim:       '#2A4060',
    cardBg:        'rgba(11,22,40,0.85)',
    cardBgHover:   'rgba(13,27,51,0.90)',
    pageBg:        '#010814',
    border:        'rgba(30,51,88,0.5)',
    borderHover:   'rgba(42,84,153,0.7)',
    accent:        '#1A5FCC',
    accentLight:   '#3A82F7',
    navBg:         'rgba(6,12,26,0.96)',
  },
  day: {
    btnGradient:   'linear-gradient(135deg,#C8860A,#E8A020)',
    btnShadow:     '0 0 24px rgba(232,160,32,0.45)',
    textPrimary:   '#1A1A2E',
    textSecondary: '#2A3A6E',
    textMuted:     '#4A5A8E',
    textDim:       '#8A9ABE',
    cardBg:        'rgba(255,252,240,0.88)',
    cardBgHover:   'rgba(255,250,230,0.95)',
    pageBg:        '#F5F0E8',
    border:        'rgba(200,180,120,0.5)',
    borderHover:   'rgba(200,160,60,0.7)',
    accent:        '#C8860A',
    accentLight:   '#E8A020',
    navBg:         'rgba(245,240,220,0.97)',
  },
  nature: {
    btnGradient:   'linear-gradient(135deg,#1A7A40,#2ECC71)',
    btnShadow:     '0 0 24px rgba(46,204,113,0.4)',
    textPrimary:   '#C8F0D8',
    textSecondary: '#7ADFA0',
    textMuted:     '#4A9060',
    textDim:       '#2A5038',
    cardBg:        'rgba(10,28,14,0.85)',
    cardBgHover:   'rgba(12,34,16,0.92)',
    pageBg:        '#0A1A0E',
    border:        'rgba(40,100,55,0.5)',
    borderHover:   'rgba(60,140,80,0.7)',
    accent:        '#1A7A40',
    accentLight:   '#2ECC71',
    navBg:         'rgba(8,20,10,0.97)',
  },
};

export function useThemeStyles(): ThemeStyles {
  const { theme } = useTheme();
  return STYLES[theme];
}

export { STYLES as THEME_STYLES };