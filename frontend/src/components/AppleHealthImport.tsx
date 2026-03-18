// src/components/AppleHealthImport.tsx
import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { toast } from 'sonner';
import { Upload, Apple, ChevronRight, CheckCircle, X } from 'lucide-react';

interface HealthSummary {
  sleepDays:    number;
  avgSleep:     number; // minutes
  avgHRV:       number | null;
  avgHeartRate: number | null;
  lastSyncDate: string;
}

// ─── Parse Apple Health XML ───────────────────────────────────────────────────
async function parseAppleHealthExport(file: File): Promise<{
  sleep: { date: string; duration: number }[];
  hrv:   { date: string; rmssd: number }[];
  heartRate: { date: string; restingRate: number }[];
}> {
  // Apple exports export.zip — we handle both .zip and .xml directly
  const text = await readFileAsText(file);
  const parser = new DOMParser();
  const doc    = parser.parseFromString(text, 'application/xml');
  const records = Array.from(doc.querySelectorAll('Record'));

  const sleepMap: Record<string, number>  = {};
  const hrvMap:   Record<string, number[]> = {};
  const hrMap:    Record<string, number[]> = {};

  records.forEach(r => {
    const type  = r.getAttribute('type') ?? '';
    const start = r.getAttribute('startDate') ?? '';
    const end   = r.getAttribute('endDate')   ?? '';
    const value = parseFloat(r.getAttribute('value') ?? '0');
    const date  = start.slice(0, 10); // YYYY-MM-DD

    // Sleep
    if (type === 'HKCategoryTypeIdentifierSleepAnalysis') {
      const startMs = new Date(start).getTime();
      const endMs   = new Date(end).getTime();
      const mins    = Math.round((endMs - startMs) / 60000);
      if (mins > 0 && mins < 720) { // 0–12 hours
        sleepMap[date] = (sleepMap[date] ?? 0) + mins;
      }
    }

    // HRV
    if (type === 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN') {
      if (!hrvMap[date]) hrvMap[date] = [];
      hrvMap[date].push(value);
    }

    // Resting heart rate
    if (type === 'HKQuantityTypeIdentifierRestingHeartRate') {
      if (!hrMap[date]) hrMap[date] = [];
      hrMap[date].push(value);
    }
  });

  const sleep = Object.entries(sleepMap)
    .map(([date, duration]) => ({ date, duration }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  const hrv = Object.entries(hrvMap)
    .map(([date, vals]) => ({ date, rmssd: Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  const heartRate = Object.entries(hrMap)
    .map(([date, vals]) => ({ date, restingRate: Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  return { sleep, hrv, heartRate };
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  onImported?: (summary: HealthSummary) => void;
}

export default function AppleHealthImport({ onImported }: Props) {
  const [step,     setStep]    = useState<'idle' | 'parsing' | 'done' | 'error'>('idle');
  const [summary,  setSummary] = useState<HealthSummary | null>(null);
  const [error,    setError]   = useState('');
  const [dragOver, setDragOver]= useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xml') && !file.name.endsWith('.zip')) {
      setError('Please upload export.xml or export.zip from Apple Health');
      setStep('error');
      return;
    }

    setStep('parsing');
    setError('');

    try {
      // For .zip we'd need JSZip — for now support .xml directly
      if (file.name.endsWith('.zip')) {
        setError('Please export as XML: Health app → export → then find export.xml inside the zip and upload that file.');
        setStep('error');
        return;
      }

      const { sleep, hrv, heartRate } = await parseAppleHealthExport(file);

      if (!sleep.length && !hrv.length) {
        setError('No health data found. Make sure you uploaded export.xml from Apple Health.');
        setStep('error');
        return;
      }

      // Save to backend
      await api.post('/integrations/apple-health', { sleep, hrv, heartRate });

      const avgSleep = sleep.length
        ? Math.round(sleep.reduce((s,d)=>s+d.duration,0) / sleep.length)
        : 0;
      const avgHRV = hrv.length
        ? Math.round(hrv.reduce((s,d)=>s+d.rmssd,0) / hrv.length)
        : null;
      const avgHR = heartRate.length
        ? Math.round(heartRate.reduce((s,d)=>s+d.restingRate,0) / heartRate.length)
        : null;

      const sum: HealthSummary = {
        sleepDays:    sleep.length,
        avgSleep,
        avgHRV,
        avgHeartRate: avgHR,
        lastSyncDate: sleep[sleep.length-1]?.date ?? new Date().toISOString().slice(0,10),
      };
      setSummary(sum);
      setStep('done');
      onImported?.(sum);
      toast.success(`Apple Health imported — ${sleep.length} days of data`);

    } catch (err: any) {
      console.error('Apple Health parse error:', err);
      setError(err?.response?.data?.error ?? err.message ?? 'Failed to parse file');
      setStep('error');
    }
  }, [onImported]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border transition-all"
      style={{
        background: 'linear-gradient(145deg,rgba(11,22,40,0.85),rgba(6,12,26,0.9))',
        border: step === 'done' ? '1px solid rgba(255,138,138,0.35)' : '1px solid rgba(30,51,88,0.5)',
        boxShadow: step === 'done' ? '0 0 20px rgba(255,100,100,0.06)' : 'none',
      }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)' }}>
            🍎
          </div>
          <div>
            <p className="text-[#B8D9FF] text-sm font-medium">Apple Health</p>
            <p className="text-[9px] mt-0.5" style={{ color: step === 'done' ? '#FF8A8A' : '#3D6080' }}>
              {step === 'done' ? `Imported · ${summary?.sleepDays} days` : 'Import via export.xml'}
            </p>
          </div>
        </div>
        {step === 'done' && (
          <button onClick={() => { setStep('idle'); setSummary(null); }}
            className="p-1.5 text-[#4A7AAA] hover:text-[#FF8A8A] transition-colors">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Success state */}
      {step === 'done' && summary && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-0.5 p-2.5 rounded-xl bg-[#0B1628]/60 border border-[#1E3358]/40 text-center">
              <p className="text-[#FF8A8A] text-sm font-medium tabular-nums">
                {Math.floor(summary.avgSleep/60)}h{summary.avgSleep%60}m
              </p>
              <p className="text-[9px] text-[#4A7AAA] uppercase tracking-wide">Avg sleep</p>
            </div>
            {summary.avgHRV && (
              <div className="flex flex-col gap-0.5 p-2.5 rounded-xl bg-[#0B1628]/60 border border-[#1E3358]/40 text-center">
                <p className="text-[#4A9EFF] text-sm font-medium tabular-nums">{summary.avgHRV}ms</p>
                <p className="text-[9px] text-[#4A7AAA] uppercase tracking-wide">Avg HRV</p>
              </div>
            )}
            {summary.avgHeartRate && (
              <div className="flex flex-col gap-0.5 p-2.5 rounded-xl bg-[#0B1628]/60 border border-[#1E3358]/40 text-center">
                <p className="text-[#FF8A8A] text-sm font-medium tabular-nums">{summary.avgHeartRate}</p>
                <p className="text-[9px] text-[#4A7AAA] uppercase tracking-wide">Resting HR</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#4AE8A0]/10 border border-[#4AE8A0]/20">
            <CheckCircle size={12} className="text-[#4AE8A0] flex-shrink-0" />
            <p className="text-[#4AE8A0] text-xs">AI coach now uses your Apple Health data</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {step === 'error' && (
        <div className="flex flex-col gap-2">
          <p className="text-[#FF8A8A] text-xs leading-relaxed">{error}</p>
          <button onClick={() => { setStep('idle'); setError(''); }}
            className="text-[10px] text-[#4A9EFF] hover:underline self-start">
            Try again
          </button>
        </div>
      )}

      {/* Upload area */}
      {(step === 'idle' || step === 'parsing') && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all"
          style={{
            borderColor: dragOver ? '#4A9EFF' : 'rgba(30,51,88,0.5)',
            background:  dragOver ? 'rgba(74,158,255,0.05)' : 'transparent',
          }}>
          {step === 'parsing' ? (
            <>
              <div className="w-6 h-6 border-2 border-[#4A9EFF]/30 border-t-[#4A9EFF] rounded-full animate-spin" />
              <p className="text-[#4A7AAA] text-xs">Parsing your health data…</p>
            </>
          ) : (
            <>
              <Upload size={18} className="text-[#4A7AAA]" />
              <p className="text-[#B8D9FF] text-xs font-medium">Drop export.xml here</p>
              <p className="text-[#4A7AAA] text-[10px]">or tap to browse</p>
            </>
          )}
          <input ref={inputRef} type="file" accept=".xml,.zip" onChange={onFileChange} className="hidden" />
        </div>
      )}

      {/* How to export instructions */}
      {step === 'idle' && (
        <details className="group">
          <summary className="text-[10px] text-[#4A7AAA] cursor-pointer hover:text-[#4A9EFF] transition-colors list-none flex items-center gap-1">
            <ChevronRight size={10} className="group-open:rotate-90 transition-transform" />
            How to export from Apple Health
          </summary>
          <div className="mt-2 flex flex-col gap-1.5 pl-4">
            {[
              'Open Health app on your iPhone',
              'Tap your profile picture (top right)',
              'Scroll down → "Export All Health Data"',
              'Tap Export → share the zip file',
              'Open the zip → find export.xml',
              'Upload export.xml here',
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[#2A5499] text-[9px] font-mono flex-shrink-0 mt-0.5">{i+1}.</span>
                <p className="text-[#4A7AAA] text-[10px] leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}