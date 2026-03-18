// src/hooks/useHeartRate.ts
import { useCallback, useEffect, useRef, useState } from 'react';

export type HRStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'unsupported' | 'error';

export interface HeartRateData {
  bpm:       number;
  timestamp: number;
  contactDetected: boolean | null;
}

interface UseHeartRateReturn {
  status:    HRStatus;
  current:   HeartRateData | null;
  history:   HeartRateData[];   // last 60 readings
  avg:       number | null;
  min:       number | null;
  max:       number | null;
  zone:      'rest' | 'light' | 'moderate' | 'hard' | 'max' | null;
  connect:   () => Promise<void>;
  disconnect:() => void;
  supported: boolean;
  error:     string | null;
}

// Heart rate zones (based on typical adult ranges)
function getZone(bpm: number): 'rest' | 'light' | 'moderate' | 'hard' | 'max' {
  if (bpm < 60)  return 'rest';
  if (bpm < 100) return 'light';
  if (bpm < 140) return 'moderate';
  if (bpm < 170) return 'hard';
  return 'max';
}

const HEART_RATE_SERVICE     = 0x180D;
const HEART_RATE_MEASUREMENT = 0x2A37;
const MAX_HISTORY            = 60;

export function useHeartRate(): UseHeartRateReturn {
  const [status,  setStatus]  = useState<HRStatus>('idle');
  const [current, setCurrent] = useState<HeartRateData | null>(null);
  const [history, setHistory] = useState<HeartRateData[]>([]);
  const [error,   setError]   = useState<string | null>(null);

  const deviceRef     = useRef<any>(null);
  const serverRef     = useRef<any>(null);
  const charRef       = useRef<any>(null);

  const supported = typeof navigator !== 'undefined' && 'bluetooth' in navigator;

  // Parse Heart Rate Measurement characteristic (0x2A37)
  const parseHR = useCallback((value: any): HeartRateData => {
    const flags = value.getUint8(0);
    const is16bit = flags & 0x1;
    const contactSupported = (flags >> 1) & 0x3;
    const contactDetected  = contactSupported > 1 ? !!(flags & 0x2) : null;
    const bpm = is16bit ? value.getUint16(1, true) : value.getUint8(1);
    return { bpm, timestamp: Date.now(), contactDetected };
  }, []);

  const onHRChange = useCallback((event: any) => {
    const target = event.target as any;
    if (!target.value) return;
    const data = parseHR(target.value);
    setCurrent(data);
    setHistory(prev => [...prev.slice(-(MAX_HISTORY - 1)), data]);
  }, [parseHR]);

  const connect = useCallback(async () => {
    if (!supported) { setStatus('unsupported'); return; }
    setError(null);
    setStatus('connecting');

    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: [HEART_RATE_SERVICE] }],
        optionalServices: [HEART_RATE_SERVICE],
      });

      deviceRef.current = device;

      device.addEventListener('gattserverdisconnected', () => {
        setStatus('disconnected');
        setCurrent(null);
      });

      const server = await device.gatt!.connect();
      serverRef.current = server;

      const service = await server.getPrimaryService(HEART_RATE_SERVICE);
      const char    = await service.getCharacteristic(HEART_RATE_MEASUREMENT);
      charRef.current = char;

      await char.startNotifications();
      char.addEventListener('characteristicvaluechanged', onHRChange);

      setStatus('connected');
    } catch (err: any) {
      if (err?.name === 'NotFoundError' || err?.message?.includes('cancelled')) {
        // User cancelled the picker
        setStatus('idle');
      } else {
        setError(err?.message ?? 'Failed to connect');
        setStatus('error');
      }
    }
  }, [supported, onHRChange]);

  const disconnect = useCallback(() => {
    try {
      charRef.current?.removeEventListener('characteristicvaluechanged', onHRChange);
      charRef.current?.stopNotifications().catch(() => {});
      serverRef.current?.disconnect();
    } catch {}
    deviceRef.current = null;
    serverRef.current = null;
    charRef.current   = null;
    setStatus('idle');
    setCurrent(null);
  }, [onHRChange]);

  // Cleanup on unmount
  useEffect(() => () => { disconnect(); }, [disconnect]);

  const bpms  = history.map(h => h.bpm);
  const avg   = bpms.length ? Math.round(bpms.reduce((a,b)=>a+b,0)/bpms.length) : null;
  const min   = bpms.length ? Math.min(...bpms) : null;
  const max   = bpms.length ? Math.max(...bpms) : null;
  const zone  = current ? getZone(current.bpm) : null;

  return { status, current, history, avg, min, max, zone, connect, disconnect, supported, error };
}