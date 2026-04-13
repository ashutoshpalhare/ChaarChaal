import React from 'react';
import { LayoutDashboard, CheckCircle2, TrendingUp } from 'lucide-react';

interface SummaryBarProps {
  totalCount: number;
  activeCount: number;
  totalMetric: number;
}

export const SummaryBar: React.FC<SummaryBarProps> = ({
  totalCount,
  activeCount,
  totalMetric,
}) => {
  const cards = [
    {
      label: 'Total Records',
      value: totalCount,
      icon: LayoutDashboard,
      accent: 'text-sky-400',
      bg: 'bg-sky-500/10',
    },
    {
      label: 'Active',
      value: activeCount,
      icon: CheckCircle2,
      accent: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Story Points',
      value: totalMetric.toLocaleString(),
      icon: TrendingUp,
      accent: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm transition hover:border-zinc-700 hover:bg-zinc-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
                  {card.value}
                </p>
              </div>
              <div className={`rounded-xl ${card.bg} p-2.5 ${card.accent}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-2xl transition group-hover:bg-white/10" />
          </div>
        );
      })}
    </section>
  );
};
// TODO: refine SummaryBar.tsx layout spacing
