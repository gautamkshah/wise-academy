import React from 'react';
import { Calendar, Clock, ExternalLink } from 'lucide-react';

interface ContestCardProps {
    contest: {
        name: string;
        platform: 'LeetCode' | 'CodeForces' | 'CodeChef';
        startTime: string;
        duration: string;
        url: string;
    };
}

const platformColors = {
    LeetCode: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    CodeForces: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    CodeChef: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
};

export default function ContestCard({ contest }: ContestCardProps) {
    const startDate = new Date(contest.startTime);
    const formattedDate = startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
    const formattedTime = startDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const isStartingSoon = new Date().getTime() > startDate.getTime() - 24 * 60 * 60 * 1000;

    return (
        <div className="group relative bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 hover:border-blue-500/30 p-6 rounded-3xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
            <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${platformColors[contest.platform]}`}>
                    {contest.platform}
                </span>
                {isStartingSoon && (
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded border border-red-500/20 animate-pulse">
                        Starting Soon
                    </span>
                )}
            </div>

            <h3 className="text-xl font-bold mb-4 line-clamp-2 group-hover:text-blue-400 transition-colors">
                {contest.name}
            </h3>

            <div className="space-y-3 mb-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{formattedDate} at {formattedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{contest.duration}</span>
                </div>
            </div>

            <a
                href={contest.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-gray-700/50 hover:bg-blue-500 text-gray-300 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
            >
                Register
                <ExternalLink className="w-4 h-4" />
            </a>
        </div>
    );
}
