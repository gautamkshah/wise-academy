import { useMemo } from 'react';

interface ActivityHeatmapProps {
    data: { date: string; count: number }[];
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 365); // Last 1 year

    // Generate full year grid
    const heatmapGrid = useMemo(() => {
        const grid = [];
        const dataMap = new Map(data.map(d => [d.date, d.count]));

        // Loop week by week
        for (let i = 0; i < 52; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (i * 7) + j);

                if (currentDate > today) break;

                const dateStr = currentDate.toISOString().split('T')[0];
                const count = dataMap.get(dateStr) || 0;

                // Determine color intensity
                let colorClass = 'bg-gray-800';
                if (count > 0) colorClass = 'bg-green-900/40 border border-green-800';
                if (count >= 1) colorClass = 'bg-green-700/60 border border-green-600';
                if (count >= 3) colorClass = 'bg-green-500 border border-green-400';
                if (count >= 5) colorClass = 'bg-green-400 border border-green-300 shadow-[0_0_8px_rgba(74,222,128,0.5)]';

                week.push({ date: dateStr, count, colorClass });
            }
            grid.push(week);
        }
        return grid;
    }, [data]);

    return (
        <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 overflow-x-auto">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4">Activity (Last Year)</h3>
            <div className="flex gap-1 min-w-max">
                {heatmapGrid.map((week, wIndex) => (
                    <div key={wIndex} className="flex flex-col gap-1">
                        {week.map((day, dIndex) => (
                            <div
                                key={`${wIndex}-${dIndex}`}
                                title={`${day.date}: ${day.count} solved`}
                                className={`w-3 h-3 rounded-sm ${day.colorClass} transition-all hover:scale-125 hover:z-10`}
                            ></div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2 mt-4 text-[10px] text-gray-500">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-gray-800"></div>
                <div className="w-3 h-3 rounded-sm bg-green-900/40"></div>
                <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                <div className="w-3 h-3 rounded-sm bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                <span>More</span>
            </div>
        </div>
    );
}
