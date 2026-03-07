// src/components/SessionFeedbackModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';

interface SessionFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  initialData: {
    moodBefore: number;
    moodAfter: number;
    focusLevel: number;
    stressLevel: number;
    breathingDepth: number;
    calmnessScore: number;
    distractionCount: number;
    noiseLevel: string;
    notes: string;
  };
  onSubmit: (data: SessionFeedbackModalProps['initialData']) => void;
}

export function SessionFeedbackModal({ open, onClose, initialData, onSubmit }: SessionFeedbackModalProps) {
  const [formData, setFormData] = useState(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#0A0F1F] border border-[#70B8FF] text-[#88AACC]">
        <DialogHeader>
          <DialogTitle className="text-[#70B8FF] text-[24px] font-montserrat">Session Feedback</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mood Before */}
          <div>
            <Label className="text-[#70B8FF] text-[16px] font-roboto mb-1 block">
              Mood Before: {formData.moodBefore}/10
            </Label>
            <Slider
              value={[formData.moodBefore]}
              onValueChange={([value]: number[]) => setFormData({ ...formData, moodBefore: value })}
              min={1}
              max={10}
              step={1}
            />
          </div>

          {/* Mood After */}
          <div>
            <Label className="text-[#70B8FF] text-[16px] font-roboto mb-1 block">
              Mood After: {formData.moodAfter}/10
            </Label>
            <Slider
              value={[formData.moodAfter]}
              onValueChange={([value]: number[]) => setFormData({ ...formData, moodAfter: value })}
              min={1}
              max={10}
              step={1}
            />
          </div>

          {/* Focus Level */}
          <div>
            <Label className="text-[#70B8FF] text-[16px] font-roboto mb-1 block">
              Focus Level: {formData.focusLevel}/10
            </Label>
            <Slider
              value={[formData.focusLevel]}
              onValueChange={([value]: number[]) => setFormData({ ...formData, focusLevel: value })}
              min={1}
              max={10}
              step={1}
            />
          </div>

          {/* Stress Level */}
          <div>
            <Label className="text-[#70B8FF] text-[16px] font-roboto mb-1 block">
              Stress Level: {formData.stressLevel}/10
            </Label>
            <Slider
              value={[formData.stressLevel]}
              onValueChange={([value]: number[]) => setFormData({ ...formData, stressLevel: value })}
              min={1}
              max={10}
              step={1}
            />
          </div>

          {/* Breathing Depth */}
          <div>
            <Label className="text-[#70B8FF] text-[16px] font-roboto mb-1 block">
              Breathing Depth: {formData.breathingDepth}/10
            </Label>
            <Slider
              value={[formData.breathingDepth]}
              onValueChange={([value]: number[]) => setFormData({ ...formData, breathingDepth: value })}
              min={1}
              max={10}
              step={1}
            />
          </div>

          {/* Calmness Score */}
          <div>
            <Label className="text-[#70B8FF] text-[16px] font-roboto mb-1 block">
              Calmness Score: {formData.calmnessScore}/10
            </Label>
            <Slider
              value={[formData.calmnessScore]}
              onValueChange={([value]: number[]) => setFormData({ ...formData, calmnessScore: value })}
              min={1}
              max={10}
              step={1}
            />
          </div>

          {/* Distraction Count */}
          <div>
            <Label className="text-[#70B8FF] text-[16px] font-roboto mb-1 block">
              Distraction Count: {formData.distractionCount}
            </Label>
            <Slider
              value={[formData.distractionCount]}
              onValueChange={([value]: number[]) => setFormData({ ...formData, distractionCount: value })}
              min={0}
              max={20}
              step={1}
            />
          </div>

          {/* Noise Level */}
          <div>
            <Label className="text-[#70B8FF] text-[16px] font-roboto mb-1 block">Noise Level</Label>
            <Select value={formData.noiseLevel} onValueChange={(value: string) => setFormData({ ...formData, noiseLevel: value })}>
              <SelectTrigger className="bg-[rgba(255,255,255,0.79)] border border-[#C1BBBB] text-[#3A82F7]">
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
            <Label className="text-[#70B8FF] text-[16px] font-roboto mb-1 block">Notes (Optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any thoughts or observations from this session..."
              className="bg-[rgba(255,255,255,0.04)] border border-[#C1BBBB] text-[#3A82F7] min-h-[80px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Skip</Button>
            <Button type="submit">Save Feedback</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}