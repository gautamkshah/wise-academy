'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

export default function AdminPage() {
    const [stats, setStats] = useState({ users: 0, courses: 0, problems: 0, submissions: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetching admin stats
        setTimeout(() => {
            setStats({
                users: 124,
                courses: 2,
                problems: 5,
                submissions: 842,
            });
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-8">Admin Control Panel</h1>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-gray-800 rounded-2xl border border-gray-700"></div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            <AdminStatCard title="Total Users" value={stats.users} color="blue" />
                            <AdminStatCard title="Active Courses" value={stats.courses} color="green" />
                            <AdminStatCard title="Total Problems" value={stats.problems} color="purple" />
                            <AdminStatCard title="Daily Solves" value={stats.submissions} color="orange" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700">
                                <h2 className="text-xl font-bold mb-6">Course Management</h2>
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-between">
                                        <span>Mastering DSA</span>
                                        <button className="text-blue-400 text-sm font-bold">Edit</button>
                                    </div>
                                    <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-between">
                                        <span>Fullstack Web Dev</span>
                                        <button className="text-blue-400 text-sm font-bold">Edit</button>
                                    </div>
                                    <button className="w-full py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-500 hover:text-white hover:border-blue-500 transition">
                                        + Add New Course
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700">
                                <h2 className="text-xl font-bold mb-6">User Activity</h2>
                                <div className="space-y-4">
                                    <p className="text-gray-400 text-sm italic">Activity logs coming soon...</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
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
        <div className={`p-6 rounded-2xl border ${colors[color]} backdrop-blur-sm`}>
            <div className="text-sm opacity-60 mb-1 font-medium">{title}</div>
            <div className="text-3xl font-black">{value}</div>
        </div>
    );
}
