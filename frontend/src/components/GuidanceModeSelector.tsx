import React from 'react';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTranslation } from 'react-i18next';
// Legacy multi-mode selector — kept for reference, not currently rendered
type LegacyGuidanceMode = 'visual' | 'sound' | 'vibration' | 'voice';

const MODES: {
  key: LegacyGuidanceMode;
  icon: string;
  labelKey: string;
  supported: () => boolean;
}[] = [
  {
    key: 'visual',
    icon: '👁',
    labelKey: 'breathing.guidance.visual',
    supported: () => true,
  },
  {
    key: 'sound',
    icon: '🔔',
    labelKey: 'breathing.guidance.sound',
    supported: () => 'AudioContext' in window || 'webkitAudioContext' in (window as any),
  },
  {
    key: 'vibration',
    icon: '📳',
    labelKey: 'breathing.guidance.vibration',
    supported: () => 'vibrate' in navigator,
  },
  {
    key: 'voice',
    icon: '🎙',
    labelKey: 'breathing.guidance.voice',
    supported: () => 'speechSynthesis' in window,
  },
];

interface Props {
  selected: LegacyGuidanceMode[];
  onChange: (modes: LegacyGuidanceMode[]) => void;
}

export default function GuidanceModeSelector({ selected, onChange }: Props) {
  const ts = useThemeStyles();
  const { t } = useTranslation();

  const toggle = (mode: LegacyGuidanceMode) => {
    if (mode === 'visual' && selected.length === 1 && selected[0] === 'visual') return;
    onChange(
      selected.includes(mode)
        ? selected.filter(m => m !== mode)
        : [...selected, mode]
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: ts.textMuted }}>
        {t('breathing.guidance.title', 'Guidance mode')}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {MODES.map(mode => {
          const active = selected.includes(mode.key);
          const supported = mode.supported();

          return (
            <button
              key={mode.key}
              type="button"
              onClick={() => supported && toggle(mode.key)}
              disabled={!supported}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor: active ? ts.borderHover : ts.border,
                backgroundColor: active ? ts.cardBgHover : ts.cardBg,
                boxShadow: active ? `0 0 12px ${ts.accent}20` : 'none',
              }}
              title={!supported ? 'Not supported in this browser' : undefined}
            >
              <span className={`text-lg transition-all ${active ? '' : 'opacity-50'}`}>
                {mode.icon}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide"
                style={{ color: active ? ts.textSecondary : ts.textMuted }}>
                {t(mode.labelKey)}
              </span>
              {!supported && (
                <span className="text-[8px]" style={{ color: ts.textDim }}>
                  {t('breathing.guidance.unsupported', 'unavailable')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected.includes('vibration') && (
        <p className="text-[10px]" style={{ color: ts.textDim }}>
          📳 {t('breathing.guidance.vibrationHint', 'Vibration requires Android + Chrome')}
        </p>
      )}
      {selected.includes('voice') && (
        <p className="text-[10px]" style={{ color: ts.textDim }}>
          🎙 {t('breathing.guidance.voiceHint', "Uses your browser's built-in speech")}
        </p>
      )}
      {(selected.includes('sound') || selected.includes('voice') || selected.includes('vibration')) && (
        <p className="text-[10px]" style={{ color: ts.textDim }}>
          💡 {t('breathing.guidance.eyesClosedHint', 'You can now close your eyes — the app will guide you')}
        </p>
      )}
    </div>
  );
}
