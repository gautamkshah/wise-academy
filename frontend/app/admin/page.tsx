'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import Navbar from '../../components/Navbar';
import CourseManager from '../../components/admin/CourseManager';
import ChapterManager from '../../components/admin/ChapterManager';
import ProblemManager from '../../components/admin/ProblemManager';

import { useAuth } from '../../context/AuthContext';

export default function AdminPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({ users: 0, courses: 0, problems: 0, submissions: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'chapters' | 'problems'>('overview');

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        if (user.role !== 'ADMIN') {
            router.push('/dashboard');
            return;
        }

        const loadStats = async () => {
            const token = await auth.currentUser?.getIdToken();
            if (token) await fetchAdminStats(token);
            setLoading(false);
        };
        loadStats();
    }, [user, authLoading, router]);

    const fetchAdminStats = async (token: string) => {
        try {
            // In a real app, you'd have an endpoint like /admin/stats
            // For now, let's fetch counts from their respective endpoints
            const coursesRes = await fetch('http://localhost:3000/courses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const usersRes = await fetch('http://localhost:3000/users/rankings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const courses = coursesRes.ok ? await coursesRes.json() : [];
            const users = usersRes.ok ? await usersRes.json() : [];

            setStats({
                users: users.length,
                courses: courses.length,
                problems: 0, // Need endpoint for total problems
                submissions: 0, // Need endpoint for total submissions
            });
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Control Panel</h1>
                        <p className="text-gray-400">Manage your academy content and users.</p>
                    </div>

                    <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700">
                        {(['overview', 'courses', 'chapters', 'problems'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition capitalize ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <AdminStatCard title="Total Users" value={stats.users} color="blue" />
                            <AdminStatCard title="Active Courses" value={stats.courses} color="green" />
                            <AdminStatCard title="Total Problems" value={stats.problems} color="purple" />
                            <AdminStatCard title="Daily Solves" value={stats.submissions} color="orange" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700">
                                <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                                <p className="text-gray-400 text-sm italic">Activity logs coming soon...</p>
                            </div>
                            <div className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700 flex flex-col items-center justify-center text-center">
                                <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <button onClick={() => setActiveTab('courses')} className="px-6 py-3 bg-blue-600/10 text-blue-400 rounded-xl font-bold hover:bg-blue-600/20 transition">Manage Courses</button>
                                    <button onClick={() => setActiveTab('problems')} className="px-6 py-3 bg-purple-600/10 text-purple-400 rounded-xl font-bold hover:bg-purple-600/20 transition">Add Problem</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'courses' && <CourseManager />}
                {activeTab === 'chapters' && <ChapterManager />}
                {activeTab === 'problems' && <ProblemManager />}
            </main>
        </div>
    );
}

function AdminStatCard({ title, value, color }: { title: string; value: number; color: string }) {
    const colors: any = {
        blue: "text-blue-400 border-blue-500/20 bg-blue-500/10",
        green: "text-green-400 border-green-500/20 bg-green-500/10",
        purple: "text-purple-400 border-purple-500/20 bg-purple-500/10",
        orange: "text-orange-400 border-orange-500/20 bg-orange-500/10",
    };

    return (
        <div className={`p-6 rounded-2xl border ${colors[color]} backdrop-blur-sm shadow-xl`}>
            <div className="text-sm opacity-60 mb-1 font-medium uppercase tracking-wider">{title}</div>
            <div className="text-3xl font-black">{value}</div>
        </div>
    );
}

