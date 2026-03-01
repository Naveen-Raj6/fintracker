import { useMemo } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const ActivityHeatmap = ({ data, color = 'emerald' }) => {
    // data: array of { date: 'YYYY-MM-DD', value: number }
    // color: 'emerald', 'blue', 'purple', 'orange'

    const colorVariants = {
        emerald: ['bg-slate-800/50', 'bg-emerald-900/40', 'bg-emerald-700/60', 'bg-emerald-500/80', 'bg-emerald-400'],
        blue: ['bg-slate-800/50', 'bg-blue-900/40', 'bg-blue-700/60', 'bg-blue-500/80', 'bg-blue-400'],
        purple: ['bg-slate-800/50', 'bg-purple-900/40', 'bg-purple-700/60', 'bg-purple-500/80', 'bg-purple-400'],
        orange: ['bg-slate-800/50', 'bg-orange-900/40', 'bg-orange-700/60', 'bg-orange-500/80', 'bg-orange-400'],
        indigo: ['bg-slate-800/50', 'bg-indigo-900/40', 'bg-indigo-700/60', 'bg-indigo-500/80', 'bg-indigo-400'],
    };

    const getColor = (value) => {
        const levels = colorVariants[color] || colorVariants.emerald;
        if (value === 0) return levels[0];
        if (value <= 2) return levels[1];
        if (value <= 5) return levels[2];
        if (value <= 8) return levels[3];
        return levels[4];
    };

    const heatmapDays = useMemo(() => {
        const days = [];
        const today = new Date();
        // Show last 12 weeks
        for (let i = 83; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const entry = data.find(item => item.date === dateStr);
            days.push({
                date: dateStr,
                value: entry ? entry.value : 0,
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                monthName: d.toLocaleDateString('en-US', { month: 'short' })
            });
        }
        return days;
    }, [data]);

    return (
        <div className="p-4 bg-slate-900/40 border border-slate-700/50 rounded-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-300">Activity Intensity</h3>
                <div className="flex gap-1 items-center">
                    <span className="text-[10px] text-slate-500 mr-1">Less</span>
                    {(colorVariants[color] || colorVariants.emerald).map((c, i) => (
                        <div key={i} className={cn("w-2 h-2 rounded-[2px]", c)} />
                    ))}
                    <span className="text-[10px] text-slate-500 ml-1">More</span>
                </div>
            </div>
            
            <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2 scrollbar-hide">
                {heatmapDays.map((day, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "w-3 h-3 rounded-[2px] transition-all duration-300 hover:ring-2 hover:ring-white/20 cursor-help",
                            getColor(day.value)
                        )}
                        title={`${day.date}: ${day.value} activities`}
                    />
                ))}
            </div>
            
            <div className="flex justify-between mt-2 text-[10px] text-slate-500">
                <span>{heatmapDays[0].monthName} {new Date(heatmapDays[0].date).getDate()}</span>
                <span>Today</span>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
