// SessionStats.tsx
import { Card } from './ui/card';
import { Clock, Target, Calendar } from 'lucide-react';


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
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4" style={{ 
        background: 'var(--card)',
        borderColor: 'var(--border)',
      }}>
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--ocean-glow-background)' }}
          >
            <Clock className="w-5 h-5" style={{ color: 'var(--ocean-title)' }} />
          </div>
          <div>
            <p style={{ color: 'var(--ocean-subtitle)' }}>Session Time</p>
            <p style={{ color: 'var(--ocean-title)' }}>
              {formatTime(currentSession.duration)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4" style={{ 
        background: 'var(--card)',
        borderColor: 'var(--border)',
      }}>
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--ocean-glow-background)' }}
          >
            <Target className="w-5 h-5" style={{ color: 'var(--ocean-title)' }} />
          </div>
          <div>
            <p style={{ color: 'var(--ocean-subtitle)' }}>Breath Cycles</p>
            <p style={{ color: 'var(--ocean-title)' }}>
              {currentSession.cycles}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4" style={{ 
        background: 'var(--card)',
        borderColor: 'var(--border)',
      }}>
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--ocean-glow-background)' }}
          >
            <Calendar className="w-5 h-5" style={{ color: 'var(--ocean-title)' }} />
          </div>
          <div>
            <p style={{ color: 'var(--ocean-subtitle)' }}>Daily Streak</p>
            <p style={{ color: 'var(--ocean-title)' }}>
              {totalStats.streak} days
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}