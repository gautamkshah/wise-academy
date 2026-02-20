'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../lib/config';
import { auth } from '../lib/firebase';
import CollegeSelector from './CollegeSelector';

export default function CompleteProfileModal() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(true);
    const [formData, setFormData] = useState({
        college: user?.college || '',
        branch: '',
        year: '',
        roll_no: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);

    // Only show if user is logged in and missing critical details
    // For now, we assume if branch/year are missing, profile is incomplete
    if (!user || user.branch) return null;
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    college: formData.college,
                    branch: formData.branch,
                    year: parseInt(formData.year),
                    roll_no: formData.roll_no,
                    phone: formData.phone,
                }),
            });

            if (res.ok) {
                alert('Profile updated successfully!');
                setIsOpen(false);
                window.location.reload(); // Reload to sync context
            } else {
                alert('Failed to update profile.');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <div className="bg-gray-800 w-full max-w-md rounded-3xl border border-gray-700 p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <h2 className="text-2xl font-bold mb-2 text-white">Complete Your Profile</h2>
                <p className="text-gray-400 text-sm mb-6">Help us customize your learning experience.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <CollegeSelector
                            value={formData.college}
                            onChange={(val) => setFormData({ ...formData, college: val })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Branch</label>
                            <input
                                type="text"
                                required
                                placeholder="CSE, IT, etc."
                                value={formData.branch}
                                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Year</label>
                            <input
                                type="number"
                                required
                                placeholder="1, 2, 3, 4"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Roll No</label>
                            <input
                                type="text"
                                required
                                value={formData.roll_no}
                                onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Phone</label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition mt-4 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Details'}
                    </button>
                </form>
            </div>
        </div>
    );
}
