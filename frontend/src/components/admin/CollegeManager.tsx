'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../lib/config';
import { auth } from '../../lib/firebase';

interface College {
    id: string;
    name: string;
    created_at: string;
}

export default function CollegeManager() {
    const { user } = useAuth();
    const [colleges, setColleges] = useState<College[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [newCollegeName, setNewCollegeName] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchColleges();
    }, [searchTerm]);

    const fetchColleges = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/colleges?q=${searchTerm}`);
            if (res.ok) {
                const data = await res.json();
                setColleges(data);
            }
        } catch (error) {
            console.error('Failed to fetch colleges', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCollege = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCollegeName.trim()) return;

        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(`${API_BASE_URL}/colleges`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newCollegeName })
            });

            if (res.ok) {
                setNewCollegeName('');
                fetchColleges();
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to add college');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    const handleDeleteCollege = async (id: string) => {
        if (!confirm('Are you sure you want to delete this college? Users linked to it might lose their college association.')) return;

        try {
            const token = await auth.currentUser?.getIdToken();
            await fetch(`${API_BASE_URL}/colleges/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchColleges();
        } catch (err) {
            console.error('Failed to delete college', err);
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">Manage Colleges</h2>

            {/* Add College Form */}
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-lg font-bold mb-4">Add New College</h3>
                <form onSubmit={handleAddCollege} className="flex gap-4">
                    <input
                        type="text"
                        value={newCollegeName}
                        onChange={(e) => setNewCollegeName(e.target.value)}
                        placeholder="Enter college name..."
                        className="flex-grow bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={!newCollegeName.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add College
                    </button>
                </form>
                {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
            </div>

            {/* List Colleges */}
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Existing Colleges</h3>
                    <input
                        type="text"
                        placeholder="Search colleges..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {colleges.length === 0 ? (
                            <p className="text-gray-500 italic">No colleges found.</p>
                        ) : (
                            colleges.map((college) => (
                                <div key={college.id} className="flex justify-between items-center p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-gray-600 transition group">
                                    <span className="font-medium">{college.name}</span>
                                    <button
                                        onClick={() => handleDeleteCollege(college.id)}
                                        className="text-gray-600 hover:text-red-500 transition p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                                        title="Delete College"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
