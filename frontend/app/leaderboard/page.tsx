'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { API_BASE_URL } from '../../lib/config';

interface RankedUser {
    id: string;
    name: string;
    photo: string | null;
    solvedCount: number;
}

export default function LeaderboardPage() {
    const [rankings, setRankings] = useState<RankedUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/users/rankings?limit=20`);
                if (response.ok) {
                    const data = await response.json();
                    setRankings(data);
                }
            } catch (error) {
                console.error('Failed to fetch rankings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Navbar />

            <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                        Global Leaderboard
                    </h1>
                    <p className="text-gray-400 text-lg">Top performers mastering DSA and Development.</p>
                </div>

                <div className="bg-gray-800/50 rounded-3xl border border-gray-700 overflow-hidden shadow-2xl backdrop-blur-sm">
                    <div className="p-6 bg-gray-800/80 border-b border-gray-700 grid grid-cols-12 text-sm font-bold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-2 text-center">Rank</div>
                        <div className="col-span-6">User</div>
                        <div className="col-span-4 text-right">Problems Solved</div>
                    </div>

                    {loading ? (
                        <div className="p-20 flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-800">
                            {rankings.map((user, index) => (
                                <div key={user.id} className="p-6 grid grid-cols-12 items-center hover:bg-gray-800/50 transition group">
                                    <div className="col-span-2 flex justify-center">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-500 text-gray-900 scale-110 shadow-lg shadow-yellow-500/20' :
                                            index === 1 ? 'bg-gray-400 text-gray-900' :
                                                index === 2 ? 'bg-orange-600 text-white' :
                                                    'bg-gray-800 text-gray-400'
                                            }`}>
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div className="col-span-6 flex items-center gap-4">
                                        {user.photo ? (
                                            <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full border-2 border-gray-700" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold border-2 border-gray-700">
                                                {user.name[0]}
                                            </div>
                                        )}
                                        <span className="font-bold text-lg group-hover:text-blue-400 transition">{user.name}</span>
                                    </div>
                                    <div className="col-span-4 text-right">
                                        <span className="text-2xl font-black text-blue-400">{user.solvedCount}</span>
                                        <span className="text-xs text-gray-600 ml-2">SOLVED</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
