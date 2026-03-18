// src/components/SessionStats.tsx
import React from 'react';
import { Card } from './ui/card';
import { Clock, Target, Calendar } from 'lucide-react';
import { useThemeStyles } from '../hooks/useThemeStyles';

interface SessionStatsProps {
  currentSession: {
    duration: number;
    cycles: number;
  };
  totalStats: {
    totalSessions: number;
    totalMinutes: number;
    streak: number;
  };
}

export function SessionStats({ currentSession, totalStats }: SessionStatsProps) {
  const ts = useThemeStyles();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 scale-75 sm:scale-80 md:scale-90 origin-bottom-left">
      {/* Session Time */}
      <Card
        className="p-1.5 sm:p-2 backdrop-blur-sm rounded-lg shadow-lg"
        style={{
          background: `linear-gradient(to bottom right, ${ts.cardBg}cc, ${ts.cardBg}99)`,
          border: `1px solid ${ts.border}`,
        }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="p-1.5 sm:p-2 rounded-lg"
            style={{ backgroundColor: `${ts.accent}20` }}
          >
            <Clock
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              style={{ color: ts.accent }}
            />
          </div>

          <div>
            <p
              className="text-[10px] sm:text-xs whitespace-nowrap"
              style={{ color: ts.textMuted }}
            >
              Session Time
            </p>
            <p
              className="text-sm sm:text-base font-semibold"
              style={{ color: ts.textPrimary }}
            >
              {formatTime(currentSession.duration)}
            </p>
          </div>
        </div>
      </Card>

      {/* Breath Cycles */}
      <Card
        className="p-1.5 sm:p-2 backdrop-blur-sm rounded-lg shadow-lg"
        style={{
          background: `linear-gradient(to bottom right, ${ts.cardBg}cc, ${ts.cardBg}99)`,
          border: `1px solid ${ts.border}`,
        }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="p-1.5 sm:p-2 rounded-lg"
            style={{ backgroundColor: `${ts.accent}20` }}
          >
            <Target
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              style={{ color: ts.accent }}
            />
          </div>

          <div>
            <p
              className="text-[10px] sm:text-xs whitespace-nowrap"
              style={{ color: ts.textMuted }}
            >
              Breath Cycles
            </p>
            <p
              className="text-sm sm:text-base font-semibold"
              style={{ color: ts.textPrimary }}
            >
              {currentSession.cycles}
            </p>
          </div>
        </div>
      </Card>

      {/* Daily Streak */}
      <Card
        className="p-1.5 sm:p-2 backdrop-blur-sm rounded-lg shadow-lg"
        style={{
          background: `linear-gradient(to bottom right, ${ts.cardBg}cc, ${ts.cardBg}99)`,
          border: `1px solid ${ts.border}`,
        }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="p-1.5 sm:p-2 rounded-lg"
            style={{ backgroundColor: `${ts.accent}20` }}
          >
            <Calendar
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              style={{ color: ts.accent }}
            />
          </div>

          <div>
            <p
              className="text-[10px] sm:text-xs whitespace-nowrap"
              style={{ color: ts.textMuted }}
            >
              Daily Streak
            </p>
            <p
              className="text-sm sm:text-base font-semibold"
              style={{ color: ts.textPrimary }}
            >
              {totalStats.streak} days
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}