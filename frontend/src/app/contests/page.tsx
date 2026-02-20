'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import ContestCard from '../../components/ContestCard';
import { API_BASE_URL } from '../../lib/config';
import { Trophy, Calendar, Filter, Loader2, RefreshCw } from 'lucide-react';

interface Contest {
    name: string;
    platform: 'LeetCode' | 'CodeForces' | 'CodeChef';
    startTime: string;
    duration: string;
    url: string;
}

export default function ContestsPage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'All' | 'LeetCode' | 'CodeForces' | 'CodeChef'>('All');

    const fetchContests = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/contests`);
            if (!response.ok) throw new Error('Failed to fetch contests');
            const data = await response.json();
            setContests(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load contests. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContests();
    }, []);

    const filteredContests = contests.filter(c => filter === 'All' || c.platform === filter);

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-yellow-500" />
                            Upcoming Contests
                        </h1>
                        <p className="text-gray-400">
                            Track upcoming coding contests from major platforms in one place.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-800/40 p-1.5 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                        {['All', 'LeetCode', 'CodeForces', 'CodeChef'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setFilter(p as any)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === p
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-500 animate-pulse">Fetching latest contests...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-red-500/5 border border-red-500/10 rounded-3xl">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={fetchContests}
                            className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all flex items-center gap-2 mx-auto"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Retry
                        </button>
                    </div>
                ) : filteredContests.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/20 border border-gray-700/30 border-dashed rounded-3xl">
                        <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No upcoming contests found matching your filter.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredContests.map((contest, idx) => (
                            <ContestCard key={`${contest.name}-${idx}`} contest={contest} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
