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

export default function NewSessionPage() {
  const navigate = useNavigate();
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

  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/sessions', formData);
      toast.success('Session saved');
      navigate('/sessions');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save session');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0F1F]">
      {/* Navigation Bar */}
      <div className="relative z-10">
        <NavBar />
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-[157px] py-12">
        <h1 className="text-[#70B8FF] text-[36px] font-normal font-montserrat mb-8">
          Record New Meditation Session
        </h1>

        <form onSubmit={handleSubmit} className="max-w-3xl">
          <div className="space-y-8">
            {/* Date */}
            <div>
              <Label className="text-[#70B8FF] text-[18px] font-roboto mb-2 block">Session Date</Label>
              <Input
                type="date"
                value={formData.sessionDate}
                onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                className="bg-[rgba(255,255,255,0.04)] border border-[#C1BBBB] text-[#3A82F7] text-[18px]"
              />
            </div>

            {/* Time of Day */}
            <div>
              <Label className="text-[#70B8FF] text-[18px] font-roboto mb-2 block">Time of Day</Label>
              <Select value={formData.timeOfDay} onValueChange={(value: string) => setFormData({ ...formData, timeOfDay: value })}>
                <SelectTrigger className="bg-[rgba(255,255,255,0.04)] border border-[#C1BBBB] text-[#3A82F7] text-[18px]">
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
              <Label className="text-[#70B8FF] text-[18px] font-roboto mb-2 block">
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
              <Label className="text-[#70B8FF] text-[18px] font-roboto mb-2 block">
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
              <Label className="text-[#70B8FF] text-[18px] font-roboto mb-2 block">
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
              <Label className="text-[#70B8FF] text-[18px] font-roboto mb-2 block">
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
              <Label className="text-[#70B8FF] text-[18px] font-roboto mb-2 block">
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
              <Label className="text-[#70B8FF] text-[18px] font-roboto mb-2 block">
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
              <Label className="text-[#70B8FF] text-[18px] font-roboto mb-2 block">
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
              <Label className="text-[#70B8FF] text-[18px] font-roboto mb-2 block">
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
              <Label className="text-[#70B8FF] text-[18px] font-roboto mb-2 block">
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
              <Label className="text-[#70B8FF] text-[18px] font-roboto mb-2 block">Noise Level</Label>
              <Select value={formData.noiseLevel} onValueChange={(value: string) => setFormData({ ...formData, noiseLevel: value })}>
                <SelectTrigger className="bg-[rgba(255,255,255,0.04)] border border-[#C1BBBB] text-[#3A82F7] text-[18px]">
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
              <Label className="text-[#70B8FF] text-[18px] font-roboto mb-2 block">Notes (Optional)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any thoughts or observations from this session..."
                className="bg-[rgba(255,255,255,0.04)] border border-[#C1BBBB] text-[#3A82F7] text-[18px] min-h-[120px]"
              />
            </div>

            {error && <p className="text-red-500 text-[16px]">{error}</p>}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button 
                type="submit"
                className="px-5 py-2.5 rounded-full bg-[#3A82F7] text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <span className="text-white text-[18px] font-normal font-roboto">Save Session</span>
              </button>
              <button 
                type="button"
                onClick={() => navigate('/sessions')}
                className="px-5 py-2.5 rounded-full border border-[#3A82F7] text-[#3A82F7] shadow-lg hover:shadow-xl hover:bg-[#3A82F7] hover:text-white transition-all"
              >
                <span className="text-[18px] font-normal font-roboto">Cancel</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="relative z-[999]">
        <Footer />
      </div>
    </div>
  );
}