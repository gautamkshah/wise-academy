'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { API_BASE_URL } from '../../lib/config';
import AdminModal from './AdminModal';

interface Course { id: string; title: string; }
interface Chapter { id: string; title: string; course_id: string; }
interface Problem {
    id: string;
    title: string;
    platform: string;
    leetcode_link?: string;
    difficulty: string;
    tags: string[];
    chapter_id: string;
}

export default function ProblemManager() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedChapterId, setSelectedChapterId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        platform: 'LeetCode',
        leetcode_link: '',
        difficulty: 'Easy',
        tags: '',
        chapter_id: ''
    });

    useEffect(() => { fetchCourses(); }, []);

    useEffect(() => {
        if (selectedCourseId) fetchChapters(selectedCourseId);
        else { setChapters([]); setSelectedChapterId(''); }
    }, [selectedCourseId]);

    useEffect(() => {
        if (selectedChapterId) fetchProblems(selectedChapterId);
        else setProblems([]);
    }, [selectedChapterId]);

    const fetchCourses = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/courses`);
            const data = await res.json();
            setCourses(data);
        } catch (e) { console.error(e); }
    };

    const fetchChapters = async (courseId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/chapters/course/${courseId}`);
            const data = await res.json();
            setChapters(data);
        } catch (e) { console.error(e); }
    };

    const fetchProblems = async (chapterId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/problems/chapter/${chapterId}`);
            const data = await res.json();
            setProblems(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await auth.currentUser?.getIdToken();
        const url = editingProblem
            ? `${API_BASE_URL}/problems/${editingProblem.id}`
            : `${API_BASE_URL}/problems`;
        const method = editingProblem ? 'PUT' : 'POST';

        const payload = {
            ...formData,
            chapter_id: selectedChapterId,
            tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
        };

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingProblem(null);
                setFormData({ title: '', platform: 'LeetCode', leetcode_link: '', difficulty: 'Easy', tags: '', chapter_id: selectedChapterId });
                fetchProblems(selectedChapterId);
            }
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        const token = await auth.currentUser?.getIdToken();
        try {
            const res = await fetch(`${API_BASE_URL}/problems/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchProblems(selectedChapterId);
        } catch (e) { console.error(e); }
    };

    const openEditModal = (p: Problem) => {
        setEditingProblem(p);
        setFormData({
            title: p.title,
            platform: p.platform,
            leetcode_link: p.leetcode_link || '',
            difficulty: p.difficulty,
            tags: p.tags.join(', '),
            chapter_id: p.chapter_id
        });
        setIsModalOpen(true);
    };

    return (
        <div className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex gap-4">
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">Course</label>
                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-blue-400 focus:outline-none"
                        >
                            <option value="">Select Course</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">Chapter</label>
                        <select
                            disabled={!selectedCourseId}
                            value={selectedChapterId}
                            onChange={(e) => setSelectedChapterId(e.target.value)}
                            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-purple-400 focus:outline-none disabled:opacity-50"
                        >
                            <option value="">Select Chapter</option>
                            {chapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                </div>
                <button
                    disabled={!selectedChapterId}
                    onClick={() => { setEditingProblem(null); setFormData(prev => ({ ...prev, title: '', leetcode_link: '', tags: '' })); setIsModalOpen(true); }}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl font-bold transition disabled:opacity-50 flex items-center gap-2"
                >
                    <span>+</span> Add Problem
                </button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-900 rounded-2xl animate-pulse"></div>)}
                </div>
            ) : selectedChapterId ? (
                <div className="grid gap-3">
                    {problems.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 italic">No problems found.</div>
                    ) : (
                        problems.map(p => (
                            <div key={p.id} className="p-5 bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-between hover:border-gray-600 transition">
                                <div>
                                    <h3 className="font-bold text-white">{p.title}</h3>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${p.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                                            p.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                                            }`}>{p.difficulty}</span>
                                        <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase">{p.platform}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(p)} className="p-2 text-gray-400 hover:text-blue-400 transition">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L11.707 14.707a1 1 0 01-.414.243L8 16l1.293-3.293a1 1 0 01.243-.414L16.5 3.5z" /></svg>
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-400 transition">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-dashed border-gray-700">
                    <p className="text-gray-500">Select a course and chapter to manage problems.</p>
                </div>
            )}

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProblem ? 'Edit Problem' : 'Add New Problem'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                        <input
                            type="text" required value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white"
                            placeholder="Problem Title"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Platform</label>
                            <select
                                value={formData.platform}
                                onChange={e => setFormData({ ...formData, platform: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white"
                            >
                                <option>LeetCode</option>
                                <option>CodeForces</option>
                                <option>CodeChef</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Difficulty</label>
                            <select
                                value={formData.difficulty}
                                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white"
                            >
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Link (Optional)</label>
                        <input
                            type="url" value={formData.leetcode_link}
                            onChange={e => setFormData({ ...formData, leetcode_link: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white"
                            placeholder="https://leetcode.com/problems/..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tags (Comma separated)</label>
                        <input
                            type="text" value={formData.tags}
                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white"
                            placeholder="Arrays, Two Pointers, Microsoft"
                        />
                    </div>
                    <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition mt-4">
                        {editingProblem ? 'Update Problem' : 'Add Problem'}
                    </button>
                </form>
            </AdminModal>
        </div>
    );
}
