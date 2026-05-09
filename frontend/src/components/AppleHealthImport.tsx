// src/components/AppleHealthImport.tsx
import React, { useCallback, useRef, useState } from 'react';
import api from '../api';
import { toast } from 'sonner';
import { RefreshCw, ChevronRight, Upload } from 'lucide-react';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTranslation } from 'react-i18next';

interface HealthSummary {
  sleepDays: number;
  avgSleep: number;
  avgHRV: number | null;
  avgHeartRate: number | null;
  lastSyncDate: string;
}

async function parseAppleHealthExport(file: File): Promise<{
  sleep: { date: string; duration: number }[];
  hrv: { date: string; rmssd: number }[];
  heartRate: { date: string; restingRate: number }[];
}> {
  const text = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target?.result as string);
    r.onerror = rej;
    r.readAsText(file);
  });
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const records = Array.from(doc.querySelectorAll('Record'));

  const sleepMap: Record<string, number> = {};
  const hrvMap: Record<string, number[]> = {};
  const hrMap: Record<string, number[]> = {};

  records.forEach(r => {
    const type  = r.getAttribute('type') ?? '';
    const start = r.getAttribute('startDate') ?? '';
    const end   = r.getAttribute('endDate') ?? '';
    const value = parseFloat(r.getAttribute('value') ?? '0');
    const date  = start.slice(0, 10);
    if (type === 'HKCategoryTypeIdentifierSleepAnalysis') {
      const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
      if (mins > 0 && mins < 720) sleepMap[date] = (sleepMap[date] ?? 0) + mins;
    }
    if (type === 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN') {
      if (!hrvMap[date]) hrvMap[date] = [];
      hrvMap[date].push(value);
    }
    if (type === 'HKQuantityTypeIdentifierRestingHeartRate') {
      if (!hrMap[date]) hrMap[date] = [];
      hrMap[date].push(value);
    }
  });

  const slice30 = (arr: any[]) => arr.sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

  return {
    sleep:     slice30(Object.entries(sleepMap).map(([date, duration]) => ({ date, duration }))),
    hrv:       slice30(Object.entries(hrvMap).map(([date, vals]) => ({ date, rmssd: avg(vals) }))),
    heartRate: slice30(Object.entries(hrMap).map(([date, vals]) => ({ date, restingRate: avg(vals) }))),
  };
}

interface Props { onImported?: (summary: HealthSummary) => void; }

export default function AppleHealthImport({ onImported }: Props) {
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const [step, setStep]       = useState<'idle' | 'parsing' | 'done' | 'error'>('idle');
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [error, setError]     = useState('');
  const [showHow, setShowHow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xml')) {
      toast.error(t('appleHealth.uploadError'));
      return;
    }
    setStep('parsing');
    try {
      const { sleep, hrv, heartRate } = await parseAppleHealthExport(file);
      if (!sleep.length && !hrv.length) throw new Error(t('appleHealth.noData'));
      await api.post('/integrations/apple-health', { sleep, hrv, heartRate });
      const sum: HealthSummary = {
        sleepDays: sleep.length,
        avgSleep: sleep.length ? Math.round(sleep.reduce((s, d) => s + d.duration, 0) / sleep.length) : 0,
        avgHRV: hrv.length ? Math.round(hrv.reduce((s, d) => s + d.rmssd, 0) / hrv.length) : null,
        avgHeartRate: heartRate.length ? Math.round(heartRate.reduce((s, d) => s + d.restingRate, 0) / heartRate.length) : null,
        lastSyncDate: sleep[sleep.length - 1]?.date ?? new Date().toISOString().slice(0, 10),
      };
      setSummary(sum);
      setStep('done');
      onImported?.(sum);
      toast.success(`${t('appleHealth.title')} ${t('appleHealth.imported', { days: sleep.length })}`);
    } catch (err: any) {
      setError(err.message ?? 'Failed to parse');
      setStep('error');
    }
  }, [onImported]);

  const fmtDur = (m: number) => `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}`;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl transition-all"
      style={{
        backgroundColor: ts.cardBg,
        border: `1px solid ${step === 'done' ? ts.accent + '30' : ts.border}`,
      }}>

      {/* Header row */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 t-body"
          style={{ background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.22)' }}>
          🍎
        </div>
        <div className="flex-1 min-w-0">
          <p className="t-body font-medium leading-tight" style={{ color: ts.textPrimary }}>{t('appleHealth.title')}</p>
          <p className="t-label mt-0.5" style={{ color: step === 'done' ? ts.accent : ts.textMuted }}>
            {step === 'done' && summary
              ? `${t('appleHealth.imported', { days: summary.sleepDays })} · ${summary.avgHRV ? t('appleHealth.importedWithHRV', { hrv: summary.avgHRV }) : t('appleHealth.importedWithSleep', { sleep: fmtDur(summary.avgSleep) })}`
              : t('appleHealth.subtitle')}
          </p>
        </div>

        {step === 'parsing' ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 t-label" style={{ color: ts.textMuted }}>
            <RefreshCw size={11} className="animate-spin" /> {t('appleHealth.processing')}
          </div>
        ) : step === 'done' ? (
          <button onClick={() => { setStep('idle'); setSummary(null); }}
            className="px-3 py-1.5 rounded-xl t-label border transition-all"
            style={{ color: ts.textMuted, borderColor: ts.border }}>
            {t('appleHealth.reimport')}
          </button>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl t-label font-medium flex-shrink-0 transition-all hover:scale-105"
            style={{ color: '#fff', background: ts.btnGradient }}
          >
            <Upload size={10} /> {t('appleHealth.import')}
          </button>
        )}
        <input ref={inputRef} type="file" accept=".xml" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ''; }} />
      </div>

      {/* Error */}
      {step === 'error' && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,138,138,0.08)', border: '1px solid rgba(255,138,138,0.2)' }}>
          <p className="t-caption" style={{ color: '#FF8A8A' }}>{error}</p>
          <button onClick={() => { setStep('idle'); setError(''); }} className="t-label hover:underline ml-3" style={{ color: ts.accent }}>
            {t('appleHealth.retry')}
          </button>
        </div>
      )}

      {/* How to export — collapsed by default */}
      {step === 'idle' && (
        <div>
          <button onClick={() => setShowHow(v => !v)}
            className="flex items-center gap-1 t-label hover:underline"
            style={{ color: ts.textDim }}>
            <ChevronRight size={9} style={{ transform: showHow ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            {t('appleHealth.howToExport')}
          </button>
          {showHow && (
            <div className="mt-2 flex flex-col gap-1 pl-3">
              {[t('appleHealth.step1'), t('appleHealth.step2'), t('appleHealth.step3')].map((s, i) => (
                <p key={i} className="t-label" style={{ color: ts.textMuted }}>{i + 1}. {s}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
