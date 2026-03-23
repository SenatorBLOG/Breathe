// src/components/AppleHealthImport.tsx
import React, { useCallback, useRef, useState } from 'react';
import api from '../api';
import { toast } from 'sonner';
import { Upload, ChevronRight, CheckCircle, X } from 'lucide-react';
import { useThemeStyles } from "../hooks/useThemeStyles";

interface HealthSummary {
  sleepDays: number;
  avgSleep: number; // minutes
  avgHRV: number | null;
  avgHeartRate: number | null;
  lastSyncDate: string;
}

// ─── Вспомогательные функции (остаются без изменений) ─────────────────────────
async function parseAppleHealthExport(file: File): Promise<{
  sleep: { date: string; duration: number }[];
  hrv: { date: string; rmssd: number }[];
  heartRate: { date: string; restingRate: number }[];
}> {
  const text = await readFileAsText(file);
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const records = Array.from(doc.querySelectorAll('Record'));

  const sleepMap: Record<string, number> = {};
  const hrvMap: Record<string, number[]> = {};
  const hrMap: Record<string, number[]> = {};

  records.forEach(r => {
    const type = r.getAttribute('type') ?? '';
    const start = r.getAttribute('startDate') ?? '';
    const end = r.getAttribute('endDate') ?? '';
    const value = parseFloat(r.getAttribute('value') ?? '0');
    const date = start.slice(0, 10);

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

  const slice30 = (data: any[]) => data.sort((a, b) => a.date.localeCompare(b.date)).slice(-30);

  return {
    sleep: slice30(Object.entries(sleepMap).map(([date, duration]) => ({ date, duration }))),
    hrv: slice30(Object.entries(hrvMap).map(([date, vals]) => ({ date, rmssd: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) }))),
    heartRate: slice30(Object.entries(hrMap).map(([date, vals]) => ({ date, restingRate: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) }))),
  };
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  onImported?: (summary: HealthSummary) => void;
}

export default function AppleHealthImport({ onImported }: Props) {
  const ts = useThemeStyles();
  const [step, setStep] = useState<'idle' | 'parsing' | 'done' | 'error'>('idle');
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xml')) {
      setError('Please upload export.xml from Apple Health');
      setStep('error');
      return;
    }

    setStep('parsing');
    setError('');

    try {
      const { sleep, hrv, heartRate } = await parseAppleHealthExport(file);

      if (!sleep.length && !hrv.length) {
        setError('No health data found in XML.');
        setStep('error');
        return;
      }

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
      toast.success(`Import complete: ${sleep.length} days processed`);
    } catch (err: any) {
      setError(err.message ?? 'Failed to parse file');
      setStep('error');
    }
  }, [onImported]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border transition-all duration-500"
      style={{
        background: `linear-gradient(145deg, ${ts.cardBg}, ${ts.cardBgHover})`,
        borderColor: step === 'done' ? `${ts.accent}40` : ts.border,
        boxShadow: step === 'done' ? `0 0 25px ${ts.accent}15` : 'none',
      }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ 
              background: step === 'done' ? `${ts.accent}15` : 'rgba(255,100,100,0.1)', 
              border: `1px solid ${step === 'done' ? ts.accent : 'rgba(255,100,100,0.2)'}` 
            }}>
            🍎
          </div>
          <div>
            <p style={{ color: ts.textPrimary }} className="text-sm font-semibold">Apple Health</p>
            <p className="text-[10px] mt-0.5" style={{ color: step === 'done' ? ts.accent : ts.textSecondary }}>
              {step === 'done' ? `Synced · ${summary?.sleepDays} days` : 'Import via export.xml'}
            </p>
          </div>
        </div>
        {step === 'done' && (
          <button onClick={() => { setStep('idle'); setSummary(null); }}
            style={{ color: ts.textSecondary }} className="p-1.5 hover:opacity-70 transition-opacity">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Success View */}
      {step === 'done' && summary && (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: `${Math.floor(summary.avgSleep/60)}h ${summary.avgSleep%60}m`, label: 'Sleep', color: ts.accent },
              { val: `${summary.avgHRV}ms`, label: 'HRV', color: ts.accentLight, hide: !summary.avgHRV },
              { val: summary.avgHeartRate, label: 'Heart rate', color: ts.accent, hide: !summary.avgHeartRate }
            ].map((item, i) => !item.hide && (
              <div key={i} className="flex flex-col gap-0.5 p-3 rounded-xl border"
                style={{ background: `${ts.cardBg}80`, borderColor: ts.border }}>
                <p style={{ color: item.color }} className="text-sm font-bold tabular-nums">{item.val}</p>
                <p style={{ color: ts.textSecondary }} className="text-[9px] uppercase tracking-wider">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
            style={{ background: `${ts.accent}10`, borderColor: `${ts.accent}20` }}>
            <CheckCircle size={14} style={{ color: ts.accent }} className="flex-shrink-0" />
            <p style={{ color: ts.accent }} className="text-[11px] font-medium">
              Data imported. Your AI coach has updated your recommendations.
            </p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {(step === 'idle' || step === 'parsing') && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center gap-3 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all"
          style={{
            borderColor: dragOver ? ts.accent : ts.border,
            background: dragOver ? `${ts.accent}08` : 'transparent',
          }}>
          {step === 'parsing' ? (
            <>
              <div className="w-6 h-6 border-2 rounded-full animate-spin" 
                style={{ borderColor: `${ts.accent}30`, borderTopColor: ts.accent }} />
              <p style={{ color: ts.textSecondary }} className="text-xs">Processing file…</p>
            </>
          ) : (
            <>
              <Upload size={20} style={{ color: ts.textSecondary }} />
              <div className="text-center">
                <p style={{ color: ts.textPrimary }} className="text-xs font-medium">Drop export.xml here</p>
                <p style={{ color: ts.textSecondary }} className="text-[10px] mt-1">or click to browse</p>
              </div>
            </>
          )}
          <input ref={inputRef} type="file" accept=".xml" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }} className="hidden" />
        </div>
      )}

      {/* Error state */}
      {step === 'error' && (
        <div className="p-3 rounded-xl border" style={{ background: 'rgba(255,100,100,0.05)', borderColor: 'rgba(255,100,100,0.2)' }}>
          <p className="text-[#FF8A8A] text-xs leading-relaxed">{error}</p>
          <button onClick={() => { setStep('idle'); setError(''); }}
            className="mt-2 text-[10px] font-medium uppercase tracking-wider hover:opacity-80"
            style={{ color: ts.accent }}>
            Try again
          </button>
        </div>
      )}

      {/* Instructions */}
      {step === 'idle' && (
        <details className="group">
          <summary className="text-[10px] cursor-pointer list-none flex items-center gap-1"
            style={{ color: ts.textSecondary }}>
            <ChevronRight size={10} className="group-open:rotate-90 transition-transform" />
            How to export from Apple Health?
          </summary>
          <div className="mt-3 flex flex-col gap-2 pl-2">
            {[
              'Open the Health app on your iPhone',
              'Tap your profile icon (top right)',
              'Scroll down to "Export All Health Data"',
              'After export, find export.xml inside the archive',
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span style={{ color: ts.accent }} className="text-[9px] font-mono mt-0.5">{i+1}.</span>
                <p style={{ color: ts.textSecondary }} className="text-[10px] leading-snug">{s}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}