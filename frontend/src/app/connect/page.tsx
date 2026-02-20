'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { API_BASE_URL } from '../../lib/config';
import { auth } from '../../lib/firebase';

interface Platform {
    id: string;
    name: string;
    icon: string;
    color: string;
    handleKey: string;
    placeholder: string;
    description: string;
}

const platforms: Platform[] = [
    {
        id: 'leetcode',
        name: 'LeetCode',
        icon: '💡',
        color: 'from-orange-500 to-yellow-500',
        handleKey: 'leetcode_id',
        placeholder: 'LeetCode Username',
        description: 'Track your DSA progress and contest ratings.'
    },
    {
        id: 'codeforces',
        name: 'CodeForces',
        icon: '⚔️',
        color: 'from-red-500 to-pink-600',
        handleKey: 'codeforces_id',
        placeholder: 'CodeForces Handle',
        description: 'Compete in global contests and climb the ranks.'
    },
    {
        id: 'codechef',
        name: 'CodeChef',
        icon: '👨‍🍳',
        color: 'from-amber-700 to-orange-900',
        handleKey: 'codechef_id',
        placeholder: 'CodeChef Username',
        description: 'Showcase your competitive programming skills.'
    },
    {
        id: 'hackerrank',
        name: 'HackerRank',
        icon: '🟩',
        color: 'from-green-500 to-emerald-700',
        handleKey: 'hackerrank_id',
        placeholder: 'HackerRank Username',
        description: 'Earn badges and master algorithms.'
    },
    {
        id: 'atcoder',
        name: 'AtCoder',
        icon: '🏯',
        color: 'from-gray-800 to-black',
        handleKey: 'atcoder_id',
        placeholder: 'AtCoder ID',
        description: 'Join high-quality Japanese coding contests.'
    },
    {
        id: 'github',
        name: 'GitHub',
        icon: '🐙',
        color: 'from-gray-700 to-gray-900',
        handleKey: 'github_id',
        placeholder: 'GitHub Username',
        description: 'Connect your project portfolio and contributions.'
    }
];

export default function ConnectPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [handles, setHandles] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null); // Platform ID being saved

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchHandles();
        }
    }, [user, authLoading]);

    const fetchHandles = async () => {
        try {
            const token = await auth.currentUser?.getIdToken();
            if (user?.uid) {
                const res = await fetch(`${API_BASE_URL}/users/${user.uid}`);
                if (res.ok) {
                    const data = await res.json();
                    setHandles({
                        leetcode_id: data.leetcode_id || '',
                        codeforces_id: data.codeforces_id || '',
                        codechef_id: data.codechef_id || '',
                        hackerrank_id: data.hackerrank_id || '',
                        atcoder_id: data.atcoder_id || '',
                        github_id: data.github_id || ''
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch handles', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (platform: Platform) => {
        setSaving(platform.id);
        const handleValue = handles[platform.handleKey];

        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(`${API_BASE_URL}/users/handles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    [platform.handleKey]: handleValue
                })
            });

            if (res.ok) {
                alert(`${platform.name} connected successfully!`);
            } else {
                alert(`Failed to connect ${platform.name}`);
            }
        } catch (error) {
            console.error(error);
            alert('Network error');
        } finally {
            setSaving(null);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Navbar />

            <main className="flex-grow container mx-auto px-6 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Coding Connect</h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Link all your Competitive Programming and Development profiles in one place.
                            We calculate your aggregated stats to show your true potential.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {platforms.map(platform => (
                            <div key={platform.id} className="bg-gray-800/50 rounded-3xl border border-gray-700 overflow-hidden hover:border-gray-500 transition group relative">
                                <div className={`h-2 bg-gradient-to-r ${platform.color} w-full`}></div>

                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="text-4xl bg-gray-900/50 p-3 rounded-2xl">{platform.icon}</div>
                                        {handles[platform.handleKey] && (
                                            <span className="bg-green-500/10 text-green-500 text-xs font-bold px-3 py-1 rounded-full border border-green-500/20">
                                                CONNECTED
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-2xl font-bold mb-2">{platform.name}</h3>
                                    <p className="text-gray-400 text-sm mb-6 min-h-[40px]">{platform.description}</p>

                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={handles[platform.handleKey] || ''}
                                            onChange={(e) => setHandles({ ...handles, [platform.handleKey]: e.target.value })}
                                            placeholder={platform.placeholder}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white transition placeholder-gray-600"
                                        />

                                        <button
                                            onClick={() => handleSave(platform)}
                                            disabled={saving === platform.id}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {saving === platform.id ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                            ) : (
                                                handles[platform.handleKey] ? 'Update Connection' : 'Connect Account'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
