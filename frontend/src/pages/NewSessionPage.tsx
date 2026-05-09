// src/pages/NewSessionPage.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMlDefaults } from '../utils/mlDefaults';
import { useTranslation } from 'react-i18next';
import NavBar from "../components/NavBar";
import api from "../api";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import Footer from "../components/Footer";
import { useThemeStyles } from '../hooks/useThemeStyles';
import ThemeBackground from '../components/ThemeBackground';
import Icon from '../components/Icon';
import { Moon, Target, Wind } from 'lucide-react';
import PageSEO from '../components/PageSEO';

// ── ML recommendation types ───────────────────────────────────────────────────
interface MLRec {
  recommendedTechnique: 'breathing' | 'sleep' | 'focus' | 'relaxation';
  confidence: number;
  probabilities: Record<string, number>;
}

const TECHNIQUE_META: Record<string, { icon: React.ReactNode; label: string; desc: string; color: string; glow: string; link: string }> = {
  breathing:   { icon: '1.blow', label: 'Breathing Exercise', desc: 'Rhythmic breath control to calm your nervous system', color: '#4A9EFF', glow: 'rgba(74,158,255,0.25)', link: '/breathing' },
  sleep:       { icon: <Moon size={22} color="#7AC4FF" />, label: 'Sleep Meditation',   desc: 'Gentle body scan to ease into deep, restful sleep',   color: '#7AC4FF', glow: 'rgba(122,196,255,0.25)', link: '/sleep' },
  focus:       { icon: <Target size={22} color="#4AE8A0" />, label: 'Focus Session',      desc: 'Sharpen attention and enter a clear mental state',     color: '#4AE8A0', glow: 'rgba(74,232,160,0.25)', link: '/breathing' },
  relaxation:  { icon: <Wind size={22} color="#C084FC" />, label: 'Deep Relaxation',    desc: 'Progressive release of tension from head to toe',     color: '#C084FC', glow: 'rgba(192,132,252,0.25)', link: '/breathing' },
};

