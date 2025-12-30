'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import { useAuth } from '../../../context/AuthContext';
import { ChevronLeft, BookOpen, Trophy, CheckCircle, Circle, BarChart3, Layers } from 'lucide-react';
import { API_BASE_URL } from '../../../lib/config';

interface ProblemLite {
    id: string;
    difficulty: string;
}

interface Chapter {
    id: string;
    title: string;
    order_no: number;
    problems: ProblemLite[];
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
    const { user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/courses/${id}`);
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

    useEffect(() => {
        const fetchProgress = async () => {
            if (!user) return;
            try {
                const response = await fetch(`${API_BASE_URL}/progress/${user.uid}`);
                if (response.ok) {
                    const data = await response.json();
                    const solvedIds = new Set<string>(data.filter((p: any) => p.status === 'SOLVED').map((p: any) => p.problem_id as string));
                    setSolvedProblems(solvedIds);
                }
            } catch (err) {
                console.error("Failed to fetch progress", err);
            }
        };
        fetchProgress();
    }, [user]);

    const getStats = () => {
        if (!course) return null;
        const allProblems = course.chapters.flatMap(c => c.problems || []);

        const counts = {
            total: allProblems.length,
            solved: allProblems.filter(p => solvedProblems.has(p.id)).length,
            easy: allProblems.filter(p => p.difficulty === 'Easy').length,
            easySolved: allProblems.filter(p => p.difficulty === 'Easy' && solvedProblems.has(p.id)).length,
            medium: allProblems.filter(p => p.difficulty === 'Medium').length,
            mediumSolved: allProblems.filter(p => p.difficulty === 'Medium' && solvedProblems.has(p.id)).length,
            hard: allProblems.filter(p => p.difficulty === 'Hard').length,
            hardSolved: allProblems.filter(p => p.difficulty === 'Hard' && solvedProblems.has(p.id)).length,
        };
        return counts;
    };

    const CircularProgress = ({ value, max, color, label, subLabel }: { value: number, max: number, color: string, label: string, subLabel: string }) => {
        const percentage = max > 0 ? (value / max) * 100 : 0;
        const radius = 30;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className="flex flex-col items-center p-4 bg-gray-800/40 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:border-gray-600 transition-all group">
                <div className="relative w-24 h-24 mb-3">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-700/30" />
                        <circle
                            cx="48" cy="48" r={radius}
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className={`${color} transition-all duration-1000 ease-out`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-bold">{value}</span>
                        <span className="text-[10px] text-gray-500">of {max}</span>
                    </div>
                </div>
                <span className="font-semibold text-sm mb-0.5">{label}</span>
                <span className={`text-xs ${color.replace('text-', 'text-opacity-80 ')}`}>{subLabel}</span>
            </div>
        );
    };

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

    if (!course) return null;

    const stats = getStats();

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col selection:bg-blue-500/30">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
                {/* Header Section */}
                <div className="mb-10">
                    <Link href="/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group text-sm font-medium">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Courses
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${course.level === 'Beginner' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    course.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                    {course.level}
                                </span>
                                <span className="text-gray-500 flex items-center gap-1 text-xs font-medium uppercase tracking-wider">
                                    <BookOpen className="w-3 h-3" />
                                    {course.chapters.length} Chapters
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                {course.title}
                            </h1>
                            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
                                {course.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Dashboard */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                        <CircularProgress
                            value={stats.solved}
                            max={stats.total}
                            color="text-blue-500"
                            label="Overall Progress"
                            subLabel={`${Math.round((stats.solved / stats.total || 0) * 100)}% Completed`}
                        />
                        <CircularProgress
                            value={stats.easySolved}
                            max={stats.easy}
                            color="text-green-400"
                            label="Easy Problems"
                            subLabel="Fundamentals"
                        />
                        <CircularProgress
                            value={stats.mediumSolved}
                            max={stats.medium}
                            color="text-yellow-400"
                            label="Medium Problems"
                            subLabel="Core Concepts"
                        />
                        <CircularProgress
                            value={stats.hardSolved}
                            max={stats.hard}
                            color="text-red-400"
                            label="Hard Problems"
                            subLabel="Advanced Mastery"
                        />
                    </div>
                )}

                {/* Syllabus */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                        <Layers className="w-6 h-6 text-blue-500" />
                        <h2 className="text-2xl font-bold">Course Syllabus</h2>
                    </div>

                    <div className="grid gap-4">
                        {course.chapters?.sort((a, b) => a.order_no - b.order_no).map((chapter, index) => {
                            const total = chapter.problems?.length || 0;
                            const solved = chapter.problems?.filter(p => solvedProblems.has(p.id)).length || 0;
                            const isCompleted = total > 0 && total === solved;

                            return (
                                <Link
                                    key={chapter.id}
                                    href={`/chapter/${chapter.id}`}
                                    className="group relative bg-gray-800/30 hover:bg-gray-800/60 p-6 rounded-2xl border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner ${isCompleted ? 'bg-green-500/10 text-green-400' : 'bg-gray-700/50 text-gray-400 group-hover:bg-blue-500/10 group-hover:text-blue-400'
                                                } transition-colors`}>
                                                {isCompleted ? <CheckCircle className="w-6 h-6" /> : chapter.order_no}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl mb-1 group-hover:text-blue-400 transition-colors">{chapter.title}</h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    <span className="flex items-center gap-1.5">
                                                        <BookOpen className="w-3.5 h-3.5" />
                                                        {total} Problems
                                                    </span>
                                                    {solved > 0 && (
                                                        <span className={`flex items-center gap-1.5 ${isCompleted ? 'text-green-400' : 'text-blue-400'}`}>
                                                            <Trophy className="w-3.5 h-3.5" />
                                                            {solved} Solved
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${(solved / total) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500 font-medium">
                                                {Math.round((solved / total) * 100)}% Complete
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
