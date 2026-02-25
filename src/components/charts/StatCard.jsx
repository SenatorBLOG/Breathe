import React from 'react';

const StatCard = ({ value, subValue, label, className = '', children }) => {
  return (
    <div className={`rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/40 p-4 sm:p-5 flex flex-col gap-3 min-h-[160px] ${className}`}>
      <div>
        <div className="text-slate-900 dark:text-slate-100 text-xl sm:text-2xl font-extrabold leading-tight break-words">
          {value}
        </div>
        {subValue !== undefined && subValue !== null && (
          <div className="mt-0.5 text-[11px] sm:text-xs font-medium">{subValue}</div>
        )}
        <div className="mt-1 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{label}</div>
      </div>

      {children && (
        <div className="mt-2 h-[110px] sm:h-[130px]">
          {children}
        </div>
      )}
    </div>
  );
};

export default StatCard;
