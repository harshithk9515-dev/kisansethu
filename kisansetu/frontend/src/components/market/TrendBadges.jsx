import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export function TrendBadge({ trend, change }) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';
  return (
    <span className={`text-xs font-semibold flex items-center gap-0.5 ${isUp ? 'text-[#22592d]' : isDown ? 'text-red-500' : 'text-gray-500'}`}>
      {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : isDown ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
      {change}
    </span>
  );
}

export function SignalBadge({ signal }) {
  const map = {
    HOLD: 'bg-amber-100 text-amber-800',
    SELL: 'bg-red-100 text-red-800',
    BUY: 'bg-green-100 text-green-800',
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${map[signal] || 'bg-gray-100 text-gray-700'}`}>AI Signal: {signal}</span>;
}
