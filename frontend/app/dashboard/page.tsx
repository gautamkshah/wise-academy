'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { auth } from '../../lib/firebase';

interface Stats {
    total_solved: number;
    leetcode_solved: number;
    cf_solved: number;
    cc_solved: number;
    leetcode_rating: number | null;
    cf_rating: number | null;
    cc_rating: number | null;
    leetcode_id?: string;
    codeforces_id?: string;
    codechef_id?: string;
}

import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<Stats>({
        total_solved: 0,
        leetcode_solved: 0,
        cf_solved: 0,
        cc_solved: 0,
        leetcode_rating: null,
        cf_rating: null,
        cc_rating: null,
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showHandleModal, setShowHandleModal] = useState<string | null>(null);
    const [handleInput, setHandleInput] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user && user.id) {
            const loadData = async () => {
                const token = await auth.currentUser?.getIdToken();
                if (token) await fetchDashboardData(user.id!, token);
            };
            loadData();
        }
    }, [user, authLoading, router]);

    const fetchDashboardData = async (userId: string, token: string) => {
        try {
            // Fetch user data including handles
            const userRes = await fetch(`http://localhost:3000/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let userData = null;
            if (userRes.ok) {
                userData = await userRes.json();
            }

            // Fetch progress stats
            const progressRes = await fetch(`http://localhost:3000/progress/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let solvedCount = 0;
            if (progressRes.ok) {
                const progress = await progressRes.json();
                solvedCount = progress.filter((p: any) => p.status === 'SOLVED').length;
            }

            setStats({
                total_solved: userData?.stats?.total_solved || solvedCount,
                leetcode_solved: userData?.stats?.leetcode_solved || 0,
                cf_solved: userData?.stats?.cf_solved || 0,
                cc_solved: userData?.stats?.cc_solved || 0,
                leetcode_rating: userData?.stats?.leetcode_rating !== undefined ? userData.stats.leetcode_rating : null,
                cf_rating: userData?.stats?.cf_rating !== undefined ? userData.stats.cf_rating : null,
                cc_rating: userData?.stats?.cc_rating !== undefined ? userData.stats.cc_rating : null,
                leetcode_id: userData?.leetcode_id,
                codeforces_id: userData?.codeforces_id,
                codechef_id: userData?.codechef_id,
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateHandle = async () => {
        if (!showHandleModal || !user || !handleInput) return;
        setUpdating(true);

        try {
            const token = await auth.currentUser?.getIdToken();
            const field = showHandleModal === 'LeetCode' ? 'leetcode_id' :
                showHandleModal === 'CodeForces' ? 'codeforces_id' : 'codechef_id';

            console.log(`Connecting ${showHandleModal} handle: ${handleInput}`);

            const response = await fetch('http://localhost:3000/users/handles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    [field]: handleInput,
                }),
            });

            if (response.ok) {
                console.log('Handle updated successfully');
                setShowHandleModal(null);
                setHandleInput('');

                // Re-fetch everything to get the fresh sync data
                const token = await auth.currentUser?.getIdToken();
                if (token && user?.id) {
                    await fetchDashboardData(user.id, token);
                }

                alert('Account connected successfully! Your stats will update shortly.');
            } else {
                const errorData = await response.json();
                console.error('Failed to update handle:', errorData);
                alert(`Error: ${errorData.message || 'Failed to connect'}`);
            }
        } catch (error) {
            console.error('Network error during handle update:', error);
            alert('Failed to connect: Please check if the backend is running.');
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (loading) {
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
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Welcome back, {(user?.name || user?.displayName || 'User').split(' ')[0]}!</h1>
                        <p className="text-gray-400">Master your craft, one problem at a time.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleLogout}
                            className="bg-red-500/10 text-red-400 px-6 py-2.5 rounded-xl hover:bg-red-500/20 transition text-sm font-bold"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard title="Total Solved" value={stats.total_solved.toString()} icon="✅" color="blue" subtitle="Across all platforms" />
                    <StatCard title="LeetCode" value={stats.leetcode_rating?.toString() || '---'} icon="💡" color="yellow" subtitle={`Solved: ${stats.leetcode_solved}`} />
                    <StatCard title="CodeForces" value={stats.cf_rating?.toString() || '---'} icon="⚔️" color="red" subtitle={`Solved: ${stats.cf_solved}`} />
                    <StatCard title="CodeChef" value={stats.cc_rating?.toString() || '---'} icon="👨‍🍳" color="purple" subtitle={`Solved: ${stats.cc_solved}`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700">
                            <h2 className="text-2xl font-bold mb-6">Learning Analytics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800 text-center">
                                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Daily Streak</div>
                                    <div className="text-4xl font-black text-orange-500">72</div>
                                    <div className="text-[10px] text-gray-600 mt-1">Consistency is key!</div>
                                </div>
                                <div className="col-span-2 p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-bold">Solved Target</span>
                                        <span className="text-xs text-blue-400">
                                            {Math.min(100, Math.round((stats.total_solved / 500) * 100))}% Complete
                                        </span>
                                    </div>
                                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-1000"
                                            style={{ width: `${Math.min(100, (stats.total_solved / 500) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                                        <span>Current: {stats.total_solved}</span>
                                        <span>Goal: 500</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700">
                            <h2 className="text-2xl font-bold mb-6">Continue Learning</h2>
                            <div className="grid gap-4">
                                <Link href="/courses" className="flex items-center justify-between p-6 bg-gray-800 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-xl">📚</div>
                                        <div>
                                            <h3 className="font-bold group-hover:text-blue-400 transition">Browse Courses</h3>
                                            <p className="text-sm text-gray-400">Explore DSA & Development paths</p>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>

                                <Link href="/leaderboard" className="flex items-center justify-between p-6 bg-gray-800 rounded-2xl border border-gray-700 hover:border-orange-500/50 transition group focus:outline-none">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-xl">🏆</div>
                                        <div>
                                            <h3 className="font-bold group-hover:text-orange-400 transition">Global Rankings</h3>
                                            <p className="text-sm text-gray-400">Compete with the top coders</p>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-500 group-hover:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-900/20">
                            <h3 className="text-xl font-bold mb-2">Pro Mentorship</h3>
                            <p className="text-blue-100 text-sm mb-6">Get 1-on-1 guidance from top engineers.</p>
                            <button className="w-full bg-white text-blue-600 font-bold py-3 rounded-2xl hover:bg-gray-100 transition shadow-lg">
                                View Plans
                            </button>
                        </div>

                        <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-700">
                            <h3 className="font-bold mb-4">Connect Accounts</h3>
                            <div className="space-y-3">
                                <AccountLinkItem
                                    name="LeetCode"
                                    id={stats.leetcode_id}
                                    onConnect={() => setShowHandleModal('LeetCode')}
                                />
                                <AccountLinkItem
                                    name="CodeForces"
                                    id={stats.codeforces_id}
                                    onConnect={() => setShowHandleModal('CodeForces')}
                                />
                                <AccountLinkItem
                                    name="CodeChef"
                                    id={stats.codechef_id}
                                    onConnect={() => setShowHandleModal('CodeChef')}
                                />
                            </div>
                        </div>

                        <div className="bg-gray-800/20 p-6 rounded-3xl border border-gray-800/50">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Top Tech Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {['React', 'NestJS', 'PostgreSQL', 'Prisma', 'Next.js'].map(t => (
                                    <span key={t} className="text-[10px] bg-gray-800 text-gray-400 px-2 py-1 rounded-md">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal for Handle Connection */}
                {showHandleModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                        <div className="bg-gray-800 w-full max-w-sm rounded-3xl border border-gray-700 p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => setShowHandleModal(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <h3 className="text-2xl font-bold mb-2">Connect {showHandleModal}</h3>
                            <p className="text-gray-400 text-sm mb-6">Enter your username to fetch your latest statistics.</p>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={handleInput}
                                    onChange={(e) => setHandleInput(e.target.value)}
                                    placeholder={`${showHandleModal} Username`}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                                />
                                <button
                                    onClick={handleUpdateHandle}
                                    disabled={updating || !handleInput}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
                                >
                                    {updating ? 'Connecting...' : 'Confirm Connection'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, color, subtitle }: { title: string; value: string; icon: string, color: string, subtitle?: string }) {
    const colors: any = {
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        red: "bg-red-500/10 text-red-500 border-red-500/20",
        purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };

    return (
        <div className={`p-6 rounded-3xl border ${colors[color]} backdrop-blur-sm`}>
            <div className="flex justify-between items-start mb-2">
                <div className="text-2xl">{icon}</div>
                {subtitle && <div className="text-[10px] opacity-60 uppercase font-black tracking-tighter">{subtitle}</div>}
            </div>
            <div className="text-sm opacity-80 mb-1 font-medium">{title}</div>
            <div className="text-3xl font-bold">{value}</div>
        </div>
    );
}

function AccountLinkItem({ name, id, onConnect }: { name: string; id?: string; onConnect: () => void }) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
            <div>
                <span className="text-xs text-gray-500 block">{name}</span>
                <span className="text-sm font-bold truncate max-w-[120px] block">
                    {id || 'Not Connected'}
                </span>
            </div>
            <button
                onClick={onConnect}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider transition ${id ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                    }`}>
                {id ? 'Change' : 'Connect'}
            </button>
        </div>
    );
}
