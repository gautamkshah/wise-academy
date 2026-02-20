'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { API_BASE_URL } from '../../lib/config';
import AdminModal from './AdminModal';

interface Course {
    id: string;
    title: string;
}

interface Chapter {
    id: string;
    title: string;
    order_no: number;
    course_id: string;
}

export default function ChapterManager() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
    const [formData, setFormData] = useState({ title: '', order_no: 1, course_id: '' });

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourseId) {
            fetchChapters(selectedCourseId);
        } else {
            setChapters([]);
        }
    }, [selectedCourseId]);

    const fetchCourses = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/courses`);
            const data = await response.json();
            setCourses(data);
            if (data.length > 0) setSelectedCourseId(data[0].id);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    const fetchChapters = async (courseId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/chapters/course/${courseId}`);
            const data = await response.json();
            setChapters(data);
        } catch (error) {
            console.error('Failed to fetch chapters:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await auth.currentUser?.getIdToken();
        const url = editingChapter
            ? `${API_BASE_URL}/chapters/${editingChapter.id}`
            : `${API_BASE_URL}/chapters`;
        const method = editingChapter ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    course_id: formData.course_id || selectedCourseId
                }),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingChapter(null);
                setFormData({ title: '', order_no: chapters.length + 1, course_id: selectedCourseId });
                fetchChapters(selectedCourseId);
            }
        } catch (error) {
            console.error('Failed to save chapter:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this chapter?')) return;
        const token = await auth.currentUser?.getIdToken();

        try {
            const res = await fetch(`${API_BASE_URL}/chapters/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) fetchChapters(selectedCourseId);
        } catch (error) {
            console.error('Failed to delete chapter:', error);
        }
    };

    const openEditModal = (chapter: Chapter) => {
        setEditingChapter(chapter);
        setFormData({ title: chapter.title, order_no: chapter.order_no, course_id: chapter.course_id });
        setIsModalOpen(true);
    };

    return (
        <div className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Chapter Management</h2>
                    <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="mt-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-blue-400 focus:outline-none focus:border-blue-500"
                    >
                        <option value="">Select a Course</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
                <button
                    disabled={!selectedCourseId}
                    onClick={() => { setEditingChapter(null); setFormData({ title: '', order_no: chapters.length + 1, course_id: selectedCourseId }); setIsModalOpen(true); }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-bold transition disabled:opacity-50 flex items-center gap-2"
                >
                    <span>+</span> Add Chapter
                </button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-900 rounded-2xl animate-pulse"></div>)}
                </div>
            ) : selectedCourseId ? (
                <div className="grid gap-3">
                    {chapters.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 italic">No chapters found for this course.</div>
                    ) : (
                        chapters.map(chapter => (
                            <div key={chapter.id} className="p-5 bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-between group hover:border-gray-600 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center font-bold text-blue-400 border border-gray-700">
                                        {chapter.order_no}
                                    </div>
                                    <h3 className="font-bold text-white">{chapter.title}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(chapter)} className="p-2 text-gray-400 hover:text-blue-400 transition">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L11.707 14.707a1 1 0 01-.414.243L8 16l1.293-3.293a1 1 0 01.243-.414L16.5 3.5z" /></svg>
                                    </button>
                                    <button onClick={() => handleDelete(chapter.id)} className="p-2 text-gray-400 hover:text-red-400 transition">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-dashed border-gray-700">
                    <p className="text-gray-500">Please select a course to manage chapters.</p>
                </div>
            )}

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingChapter ? 'Edit Chapter' : 'Create New Chapter'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Chapter Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white"
                            placeholder="e.g. Introduction to Arrays"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Order Number</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.order_no}
                            onChange={e => setFormData({ ...formData, order_no: parseInt(e.target.value) })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white"
                        />
                    </div>
                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-purple-600/20">
                        {editingChapter ? 'Update Chapter' : 'Create Chapter'}
                    </button>
                </form>
            </AdminModal>
        </div>
    );
}
