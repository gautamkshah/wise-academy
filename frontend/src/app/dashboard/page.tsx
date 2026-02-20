'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import useSWR from 'swr';
import Navbar from '../../components/Navbar';
import ActivityHeatmap from '../../components/dashboard/ActivityHeatmap';
import PlatformStats from '../../components/dashboard/PlatformStats';
import CourseProgress from '../../components/dashboard/CourseProgress';
import Skeleton from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../lib/config';
import { auth } from '../../lib/firebase';

const fetcher = async (url: string) => {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
};

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const { data, error, isLoading } = useSWR(
        user ? `${API_BASE_URL}/dashboard` : null,
        fetcher
    );

    if (authLoading) return <DashboardSkeleton />;
    if (!user) {
        router.push('/login');
        return null;
    }

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                    <p className="text-gray-400 mb-6">Failed to load dashboard data</p>
                    <button onClick={() => window.location.reload()} className="bg-blue-600 px-6 py-2 rounded-xl font-bold">Try Again</button>
                    <p className="text-xs text-gray-600 mt-8">Debug Info: Backend {API_BASE_URL}</p>
                </div>
            </div>
        );
    }

    if (isLoading) return <DashboardSkeleton />;

    const { user: profile, stats, activityHeatmap, recentActivity, courseProgress } = data;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-6 py-8">

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold shadow-lg ring-4 ring-gray-800">
                            {profile.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Hello, {profile.name?.split(' ')[0]}! 👋</h1>
                            <p className="text-gray-400 text-sm">Let's keep the streak alive.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/connect" className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition border border-gray-700">
                            Manage Accounts
                        </Link>
                        <button onClick={handleLogout} className="bg-red-500/10 text-red-500 px-5 py-2.5 rounded-xl hover:bg-red-500/20 transition text-sm font-bold border border-red-500/20">
                            Logout
                        </button>
                    </div>
                </div>

                {/* 2. Platform Stats Row */}
                <div className="mb-8">
                    <PlatformStats stats={stats || {}} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN (Wide) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Activity Heatmap */}
                        <ActivityHeatmap data={activityHeatmap} />

                        {/* Recent Activity List */}
                        <div className="bg-gray-800/30 p-8 rounded-3xl border border-gray-700">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">⚡</span>
                                Recent Activity
                            </h2>
                            {recentActivity.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No recent activity. Solve a problem to see it here!</p>
                            ) : (
                                <div className="space-y-0 divide-y divide-gray-800">
                                    {recentActivity.map((act: any, i: number) => (
                                        <div key={i} className="py-3 flex items-center justify-between group hover:bg-gray-800/50 -mx-4 px-4 transition rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${act.problem.platform === 'LeetCode' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    act.problem.platform === 'CodeForces' ? 'bg-red-500/10 text-red-500' :
                                                        'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                    {act.problem.platform?.charAt(0) || 'P'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-200">{act.problem.platform} Problem</div>
                                                    <div className="text-[10px] text-gray-500">{new Date(act.solved_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${act.problem.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' :
                                                act.problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-green-500/10 text-green-500'
                                                }`}>
                                                {act.problem.difficulty || 'Solved'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* RIGHT COLUMN (Sidebar) */}
                    <div className="space-y-8">

                        {/* Course Progress */}
                        <CourseProgress courses={courseProgress} />

                        {/* Quick Actions */}
                        <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
                                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.75l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 relative z-10">Join the Pro League</h3>
                            <p className="text-blue-100 text-sm mb-6 relative z-10 max-w-[80%]">Unlock premium contests, 1-on-1 mentorship, and detailed analytics.</p>
                            <button className="w-full bg-white text-blue-600 font-bold py-3 rounded-2xl hover:bg-gray-100 transition shadow-lg relative z-10">
                                Upgrade Now
                            </button>
                        </div>

                    </div>

                </div>

            </main>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow container mx-auto px-6 py-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48 rounded-lg" />
                            <Skeleton className="h-4 w-32 rounded-lg" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Skeleton className="h-10 w-32 rounded-xl" />
                        <Skeleton className="h-10 w-24 rounded-xl" />
                    </div>
                </div>

                {/* Use hardcoded skeletons for stats instead of mapping array to simplify */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Skeleton className="h-24 rounded-3xl" />
                    <Skeleton className="h-24 rounded-3xl" />
                    <Skeleton className="h-24 rounded-3xl" />
                    <Skeleton className="h-24 rounded-3xl" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Skeleton className="h-64 rounded-3xl" />
                        <Skeleton className="h-48 rounded-3xl" />
                    </div>
                    <div className="space-y-8">
                        <Skeleton className="h-64 rounded-3xl" />
                        <Skeleton className="h-48 rounded-3xl" />
                    </div>
                </div>
            </main>
        </div>
    )
}
