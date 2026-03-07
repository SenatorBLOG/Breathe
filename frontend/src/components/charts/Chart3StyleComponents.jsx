// src/components/charts/Chart3StyleComponents.tsx

import React, { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// === color palette  ===
export const Chart3Colors = {
  primary: '#3A82F7',        // main
  secondary: '#BDDEFF',      
  hover: '#00ff88',          
  positive: '#00ff88',       
  negative: '#FF4D4F',       
  consistency: '#5A8FFF',    
  textPrimary: '#AEE6FF',    // text
  textSecondary: '#88AACC',  // secondary
  background: 'rgba(84, 164, 244, 0.13)',
  containerBg: '#0F1E33',
  gridLine: 'rgba(112, 184, 255, 0.2)',
  shadow: '0 8px 32px rgba(13, 10, 44, 0.2)',
};

// === container ===
export const Chart3BlueContainer = ({ children, title, subtitle, className = "", width = "100%", height = "425px" }) => (
  <div className={`relative ${className}`} style={{ width, height }}>
    <div 
      className="w-full h-full rounded-2xl relative overflow-hidden backdrop-blur-sm border border-white/10"
      style={{ background: Chart3Colors.containerBg, boxShadow: Chart3Colors.shadow }}
    >
      {(title || subtitle) && (
        <div className="absolute left-8 top-6 z-10">
          {subtitle && (
            <div className="text-lg font-light" style={{ color: Chart3Colors.textSecondary }}>
              {subtitle}
            </div>
          )}
          {title && (
            <div className="text-2xl font-bold mt-1" style={{ color: Chart3Colors.textPrimary }}>
              {title}
            </div>
          )}
        </div>
      )}
      <div className="w-full h-full pt-20 px-8 pb-8">
        {children}
      </div>
    </div>
  </div>
);

// === title ===
export const Chart3Tooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg px-4 py-2 text-lg font-medium shadow-2xl" 
           style={{ background: '#D9D9D9', color: '#12294E' }}>
        {payload[0].value} min
      </div>
    );
  }
  return null;
};

// === dropdown ===
export const Chart3Dropdown = ({ value, onChange, options, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        className="flex items-center justify-between px-6 py-3 rounded-2xl cursor-pointer transition-all"
        style={{ background: 'rgba(84, 164, 244, 0.13)' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium" style={{ color: Chart3Colors.textPrimary }}>
          {value}
        </span>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</div>
      </div>
      {isOpen && (
          <div className="absolute top-full mt-2 w-full rounded-2xl overflow-hidden shadow-2xl z-50 border border-white/10"
              style={{ background: 'rgba(15, 30, 51, 0.95)', backdropFilter: 'blur(16px)' }}>
            {options.map(opt => (
              <div
                key={opt}
                className="px-6 py-3 hover:bg-white/10 transition-all cursor-pointer border-b border-white/5 last:border-0"
                style={{ 
                  color: opt === value ? '#70B8FF' : '#AEE6FF',
                  fontWeight: opt === value ? 'bold' : 'normal'
                }}
                onClick={() => { onChange(opt); setIsOpen(false); }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
    </div>
  );
};