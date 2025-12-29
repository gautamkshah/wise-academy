'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import AdminModal from './AdminModal';

interface Course {
    id: string;
    title: string;
    description: string;
    level: string;
}

export default function CourseManager() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [formData, setFormData] = useState({ title: '', description: '', level: 'Beginner' });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch('http://localhost:3000/courses');
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await auth.currentUser?.getIdToken();
        const url = editingCourse
            ? `http://localhost:3000/courses/${editingCourse.id}`
            : 'http://localhost:3000/courses';
        const method = editingCourse ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingCourse(null);
                setFormData({ title: '', description: '', level: 'Beginner' });
                fetchCourses();
            }
        } catch (error) {
            console.error('Failed to save course:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;
        const token = await auth.currentUser?.getIdToken();

        try {
            const res = await fetch(`http://localhost:3000/courses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) fetchCourses();
        } catch (error) {
            console.error('Failed to delete course:', error);
        }
    };

    const openEditModal = (course: Course) => {
        setEditingCourse(course);
        setFormData({ title: course.title, description: course.description || '', level: course.level });
        setIsModalOpen(true);
    };

    return (
        <div className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Course Management</h2>
                <button
                    onClick={() => { setEditingCourse(null); setFormData({ title: '', description: '', level: 'Beginner' }); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition flex items-center gap-2"
                >
                    <span>+</span> Add Course
                </button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-900 rounded-2xl animate-pulse"></div>)}
                </div>
            ) : (
                <div className="grid gap-4">
                    {courses.map(course => (
                        <div key={course.id} className="p-6 bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-between group hover:border-gray-600 transition">
                            <div>
                                <h3 className="font-bold text-lg text-white">{course.title}</h3>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded uppercase font-bold">{course.level}</span>
                                    <span className="text-[10px] text-gray-500 italic">{course.id.slice(0, 8)}...</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => openEditModal(course)} className="p-2 text-gray-400 hover:text-blue-400 transition">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L11.707 14.707a1 1 0 01-.414.243L8 16l1.293-3.293a1 1 0 01.243-.414L16.5 3.5z" /></svg>
                                </button>
                                <button onClick={() => handleDelete(course.id)} className="p-2 text-gray-400 hover:text-red-400 transition">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCourse ? 'Edit Course' : 'Create New Course'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Course Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white"
                            placeholder="e.g. Mastering DSA"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white h-24"
                            placeholder="Describe what this course covers..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Level</label>
                        <select
                            value={formData.level}
                            onChange={e => setFormData({ ...formData, level: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white"
                        >
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-600/20">
                        {editingCourse ? 'Update Course' : 'Create Course'}
                    </button>
                </form>
            </AdminModal>
        </div>
    );
}
