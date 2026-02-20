'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import ProfileEditModal from '../../components/ProfileEditModal';
import { API_BASE_URL } from '../../lib/config';
import { auth } from '../../lib/firebase';

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [profileUser, setProfileUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchProfile();
        }
    }, [user, authLoading]);

    const fetchProfile = async () => {
        try {
            const token = await auth.currentUser?.getIdToken();
            // Using existing endpoint to fetch own profile data
            // Assuming /users/profile or similar endpoint returns full user data.
            // If not, we can use /users/:uid logic or similar.
            // Based on UserController, GET /users/:id calls userService.findByUid(id)
            if (user?.uid) {
                const res = await fetch(`${API_BASE_URL}/users/${user.uid}`);
                if (res.ok) {
                    const data = await res.json();
                    setProfileUser(data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setLoading(false);
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
                <div className="max-w-4xl mx-auto">

                    {/* Header Card */}
                    <div className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                        </div>

                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold shadow-2xl relative z-10">
                            {profileUser?.name?.charAt(0) || user?.displayName?.charAt(0) || 'U'}
                        </div>

                        <div className="text-center md:text-left relative z-10 flex-grow">
                            <h1 className="text-3xl font-bold mb-2">{profileUser?.name || user?.displayName}</h1>
                            <p className="text-gray-400 mb-4">{profileUser?.email || user?.email}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className="bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-500/20">
                                    {profileUser?.role || 'Student'}
                                </span>
                                {profileUser?.college && <span className="bg-gray-700 text-gray-300 px-4 py-1.5 rounded-full text-sm">{profileUser?.college}</span>}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-xl font-bold transition flex items-center gap-2 relative z-10"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            Edit Profile
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Personal Info */}
                        <div className="bg-gray-800/30 p-8 rounded-3xl border border-gray-700">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">🎓</span>
                                Academic Information
                            </h2>
                            <div className="space-y-4">
                                <InfoRow label="College" value={profileUser?.college} />
                                <InfoRow label="Branch" value={profileUser?.branch} />
                                <InfoRow label="Year" value={profileUser?.year ? `${profileUser.year} Year` : null} />
                                <InfoRow label="Roll Number" value={profileUser?.roll_no} />
                            </div>
                        </div>

                        {/* Contact Info & Handles */}
                        <div className="space-y-8">
                            <div className="bg-gray-800/30 p-8 rounded-3xl border border-gray-700">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">📞</span>
                                    Contact Details
                                </h2>
                                <div className="space-y-4">
                                    <InfoRow label="Phone" value={profileUser?.phone} />
                                    <InfoRow label="Email" value={profileUser?.email} />
                                </div>
                            </div>

                            <div className="bg-gray-800/30 p-8 rounded-3xl border border-gray-700">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">🔗</span>
                                    Connected Accounts
                                </h2>
                                <div className="space-y-3">
                                    <HandleRow label="LeetCode" value={profileUser?.leetcode_id} />
                                    <HandleRow label="GitHub" value={profileUser?.github_id} />
                                    <HandleRow label="CodeForces" value={profileUser?.codeforces_id} />
                                    <HandleRow label="CodeChef" value={profileUser?.codechef_id} />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <ProfileEditModal
                user={profileUser}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={fetchProfile}
            />
        </div>
    );
}

function InfoRow({ label, value }: { label: string, value: string | null }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-0">
            <span className="text-gray-500 font-medium">{label}</span>
            <span className="font-bold text-white max-w-[60%] text-right truncate">
                {value || <span className="text-gray-600 italic">Not set</span>}
            </span>
        </div>
    );
}

function HandleRow({ label, value }: { label: string, value: string | null }) {
    return (
        <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-xl">
            <span className="text-gray-400 font-medium">{label}</span>
            <span className={`font-mono text-sm ${value ? 'text-blue-400' : 'text-gray-600 italic'}`}>
                {value || 'Not Connected'}
            </span>
        </div>
    );
}
