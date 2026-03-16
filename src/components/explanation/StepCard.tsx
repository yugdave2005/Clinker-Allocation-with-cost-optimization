import React from 'react';
import { Card, CardContent } from '../ui/Card';

interface Props {
  icon: string;
  title: string;
  description: string;
  index: number;
}

export const StepCard: React.FC<Props> = ({ icon, title, description, index }) => (
  <div className="flex gap-4 items-start">
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      {index < 5 && <div className="w-0.5 h-8 bg-slate-700 mt-1" />}
    </div>
    <div className="pb-4">
      <h4 className="text-sm font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>
  </div>
);