// ── AI recommendation card ────────────────────────────────────────────────────
function MLRecommendationCard({ rec, loading }: { rec: MLRec | null; loading: boolean }) {
  const ts = useThemeStyles();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const meta = rec ? (TECHNIQUE_META[rec.recommendedTechnique] ?? TECHNIQUE_META.breathing) : null;
  const pct  = rec ? Math.round(rec.confidence * 100) : 0;

  return (
    <div
      style={{
        position:     'relative',
        borderRadius: 20,
        padding:      '20px 24px',
        background:   `linear-gradient(135deg, ${ts.cardBg}, ${ts.cardBgHover})`,
        border:       `1px solid ${meta ? meta.color + '44' : ts.border}`,
        boxShadow:    meta ? `0 0 32px ${meta.glow}, inset 0 1px 0 rgba(255,255,255,0.06)` : 'none',
        overflow:     'hidden',
        transition:   'all 0.4s ease',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Ambient glow blob */}
      {meta && (
        <div style={{
          position:     'absolute',
          top: -40, right: -40,
          width:        140,
          height:       140,
          borderRadius: '50%',
          background:   meta.glow,
          filter:       'blur(40px)',
          pointerEvents:'none',
        }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{
          display:      'flex',
          alignItems:   'center',
          gap:          5,
          fontSize:     10,
          fontWeight:   700,
          letterSpacing:'0.12em',
          textTransform:'uppercase',
          color:        meta?.color ?? ts.textMuted,
          background:   meta ? `${meta.color}18` : ts.cardBgHover,
          border:       `1px solid ${meta ? meta.color + '30' : ts.border}`,
          borderRadius: 20,
          padding:      '3px 10px',
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: meta?.color ?? ts.textMuted,
            boxShadow:  meta ? `0 0 6px ${meta.color}` : 'none',
            animation:  loading ? 'none' : 'pulse 2s infinite',
          }} />
          {t('newSession.aiRec')}
        </span>

        {loading && (
          <span style={{ fontSize: 11, color: ts.textMuted, marginLeft: 'auto' }}>
            {t('common.loading')}
          </span>
        )}
      </div>

      {/* Skeleton while loading */}
      {loading && !rec && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[80, 55, 100].map((w, i) => (
            <div key={i} style={{
              height: i === 0 ? 28 : 14,
              width:  `${w}%`,
              borderRadius: 8,
              background: `linear-gradient(90deg, ${ts.cardBgHover} 25%, ${ts.border} 50%, ${ts.cardBgHover} 75%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s infinite',
            }} />
          ))}
        </div>
      )}

      {/* Content */}
      {rec && meta && (
        <>
          {/* Technique row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26,
              background: `${meta.color}18`,
              border: `1px solid ${meta.color}30`,
              boxShadow: `0 0 18px ${meta.glow}`,
            }}>
              {typeof meta.icon === 'string' ? <Icon name={meta.icon} size={26} /> : meta.icon}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: ts.textPrimary, lineHeight: 1.2 }}>
                {meta.label}
              </div>
              <div style={{ fontSize: 12, color: ts.textMuted, marginTop: 3 }}>
                {meta.desc}
              </div>
            </div>
          </div>

          {/* Confidence bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: ts.textMuted }}>{t('newSession.confidence')}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: meta.color }}>{pct}%</span>
            </div>
            <div style={{
              height: 5, borderRadius: 99,
              background: ts.cardBgHover,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width:  `${pct}%`,
                borderRadius: 99,
                background: `linear-gradient(90deg, ${meta.color}88, ${meta.color})`,
                boxShadow: `0 0 8px ${meta.glow}`,
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
          </div>

          {/* Alternative techniques */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {Object.entries(rec.probabilities)
              .filter(([k]) => k !== rec.recommendedTechnique)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 2)
              .map(([tech, prob]) => {
                const m = TECHNIQUE_META[tech];
                if (!m) return null;
                return (
                  <span key={tech} style={{
                    fontSize: 10, color: ts.textMuted,
                    background: ts.cardBgHover,
                    border: `1px solid ${ts.border}`,
                    borderRadius: 20, padding: '2px 9px',
                  }}>
                    {m.icon} {m.label} · {Math.round(prob * 100)}%
                  </span>
                );
              })}
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => navigate(meta.link)}
            style={{
              width: '100%',
              padding: '10px 0',
              borderRadius: 12,
              border: 'none',
              background: `linear-gradient(135deg, ${meta.color}33, ${meta.color}55)`,
              color: meta.color,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'all 0.2s',
              boxShadow: `0 0 20px ${meta.glow}`,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = `linear-gradient(135deg, ${meta.color}55, ${meta.color}77)`)}
            onMouseLeave={e => (e.currentTarget.style.background = `linear-gradient(135deg, ${meta.color}33, ${meta.color}55)`)}
          >
            {t('challenges.start')} {meta.label} →
          </button>
        </>
      )}

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}

export default function NewSessionPage() {
  const navigate = useNavigate();
  const ts = useThemeStyles();
  const { t } = useTranslation();
  const token = localStorage.getItem('token');

  // Seed form with user's goal-based ML defaults (stress level + time of day)
  const mlDef = useMemo(() => getMlDefaults(), []);

  const [formData, setFormData] = useState({
    sessionDate:      new Date().toISOString().split('T')[0],
    moodBefore:       5,
    moodAfter:        5,
    focusLevel:       5,
    stressLevel:      mlDef.stressLevel,   // ← from goal (e.g. 8 for stress, 3 for focus)
    breathingDepth:   5,
    calmnessScore:    5,
    distractionCount: 0,
    timeOfDay:        mlDef.timeOfDay,     // ← auto-detected from current hour
    noiseLevel:       'Quiet',
    sessionLength:    10,
    cycles:           5,
    notes:            mlDef.text,          // ← goal hint text seeds the ML text field
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ML recommendation state
  const [mlRec, setMlRec]         = useState<MLRec | null>(null);
  const [mlLoading, setMlLoading] = useState(true);
  const debounceRef               = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
  }, [token, navigate]);

  // Fetch ML recommendation — debounced, triggers on stress/timeOfDay/notes change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setMlLoading(true);
        const timeMap: Record<string, string> = {
          Morning: 'morning', Afternoon: 'afternoon', Evening: 'evening', Night: 'night',
        };
        const params = new URLSearchParams({
          text:        formData.notes || `stress level ${formData.stressLevel}`,
          stressLevel: String(formData.stressLevel),
          timeOfDay:   timeMap[formData.timeOfDay] ?? 'evening',
        });
        const { data } = await api.get<MLRec>(`/sessions/recommendation?${params}`);
        setMlRec(data);
      } catch {
        // silently fail — card just stays hidden
      } finally {
        setMlLoading(false);
      }
    }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [formData.stressLevel, formData.timeOfDay, formData.notes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/sessions', formData);
      toast.success('Session saved');
      navigate('/sessions');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen font-montserrat overflow-x-hidden">
      <PageSEO
        title="Log Session | Breathe"
        description="Record a new breathing or meditation session. Log duration, mood, focus level, and notes to track your progress."
        canonical="/sessions/new"
        noIndex
      />
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <div className="flex-1 px-4 sm:px-6 lg:px-[157px] py-12">
          <h1 className="text-3xl sm:text-4xl font-light mb-8" style={{ color: ts.textPrimary }}>
            {t('newSession.title')}
          </h1>

          <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
            {/* Date */}
            <div>
              <Label className="t-body font-medium mb-2 block" style={{ color: ts.textSecondary }}>
                {t('newSession.date')}
              </Label>
              <Input
                type="date"
                value={formData.sessionDate}
                onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                className="rounded-xl px-4 py-3 t-body outline-none focus:border-[#2A5499] transition-colors"
                style={{
                  backgroundColor: ts.cardBg,
                  border: `1px solid ${ts.border}`,
                  color: ts.textSecondary,
                }}
              />
            </div>

            {/* Time of Day */}
            <div>
              <Label className="t-body font-medium mb-2 block" style={{ color: ts.textSecondary }}>
                {t('newSession.timeOfDay')}
              </Label>
              <Select value={formData.timeOfDay} onValueChange={(value: string) => setFormData({ ...formData, timeOfDay: value })}>
                <SelectTrigger className="rounded-xl px-4 py-3 t-body outline-none focus:border-[#2A5499] transition-colors"
                  style={{
                    backgroundColor: ts.cardBg,
                    border: `1px solid ${ts.border}`,
                    color: ts.textSecondary,
                  }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning">{t('newSession.morning')}</SelectItem>
                  <SelectItem value="Afternoon">{t('newSession.afternoon')}</SelectItem>
                  <SelectItem value="Evening">{t('newSession.evening')}</SelectItem>
                  <SelectItem value="Night">{t('newSession.night')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Session Length */}
            <div>
              <Label className="t-body font-medium mb-2 block" style={{ color: ts.textSecondary }}>
                {t('newSession.length')}: {formData.sessionLength} {t('newSession.minutes')}
              </Label>
              <Slider
                value={[formData.sessionLength]}
                onValueChange={([value]: number[]) => setFormData({ ...formData, sessionLength: value })}
                min={5}
                max={60}
                step={5}
                className="w-full"
              />
            </div>

            {/* Cycles */}
            <div>
              <Label className="t-body font-medium mb-2 block" style={{ color: ts.textSecondary }}>
                {t('newSession.cyclesCount')}: {formData.cycles}
              </Label>
              <Slider
                value={[formData.cycles]}
                onValueChange={([value]: number[]) => setFormData({ ...formData, cycles: value })}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
            </div>

            {/* Mood Before */}
            <div>
              <Label className="t-body font-medium mb-2 block" style={{ color: ts.textSecondary }}>
                {t('newSession.moodBefore')}: {formData.moodBefore}/10
              </Label>
              <Slider
                value={[formData.moodBefore]}
                onValueChange={([value]: number[]) => setFormData({ ...formData, moodBefore: value })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Mood After */}
            <div>
              <Label className="t-body font-medium mb-2 block" style={{ color: ts.textSecondary }}>
                {t('newSession.moodAfter')}: {formData.moodAfter}/10
              </Label>
              <Slider
                value={[formData.moodAfter]}
                onValueChange={([value]: number[]) => setFormData({ ...formData, moodAfter: value })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Focus Level */}
            <div>
              <Label className="t-body font-medium mb-2 block" style={{ color: ts.textSecondary }}>
                {t('newSession.focusLevel')}: {formData.focusLevel}/10
              </Label>
              <Slider
                value={[formData.focusLevel]}
                onValueChange={([value]: number[]) => setFormData({ ...formData, focusLevel: value })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Stress Level */}
            <div>
              <Label className="t-body font-medium mb-2 block" style={{ color: ts.textSecondary }}>
                {t('newSession.stressLevel')}: {formData.stressLevel}/10
              </Label>
              <Slider
                value={[formData.stressLevel]}
                onValueChange={([value]: number[]) => setFormData({ ...formData, stressLevel: value })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Breathing Depth */}
            <div>
              <Label className="t-body font-medium mb-2 block" style={{ color: ts.textSecondary }}>
                {t('newSession.breathDepth')}: {formData.breathingDepth}/10
              </Label>
              <Slider
                value={[formData.breathingDepth]}
                onValueChange={([value]: number[]) => setFormData({ ...formData, breathingDepth: value })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Calmness Score */}
            <div>
              <Label className="t-body font-medium mb-2 block" style={{ color: ts.textSecondary }}>
                {t('newSession.calmness')}: {formData.calmnessScore}/10
              </Label>
              <Slider
                value={[formData.calmnessScore]}
                onValueChange={([value]: number[]) => setFormData({ ...formData, calmnessScore: value })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Distraction Count */}
            <div>
              <Label className="t-body font-medium mb-2 block" style={{ color: ts.textSecondary }}>
                {t('newSession.distractions')}: {formData.distractionCount}
              </Label>
              <Slider
                value={[formData.distractionCount]}
                onValueChange={([value]: number[]) => setFormData({ ...formData, distractionCount: value })}
                min={0}
                max={20}
                step={1}
                className="w-full"
              />
            </div>

            {/* Noise Level */}
            <div>
              <Label className="t-body font-medium mb-2 block" style={{ color: ts.textSecondary }}>
                {t('newSession.noiseLevel')}
              </Label>
              <Select value={formData.noiseLevel} onValueChange={(value: string) => setFormData({ ...formData, noiseLevel: value })}>
                <SelectTrigger className="rounded-xl px-4 py-3 t-body outline-none focus:border-[#2A5499] transition-colors"
                  style={{
                    backgroundColor: ts.cardBg,
                    border: `1px solid ${ts.border}`,
                    color: ts.textSecondary,
                  }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Silent">{t('sessions.noise.silent')}</SelectItem>
                  <SelectItem value="Quiet">{t('sessions.noise.quiet')}</SelectItem>
                  <SelectItem value="Moderate">{t('sessions.noise.moderate')}</SelectItem>
                  <SelectItem value="Noisy">{t('sessions.noise.noisy')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label className="t-body font-medium mb-2 block" style={{ color: ts.textSecondary }}>
                {t('newSession.notes')}
              </Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('newSession.notesPlaceholder')}
                className="rounded-xl px-4 py-3 t-body min-h-[120px] outline-none focus:border-[#2A5499] transition-colors resize-none"
                style={{
                  backgroundColor: ts.cardBg,
                  border: `1px solid ${ts.border}`,
                  color: ts.textSecondary,
                }}
              />
            </div>

            {/* ML Recommendation */}
            <MLRecommendationCard rec={mlRec} loading={mlLoading} />

            {error && <p className="text-red-500 t-body">{error}</p>}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-full text-white font-medium transition-all hover:shadow-[0_0_20px_rgba(58,130,247,0.4)] disabled:opacity-50"
                style={{ background: ts.btnGradient }}
              >
                {t('newSession.save')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/sessions')}
                className="px-5 py-2.5 rounded-full border font-medium transition-all hover:bg-[#3A82F7] hover:text-white"
                style={{
                  borderColor: ts.accent,
                  color: ts.accent,
                }}
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>

        <Footer />
      </div>
    </div>
  );
}