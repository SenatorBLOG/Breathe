// src/components/charts/StatCard.tsx
import React from 'react';
import { useThemeStyles } from "../../hooks/useThemeStyles";

interface StatCardProps {
  value: string;
  subValue?: React.ReactNode;
  label: string;
  className?: string;
  children?: React.ReactNode;
  accent?: string; // Опциональный цвет свечения
}

const StatCard = ({ 
  value, 
  subValue, 
  label, 
  className = '', 
  children, 
  accent 
}: StatCardProps) => {
  const ts = useThemeStyles();

  // Если accent не передан, используем основной акцент темы с низкой прозрачностью
  const glowColor = accent || `${ts.accent}1F`; 

  return (
    <div
      className={`relative flex flex-col gap-3 rounded-2xl p-4 overflow-hidden transition-all duration-500 hover:scale-[1.015] ${className}`}
      style={{
        background: `linear-gradient(145deg, ${ts.cardBg} 0%, ${ts.navBg} 100%)`,
        border: `1px solid ${ts.border}`,
        backdropFilter: 'blur(12px)',
        boxShadow: `0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 1px ${ts.border}20`,
      }}
    >
      {/* Верхняя тонкая линия свечения */}
      <div 
        className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-transparent to-transparent" 
        style={{ backgroundImage: `linear-gradient(90deg, transparent, ${ts.accent}40, transparent)` }}
      />

      {/* Угловое свечение (Ambient Glow) */}
      <div 
        className="absolute -top-10 -right-10 w-24 h-24 rounded-full pointer-events-none opacity-50"
        style={{ 
          background: glowColor, 
          filter: 'blur(30px)',
          transition: 'background 0.5s ease'
        }} 
      />

      {/* Основные показатели */}
      <div className="relative z-10">
        <p 
          className="text-xl font-bold leading-none tabular-nums tracking-tight"
          style={{ color: ts.textPrimary }}
        >
          {value}
        </p>
        
        {subValue != null && (
          <div className="mt-1.5 font-semibold">
            {subValue}
          </div>
        )}
        
        <p 
          className="mt-2 text-[9px] uppercase tracking-[0.15em] font-bold opacity-80"
          style={{ color: ts.textDim }}
        >
          {label}
        </p>
      </div>

      {/* Слот для графика (Sparkline) */}
      {children && (
        <div className="h-[100px] mt-auto relative z-10">
          {children}
        </div>
      )}

      {/* Нижний градиент для мягкого затухания графиков */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none z-20"
        style={{ 
          background: `linear-gradient(to top, ${ts.navBg}80, transparent)` 
        }} 
      />
    </div>
  );
};

export default StatCard;