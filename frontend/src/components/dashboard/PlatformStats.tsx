
interface Platform {
    id: string;
    name: string;
    icon: string;
    stats: { solved: number; rating: number | null };
    color: string;
    description: string;
}

export default function PlatformStats({ stats }: { stats: any }) {
    const platforms: Platform[] = [
        { id: 'leetcode', name: 'LeetCode', icon: '💡', stats: { solved: stats.leetcode_solved || 0, rating: stats.leetcode_rating }, color: 'from-orange-500/20 to-yellow-500/5 hover:border-orange-500/50', description: 'Algorithmic Mastery' },
        { id: 'cf', name: 'CodeForces', icon: '⚔️', stats: { solved: stats.cf_solved || 0, rating: stats.cf_rating }, color: 'from-red-500/20 to-pink-600/5 hover:border-red-500/50', description: 'Competitive Programming' },
        { id: 'cc', name: 'CodeChef', icon: '👨‍🍳', stats: { solved: stats.cc_solved || 0, rating: stats.cc_rating }, color: 'from-amber-700/20 to-orange-900/5 hover:border-amber-700/50', description: 'Contest Rating' },
        { id: 'atcoder', name: 'AtCoder', icon: '🏯', stats: { solved: stats.atcoder_solved || 0, rating: stats.atcoder_rating }, color: 'from-gray-800 to-black hover:border-gray-500/50', description: 'Japanese Algo Contests' },
        { id: 'hackerrank', name: 'HackerRank', icon: '🟩', stats: { solved: stats.hackerrank_solved || 0, rating: null }, color: 'from-green-500/20 to-emerald-700/5 hover:border-green-500/50', description: 'Badges & Certificates' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {platforms.map(p => (
                <div key={p.id} className={`p-6 rounded-3xl border border-gray-700 bg-gradient-to-br ${p.color} backdrop-blur-sm flex flex-col justify-between min-h-[140px] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-3xl bg-gray-900/40 p-2 rounded-xl">{p.icon}</div>
                        {p.stats.rating ? (
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Rating</span>
                                <span className="text-xl font-black">{p.stats.rating}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-end opacity-20">
                                <span className="text-[10px] font-bold uppercase tracking-widest">Rating</span>
                                <span className="text-xl font-black">---</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-2xl font-bold mb-1">{p.stats.solved} <span className="text-xs font-normal opacity-60">Solved</span></div>
                        <div className="text-[10px] uppercase font-bold tracking-widest opacity-50">{p.name}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
