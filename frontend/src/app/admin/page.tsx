'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { auth } from '../../lib/firebase';
import { API_BASE_URL } from '../../lib/config';
import Navbar from '../../components/Navbar';
import CourseManager from '../../components/admin/CourseManager';
import ChapterManager from '../../components/admin/ChapterManager';
import ProblemManager from '../../components/admin/ProblemManager';
import StudentManager from '../../components/admin/StudentManager';
import CollegeManager from '../../components/admin/CollegeManager';
import Skeleton from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';

const fetchAdminStats = async () => {
    const token = await auth.currentUser?.getIdToken();
    const headers = { 'Authorization': `Bearer ${token}` };

    const [coursesRes, usersRes, collegesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/courses`, { headers }),
        fetch(`${API_BASE_URL}/users/rankings`, { headers }),
        fetch(`${API_BASE_URL}/colleges`)
    ]);

    const courses = coursesRes.ok ? await coursesRes.json() : [];
    const users = usersRes.ok ? await usersRes.json() : [];
    const colleges = collegesRes.ok ? await collegesRes.json() : [];

    return {
        users: users.length,
        courses: courses.length,
        colleges: colleges.length,
        problems: 0,
        submissions: 0,
    };
};

export default function AdminPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'chapters' | 'problems' | 'students' | 'colleges'>('overview');

    const { data: stats, isLoading } = useSWR(
        user?.role === 'ADMIN' ? 'admin-stats' : null,
        fetchAdminStats
    );

    if (authLoading) return <AdminSkeleton />;

    if (!user) {
        router.push('/login');
        return null;
    }

    if (user.role !== 'ADMIN') {
        router.push('/dashboard');
        return null;
    }

    if (isLoading && !stats) return <AdminSkeleton />;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Control Panel</h1>
                        <p className="text-gray-400">Manage your academy content and users.</p>
                    </div>

                    <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700 overflow-x-auto max-w-full">
                        {(['overview', 'students', 'colleges', 'courses', 'chapters', 'problems'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition capitalize whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
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
                            <AdminStatCard title="Total Users" value={stats?.users || 0} color="blue" />
                            <AdminStatCard title="Active Courses" value={stats?.courses || 0} color="green" />
                            <AdminStatCard title="Colleges" value={stats?.colleges || 0} color="purple" />
                            <AdminStatCard title="Daily Solves" value={stats?.submissions || 0} color="orange" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700">
                                <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                                <p className="text-gray-400 text-sm italic">Activity logs coming soon...</p>
                            </div>
                            <div className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700 flex flex-col items-center justify-center text-center">
                                <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <button onClick={() => setActiveTab('students')} className="px-6 py-3 bg-green-600/10 text-green-400 rounded-xl font-bold hover:bg-green-600/20 transition">Manage Students</button>
                                    <button onClick={() => setActiveTab('courses')} className="px-6 py-3 bg-blue-600/10 text-blue-400 rounded-xl font-bold hover:bg-blue-600/20 transition">Manage Courses</button>
                                    <button onClick={() => setActiveTab('problems')} className="px-6 py-3 bg-purple-600/10 text-purple-400 rounded-xl font-bold hover:bg-purple-600/20 transition">Add Problem</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'students' && <StudentManager />}
                {activeTab === 'courses' && <CourseManager />}
                {activeTab === 'chapters' && <ChapterManager />}
                {activeTab === 'problems' && <ProblemManager />}
                {activeTab === 'colleges' && <CollegeManager />}
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

function AdminSkeleton() {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow container mx-auto px-6 py-12 animate-pulse">
                <div className="flex justify-between mb-8">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64 rounded-xl" />
                        <Skeleton className="h-4 w-48 rounded-lg" />
                    </div>
                    <Skeleton className="h-12 w-96 rounded-xl" />
                </div>
                <div className="grid grid-cols-4 gap-6 mb-12">
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <Skeleton className="h-64 rounded-3xl" />
                    <Skeleton className="h-64 rounded-3xl" />
                </div>
            </main>
        </div>
    )
}

