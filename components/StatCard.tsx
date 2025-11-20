import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LichessPerf } from '../types';

interface StatCardProps {
  title: string;
  perf?: LichessPerf;
  icon: LucideIcon;
  isSelected: boolean;
  onClick: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, perf, icon: Icon, isSelected, onClick }) => {
  const rating = perf?.rating || '?';
  const games = perf?.games || 0;
  const prog = perf?.prog || 0;

  return (
    <div 
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border cursor-pointer transition-all duration-300
        flex flex-col justify-between overflow-hidden group
        ${isSelected 
          ? 'bg-lichess-light border-lichess-gold shadow-[0_0_15px_rgba(197,160,89,0.15)]' 
          : 'bg-lichess-light/50 border-lichess-accent hover:bg-lichess-light hover:border-gray-600'}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <Icon className={`w-5 h-5 ${isSelected ? 'text-lichess-gold' : 'text-gray-500'}`} />
          <span className={`font-semibold text-sm uppercase tracking-wider ${isSelected ? 'text-white' : 'text-gray-400'}`}>
            {title}
          </span>
        </div>
      </div>

      <div className="mt-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-white">{rating}</span>
          {games > 0 && (
             <span className={`text-xs font-medium flex items-center ${prog > 0 ? 'text-green-400' : prog < 0 ? 'text-red-400' : 'text-gray-500'}`}>
               {prog > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : prog < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <Minus className="w-3 h-3 mr-1" />}
               {Math.abs(prog)}
             </span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {games.toLocaleString()} games played
        </div>
      </div>

      {/* Background Decoration */}
      <div className={`absolute -bottom-4 -right-4 opacity-5 transition-opacity duration-300 ${isSelected ? 'opacity-10' : ''}`}>
        <Icon className="w-24 h-24 text-lichess-gold" />
      </div>
    </div>
  );
};