import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { FormattedHistoryPoint, RatingHistoryEntry } from '../types';
import { Calendar, Filter } from 'lucide-react';

interface GrowthChartProps {
  history: RatingHistoryEntry[];
  selectedMode: string; // e.g. "Blitz"
  color: string;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ history, selectedMode, color }) => {
  const [timeRange, setTimeRange] = useState<'all' | '1y' | '6m' | '3m'>('all');

  const data: FormattedHistoryPoint[] = useMemo(() => {
    const modeData = history.find(h => h.name === selectedMode);
    if (!modeData) return [];

    return modeData.points.map(point => {
      // Lichess returns [year, month(0-11), day, rating]
      const [y, m, d, rating] = point;
      const dateObj = new Date(Date.UTC(y, m, d));
      return {
        date: dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
        timestamp: dateObj.getTime(),
        rating: rating
      };
    });
  }, [history, selectedMode]);

  const filteredData = useMemo(() => {
    if (timeRange === 'all') return data;
    
    const now = new Date().getTime();
    const rangeMap = {
      '1y': 365 * 24 * 60 * 60 * 1000,
      '6m': 180 * 24 * 60 * 60 * 1000,
      '3m': 90 * 24 * 60 * 60 * 1000,
    };
    
    const cutoff = now - rangeMap[timeRange];
    return data.filter(d => d.timestamp >= cutoff);
  }, [data, timeRange]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500 bg-lichess-light/30 rounded-xl border border-lichess-accent border-dashed">
        <Filter className="w-12 h-12 mb-4 opacity-20" />
        <p>No rating history available for {selectedMode}.</p>
      </div>
    );
  }

  // Calculate domain for Y-Axis to make the chart look dynamic (not starting from 0)
  const minRating = Math.min(...filteredData.map(d => d.rating));
  const maxRating = Math.max(...filteredData.map(d => d.rating));
  const padding = (maxRating - minRating) * 0.1;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-lichess-dark border border-lichess-gold/30 p-3 rounded-lg shadow-xl">
          <p className="text-gray-400 text-xs mb-1 flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {label}
          </p>
          <p className="text-lichess-gold font-bold text-lg">
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-lichess-light rounded-xl border border-lichess-accent p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <span className="w-2 h-8 bg-lichess-gold rounded-full mr-3"></span>
          {selectedMode} Progress
        </h3>
        
        <div className="flex bg-lichess-dark p-1 rounded-lg border border-lichess-accent">
          {(['3m', '6m', '1y', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                timeRange === range 
                  ? 'bg-lichess-gold text-lichess-dark' 
                  : 'text-gray-400 hover:text-white hover:bg-lichess-accent'
              }`}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#363431" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280" 
              tick={{fontSize: 12}}
              minTickGap={50}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              domain={[Math.round(minRating - padding), Math.round(maxRating + padding)]} 
              stroke="#6b7280"
              tick={{fontSize: 12}}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="rating" 
              stroke={color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRating)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 rounded-lg bg-lichess-dark/50 border border-lichess-accent/50">
            <p className="text-xs text-gray-500">Current</p>
            <p className="text-lg font-bold text-white">{filteredData[filteredData.length - 1]?.rating || '-'}</p>
        </div>
        <div className="p-3 rounded-lg bg-lichess-dark/50 border border-lichess-accent/50">
            <p className="text-xs text-gray-500">Peak (Period)</p>
            <p className="text-lg font-bold text-green-400">{maxRating === -Infinity ? '-' : maxRating}</p>
        </div>
        <div className="p-3 rounded-lg bg-lichess-dark/50 border border-lichess-accent/50">
            <p className="text-xs text-gray-500">Lowest (Period)</p>
            <p className="text-lg font-bold text-red-400">{minRating === Infinity ? '-' : minRating}</p>
        </div>
      </div>
    </div>
  );
};