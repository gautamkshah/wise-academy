'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import { useAuth } from '../../../context/AuthContext';
import {
    CheckCircle2,
    Circle,
    ExternalLink,
    Search,
    Filter,
    RefreshCw,
    ChevronRight,
    Trophy,
    LayoutGrid,
    BookOpen,
    AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Problem {
    id: string;
    title: string;
    platform: string;
    leetcode_link: string;
    difficulty: string;
    tags: string[];
}

interface Chapter {
    id: string;
    title: string;
    problems: Problem[];
    course_id: string;
    course: {
        title: string;
    };
}

export default function ChapterPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
    const [solvingId, setSolvingId] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        if (user) {
            fetchUserProgress(user.uid);
        }
    }, [user]);

    const fetchUserProgress = async (userId: string) => {
        try {
            const response = await fetch(`http://localhost:3000/progress/${userId}`);
            if (response.ok) {
                const data = await response.json();
                const solved = new Set<string>(data.filter((p: any) => p.status === 'SOLVED').map((p: any) => p.problem_id));
                setSolvedProblems(solved);
            }
        } catch (error) {
            console.error('Failed to fetch progress:', error);
        }
    };

    const fetchChapter = async () => {
        try {
            const response = await fetch(`http://localhost:3000/chapters/${id}`);
            if (response.ok) {
                const data = await response.json();
                setChapter(data);
            }
        } catch (error) {
            console.error('Failed to fetch chapter:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchChapter();
    }, [id]);

    const handleToggleSolve = async (problemId: string) => {
        if (!user) {
            alert('Please login to track your progress');
            return;
        }

        const isSolved = solvedProblems.has(problemId);
        const newStatus = isSolved ? 'PENDING' : 'SOLVED';

        setSolvingId(problemId);
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:3000/progress/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.uid,
                    problemId: problemId,
                    status: newStatus,
                }),
            });

            if (response.ok) {
                const newSolved = new Set(solvedProblems);
                if (isSolved) {
                    newSolved.delete(problemId);
                } else {
                    newSolved.add(problemId);
                    if (chapter && newSolved.size === chapter.problems.length) {
                        triggerCelebration();
                    }
                }
                setSolvedProblems(newSolved);
            }
        } catch (error) {
            console.error('Failed to update progress:', error);
        } finally {
            setSolvingId(null);
        }
    };

    const handleSync = async () => {
        if (!user) return;
        setIsSyncing(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:3000/progress/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: user.uid }),
            });
            if (response.ok) {
                await fetchUserProgress(user.uid);
                // Feedback toast or similar could be added here
            }
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const triggerCelebration = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const filteredProblems = useMemo(() => {
        if (!chapter) return [];
        return chapter.problems.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDifficulty = filterDifficulty === 'All' || p.difficulty === filterDifficulty;
            const matchesStatus = filterStatus === 'All' ||
                (filterStatus === 'Solved' && solvedProblems.has(p.id)) ||
                (filterStatus === 'Unsolved' && !solvedProblems.has(p.id));
            return matchesSearch && matchesDifficulty && matchesStatus;
        });
    }, [chapter, searchQuery, filterDifficulty, filterStatus, solvedProblems]);

    const stats = useMemo(() => {
        if (!chapter) return { total: 0, solved: 0, easy: 0, medium: 0, hard: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 };
        const total = chapter.problems.length;
        const solved = solvedProblems.size;

        return {
            total,
            solved,
            easy: chapter.problems.filter(p => p.difficulty === 'Easy').length,
            medium: chapter.problems.filter(p => p.difficulty === 'Medium').length,
            hard: chapter.problems.filter(p => p.difficulty === 'Hard').length,
            easySolved: chapter.problems.filter(p => p.difficulty === 'Easy' && solvedProblems.has(p.id)).length,
            mediumSolved: chapter.problems.filter(p => p.difficulty === 'Medium' && solvedProblems.has(p.id)).length,
            hardSolved: chapter.problems.filter(p => p.difficulty === 'Hard' && solvedProblems.has(p.id)).length,
        };
    }, [chapter, solvedProblems]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin-slow"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!chapter) return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col items-center justify-center p-6">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold">Chapter not found</h1>
            <Link href="/courses" className="mt-4 text-blue-400 hover:underline">Return to Courses</Link>
        </div>
    );

    const progressPercentage = (stats.solved / stats.total) * 100;

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
                    <Link href="/courses" className="hover:text-blue-400 transition">Courses</Link>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                    <Link href={`/courses/${chapter.course_id}`} className="hover:text-blue-400 transition truncate max-w-[150px]">
                        {chapter.course?.title || 'Back to Course'}
                    </Link>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                    <span className="text-gray-300 font-medium truncate">{chapter.title}</span>
                </nav>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Sidebar: Chapter Info & Progress */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 p-8 rounded-3xl sticky top-24">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2 leading-tight">{chapter.title}</h1>
                                    <p className="text-gray-400 text-sm flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        {chapter.problems.length} Curated Problems
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-500/10 rounded-2xl">
                                    <Trophy className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>

                            {/* Progress Visualizer */}
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-400">Total Completion</span>
                                        <span className="text-lg font-bold text-blue-400">{Math.round(progressPercentage)}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-gray-700/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-1000 ease-out"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <ProgressStat label="Easy" solved={stats.easySolved} total={stats.easy} color="green" />
                                    <ProgressStat label="Medium" solved={stats.mediumSolved} total={stats.medium} color="yellow" />
                                    <ProgressStat label="Hard" solved={stats.hardSolved} total={stats.hard} color="red" />
                                </div>

                                <button
                                    onClick={handleSync}
                                    disabled={isSyncing || !user}
                                    className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition-all flex items-center justify-center gap-3 group"
                                >
                                    <RefreshCw className={`w-5 h-5 text-blue-400 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                                    <span className="font-semibold">{isSyncing ? 'Syncing...' : 'Sync with Platforms'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Problem List */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Filters & Search */}
                        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-grow w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search problem title..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-gray-700/50 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500/50 transition"
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <select
                                    value={filterDifficulty}
                                    onChange={(e) => setFilterDifficulty(e.target.value)}
                                    className="bg-gray-900/50 border border-gray-700/50 rounded-2xl py-3 px-4 focus:outline-none focus:border-blue-500/50 transition cursor-pointer text-sm"
                                >
                                    <option value="All">All Difficulty</option>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="bg-gray-900/50 border border-gray-700/50 rounded-2xl py-3 px-4 focus:outline-none focus:border-blue-500/50 transition cursor-pointer text-sm"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Solved">Solved</option>
                                    <option value="Unsolved">Unsolved</option>
                                </select>
                            </div>
                        </div>

                        {/* Problem List */}
                        <div className="space-y-4">
                            {filteredProblems.length > 0 ? (
                                filteredProblems.map((problem) => (
                                    <div
                                        key={problem.id}
                                        className={`group bg-gray-800/40 backdrop-blur-xl border p-5 rounded-3xl transition-all duration-300 flex items-center justify-between gap-4 ${solvedProblems.has(problem.id)
                                            ? 'border-green-500/20 bg-green-500/5'
                                            : 'border-gray-700/50 hover:border-blue-500/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-5 flex-grow min-w-0">
                                            <button
                                                onClick={() => handleToggleSolve(problem.id)}
                                                disabled={solvingId === problem.id}
                                                className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${solvedProblems.has(problem.id)
                                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                                    : 'bg-gray-700/50 text-gray-400 hover:bg-blue-500/20 hover:text-blue-400'
                                                    }`}
                                            >
                                                {solvingId === problem.id ? (
                                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                ) : solvedProblems.has(problem.id) ? (
                                                    <CheckCircle2 className="w-6 h-6" />
                                                ) : (
                                                    <Circle className="w-6 h-6" />
                                                )}
                                            </button>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-bold text-lg truncate group-hover:text-blue-400 transition-colors">
                                                        {problem.title}
                                                    </h3>
                                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                                                        problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                                            'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {problem.difficulty}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <LayoutGrid className="w-3 h-3" />
                                                        {problem.platform}
                                                    </span>
                                                    <span>•</span>
                                                    <div className="flex gap-2">
                                                        {problem.tags.slice(0, 3).map(tag => (
                                                            <span key={tag} className="bg-gray-900/50 px-2 py-0.5 rounded-md border border-gray-700/50">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {problem.tags.length > 3 && (
                                                            <span className="text-gray-600">+{problem.tags.length - 3}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <a
                                            href={problem.leetcode_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="shrink-0 p-3 bg-gray-700/50 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 rounded-2xl transition-all"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-gray-500 bg-gray-800/20 rounded-3xl border border-dashed border-gray-700">
                                    <Search className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="text-lg">No problems match your filters</p>
                                    <button
                                        onClick={() => { setSearchQuery(''); setFilterDifficulty('All'); setFilterStatus('All'); }}
                                        className="mt-4 text-blue-400 hover:underline"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
            `}</style>
        </div>
    );
}

function ProgressStat({ label, solved, total, color }: { label: string, solved: number, total: number, color: 'green' | 'yellow' | 'red' }) {
    const colorClasses = {
        green: 'text-green-500 bg-green-500/10',
        yellow: 'text-yellow-500 bg-yellow-500/10',
        red: 'text-red-500 bg-red-500/10'
    };

    const barColors = {
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500'
    };

    const percentage = total > 0 ? (solved / total) * 100 : 0;

    return (
        <div className="p-4 bg-gray-900/30 rounded-2xl border border-gray-700/30">
            <div className="flex justify-between items-center mb-3">
                <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${colorClasses[color]}`}>
                    {label}
                </span>
                <span className="text-xs font-mono text-gray-400">{solved}/{total}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ${barColors[color]}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
