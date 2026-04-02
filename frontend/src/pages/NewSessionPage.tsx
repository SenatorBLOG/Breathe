// src/pages/NewSessionPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function NewSessionPage() {
  const navigate = useNavigate();
  const ts = useThemeStyles();
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    sessionDate: new Date().toISOString().split('T')[0],
    moodBefore: 5,
    moodAfter: 5,
    focusLevel: 5,
    stressLevel: 5,
    breathingDepth: 5,
    calmnessScore: 5,
    distractionCount: 0,
    timeOfDay: 'Morning',
    noiseLevel: 'Quiet',
    sessionLength: 10,
    cycles: 5,
    notes: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

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
      <ThemeBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        <div className="flex-1 px-4 sm:px-6 lg:px-[157px] py-12">
          <h1 className="text-3xl sm:text-4xl font-light mb-8" style={{ color: ts.textPrimary }}>
            Record New Meditation Session
          </h1>

          <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
            {/* Date */}
            <div>
              <Label className="t-body font-medium mb-2 block" style={{ color: ts.textSecondary }}>
                Session Date
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
                Time of Day
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
                  <SelectItem value="Morning">Morning</SelectItem>
                  <SelectItem value="Afternoon">Afternoon</SelectItem>
                  <SelectItem value="Evening">Evening</SelectItem>
                  <SelectItem value="Night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Session Length */}
            <div>
              <Label className="t-body font-medium mb-2 block" style={{ color: ts.textSecondary }}>
                Session Length: {formData.sessionLength} minutes
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
                Number of Cycles: {formData.cycles}
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
                Mood Before: {formData.moodBefore}/10
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
                Mood After: {formData.moodAfter}/10
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
                Focus Level: {formData.focusLevel}/10
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
                Stress Level: {formData.stressLevel}/10
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
                Breathing Depth: {formData.breathingDepth}/10
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
                Calmness Score: {formData.calmnessScore}/10
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
                Distraction Count: {formData.distractionCount}
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
                Noise Level
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
                  <SelectItem value="Silent">Silent</SelectItem>
                  <SelectItem value="Quiet">Quiet</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Noisy">Noisy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label className="t-body font-medium mb-2 block" style={{ color: ts.textSecondary }}>
                Notes (Optional)
              </Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any thoughts or observations from this session..."
                className="rounded-xl px-4 py-3 t-body min-h-[120px] outline-none focus:border-[#2A5499] transition-colors resize-none"
                style={{
                  backgroundColor: ts.cardBg,
                  border: `1px solid ${ts.border}`,
                  color: ts.textSecondary,
                }}
              />
            </div>

            {error && <p className="text-red-500 t-body">{error}</p>}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-full text-white font-medium transition-all hover:shadow-[0_0_20px_rgba(58,130,247,0.4)] disabled:opacity-50"
                style={{ background: ts.btnGradient }}
              >
                Save Session
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
                Cancel
              </button>
            </div>
          </form>
        </div>

        <Footer />
      </div>
    </div>
  );
}