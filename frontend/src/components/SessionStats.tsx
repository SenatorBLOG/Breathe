import { Card } from './ui/card'
import { Clock, Target, Calendar } from 'lucide-react'

interface SessionStatsProps {
  currentSession: {
    duration: number
    cycles: number
  }
  totalStats: {
    totalSessions: number
    totalMinutes: number
    streak: number
  }
}

export function SessionStats({ currentSession, totalStats }: SessionStatsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 scale-75 sm:scale-80 md:scale-90 origin-bottom-left">
      {/* Session Time */}
      <Card className="p-1.5 sm:p-2 bg-gradient-to-br from-[#0F2A45]/80 to-[#1E3A5A]/60 backdrop-blur-sm border border-[#2A4A6A]/50 rounded-lg shadow-lg">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="p-1.5 sm:p-2 rounded-lg"
            style={{ backgroundColor: 'var(--ocean-glow-background)' }}
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: 'var(--ocean-title)' }} />
          </div>

          <div>
            <p className="text-[10px] sm:text-xs whitespace-nowrap" style={{ color: 'var(--ocean-subtitle)' }}>
              Session Time
            </p>
            <p className="text-sm sm:text-base font-semibold" style={{ color: 'var(--ocean-title)' }}>
              {formatTime(currentSession.duration)}
            </p>
          </div>
        </div>
      </Card>

      {/* Breath Cycles */}
      <Card className="p-1.5 sm:p-2 bg-gradient-to-br from-[#0F2A45]/80 to-[#1E3A5A]/60 backdrop-blur-sm border border-[#2A4A6A]/50 rounded-lg shadow-lg">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="p-1.5 sm:p-2 rounded-lg"
            style={{ backgroundColor: 'var(--ocean-glow-background)' }}
          >
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: 'var(--ocean-title)' }} />
          </div>

          <div>
            <p className="text-[10px] sm:text-xs whitespace-nowrap" style={{ color: 'var(--ocean-subtitle)' }}>
              Breath Cycles
            </p>
            <p className="text-sm sm:text-base font-semibold" style={{ color: 'var(--ocean-title)' }}>
              {currentSession.cycles}
            </p>
          </div>
        </div>
      </Card>

      {/* Daily Streak */}
      <Card className="p-1.5 sm:p-2 bg-gradient-to-br from-[#0F2A45]/80 to-[#1E3A5A]/60 backdrop-blur-sm border border-[#2A4A6A]/50 rounded-lg shadow-lg">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="p-1.5 sm:p-2 rounded-lg"
            style={{ backgroundColor: 'var(--ocean-glow-background)' }}
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: 'var(--ocean-title)' }} />
          </div>

          <div>
            <p className="text-[10px] sm:text-xs whitespace-nowrap" style={{ color: 'var(--ocean-subtitle)' }}>
              Daily Streak
            </p>
            <p className="text-sm sm:text-base font-semibold" style={{ color: 'var(--ocean-title)' }}>
              {totalStats.streak} days
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}