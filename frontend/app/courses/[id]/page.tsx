'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';

interface Chapter {
    id: string;
    title: string;
    order_no: number;
}

interface Course {
    id: string;
    title: string;
    description: string;
    level: string;
    chapters: Chapter[];
}

export default function CourseDetailPage() {
    const { id } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await fetch(`http://localhost:3000/courses/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setCourse(data);
                }
            } catch (error) {
                console.error('Failed to fetch course:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCourse();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center px-6 text-center">
                    <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
                    <Link href="/courses" className="text-blue-400 hover:text-blue-300">Back to Courses</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Navbar />

            <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/courses" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Courses
                        </Link>
                        <span className="text-gray-700">/</span>
                        <span className="text-blue-400 text-sm">{course.level}</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                    <p className="text-gray-400 text-lg">{course.description}</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Syllabus
                    </h2>

                    <div className="grid gap-4">
                        {course.chapters?.sort((a, b) => a.order_no - b.order_no).map((chapter) => (
                            <Link
                                key={chapter.id}
                                href={`/chapter/${chapter.id}`}
                                className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800 transition flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                                        {chapter.order_no}
                                    </div>
                                    <div>
                                        <h3 className="font-bold group-hover:text-blue-400 transition">{chapter.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1">Click to view problems</p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
