import Link from 'next/link';

interface CourseProgressProps {
    courses: {
        id: string;
        title: string;
        percentage: number;
        solved: number;
        totalProblems: number;
    }[];
}

export default function CourseProgress({ courses }: CourseProgressProps) {
    if (courses.length === 0) {
        return (
            <div className="bg-gray-800/30 p-8 rounded-3xl border border-gray-700 text-center">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold mb-2">Start a Course</h3>
                <p className="text-gray-400 text-sm mb-6">You haven't started any courses yet.</p>
                <Link href="/courses" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition">
                    Browse Catalog
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-800/30 p-8 rounded-3xl border border-gray-700">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">🚀</span>
                Active Courses
            </h2>
            <div className="space-y-4">
                {courses.map(course => (
                    <div key={course.id} className="group p-4 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-gray-600 transition">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-sm text-gray-200">{course.title}</h3>
                            <span className="text-xs font-mono text-gray-500">{course.solved}/{course.totalProblems}</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                                style={{ width: `${course.percentage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-end">
                            <Link
                                href={`/course/${course.id}`}
                                className="text-[10px] uppercase font-bold tracking-wider text-blue-400 group-hover:text-blue-300 transition flex items-center gap-1"
                            >
                                Continue <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
