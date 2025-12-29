'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';

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
}

export default function ChapterPage() {
    const { id } = useParams();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
    const [solvingId, setSolvingId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (user) {
                fetchUserProgress(user.uid);
            }
        });

        return () => unsubscribe();
    }, []);

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

    useEffect(() => {
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

        if (id) fetchChapter();
    }, [id]);

    const handleToggleSolve = async (problemId: string) => {
        if (!user) {
            alert('Please login to track your progress');
            return;
        }

        setSolvingId(problemId);
        try {
            const isSolved = solvedProblems.has(problemId);
            const response = await fetch('http://localhost:3000/progress/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.uid,
                    problemId: problemId,
                    status: isSolved ? 'PENDING' : 'SOLVED',
                }),
            });

            if (response.ok) {
                const newSolved = new Set(solvedProblems);
                if (isSolved) {
                    newSolved.delete(problemId);
                } else {
                    newSolved.add(problemId);
                }
                setSolvedProblems(newSolved);
            }
        } catch (error) {
            console.error('Failed to update progress:', error);
        } finally {
            setSolvingId(null);
        }
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

    if (!chapter) return null;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Navbar />

            <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
                <div className="mb-12">
                    <Link href={`/courses/${chapter.course_id}`} className="text-gray-400 hover:text-white transition flex items-center gap-2 mb-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Course
                    </Link>
                    <h1 className="text-4xl font-bold mb-4">{chapter.title}</h1>
                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">Progress:</span>
                            <span className="text-blue-400 font-bold">
                                {solvedProblems.size} / {chapter.problems.length} Solved
                            </span>
                        </div>
                        <div className="h-2 flex-grow bg-gray-800 rounded-full overflow-hidden max-w-xs">
                            <div
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${(solvedProblems.size / chapter.problems.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {chapter.problems.map((problem) => (
                        <div
                            key={problem.id}
                            className={`bg-gray-800/50 p-6 rounded-2xl border transition-all flex items-center justify-between gap-6 ${solvedProblems.has(problem.id) ? 'border-green-500/30' : 'border-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-6 flex-grow">
                                <button
                                    onClick={() => handleToggleSolve(problem.id)}
                                    disabled={solvingId === problem.id}
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition shrink-0 ${solvedProblems.has(problem.id)
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-gray-600 hover:border-blue-500'
                                        }`}
                                >
                                    {solvingId === problem.id ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : solvedProblems.has(problem.id) ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : null}
                                </button>

                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold truncate">{problem.title}</h3>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                                            problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                                'bg-red-500/10 text-red-500'
                                            }`}>
                                            {problem.difficulty}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{problem.platform}</span>
                                        <span className="text-gray-700">•</span>
                                        <div className="flex gap-2">
                                            {problem.tags.map(tag => (
                                                <span key={tag} className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <a
                                href={problem.leetcode_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-xl transition shrink-0"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
