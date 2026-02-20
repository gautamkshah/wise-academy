import { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../../lib/config';
import { auth } from '../../lib/firebase';

interface CourseAnalyticsModalProps {
    courseId: string;
    courseTitle: string;
    onClose: () => void;
}

interface StudentProgress {
    userId: string;
    name: string;
    email: string;
    college: string | null;
    branch: string | null;
    year: number | null;
    roll_no: string | null;
    totalSolved: number;
    totalProblems: number;
    progressPercentage: number;
    chapterStats: {
        chapterId: string;
        chapterTitle: string;
        total: number;
        solved: number;
        percentage: number;
    }[];
}

type SortKey = 'name' | 'progressPercentage' | 'totalSolved' | 'year';

export default function CourseAnalyticsModal({ courseId, courseTitle, onClose }: CourseAnalyticsModalProps) {
    const [students, setStudents] = useState<StudentProgress[]>([]);
    const [loading, setLoading] = useState(true);

    // Server-side filters
    const [filters, setFilters] = useState({
        college: '',
        branch: '',
        year: ''
    });

    // Client-side range filters
    const [solvedRange, setSolvedRange] = useState({ min: '', max: '' });

    // Sorting state
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
        key: 'progressPercentage',
        direction: 'desc',
    });

    useEffect(() => {
        fetchAnalytics();
    }, [courseId]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const queryParams = new URLSearchParams();
            if (filters.college) queryParams.append('college', filters.college);
            if (filters.branch) queryParams.append('branch', filters.branch);
            if (filters.year) queryParams.append('year', filters.year);

            const res = await fetch(`${API_BASE_URL}/analytics/course/${courseId}?${queryParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            } else {
                console.error('Failed to fetch analytics');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSolvedRange({ ...solvedRange, [e.target.name]: e.target.value });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchAnalytics();
    };

    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    // Derived state: Filtered and Sorted Students
    const processedStudents = useMemo(() => {
        let result = [...students];

        // 1. Apply Solved Range Filter (Client-side)
        if (solvedRange.min !== '') {
            result = result.filter(s => s.totalSolved >= parseInt(solvedRange.min));
        }
        if (solvedRange.max !== '') {
            result = result.filter(s => s.totalSolved <= parseInt(solvedRange.max));
        }

        // 2. Apply Sorting
        result.sort((a, b) => {
            let aValue: any = a[sortConfig.key];
            let bValue: any = b[sortConfig.key];

            // Handle potential nulls for year
            if (sortConfig.key === 'year') {
                aValue = aValue || 0;
                bValue = bValue || 0;
            }

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [students, solvedRange, sortConfig]);

    // Statistics
    const averageProgress = students.length > 0
        ? Math.round(students.reduce((acc, s) => acc + s.progressPercentage, 0) / students.length)
        : 0;

    const maxSolved = students.length > 0
        ? Math.max(...students.map(s => s.totalSolved))
        : 0;

    const chapterHeaders = students.length > 0 ? students[0].chapterStats.map(c => c.chapterTitle) : [];

    const getChapterProgress = (student: StudentProgress, chapterTitle: string) => {
        const chapter = student.chapterStats.find(c => c.chapterTitle === chapterTitle);
        return chapter ? chapter.solved : '-';
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="bg-gray-900 w-full max-w-[95vw] h-[90vh] rounded-3xl border border-gray-700 flex flex-col shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-hidden">

                {/* 1. Header Section */}
                <div className="p-6 border-b border-gray-800 bg-gray-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            📊 {courseTitle} <span className="text-gray-500 text-lg font-normal">Analytics</span>
                        </h2>
                        <div className="flex gap-4 mt-2 text-sm text-gray-400">
                            <span>Students: <strong className="text-white">{students.length}</strong></span>
                            <span>Avg. Progress: <strong className="text-green-400">{averageProgress}%</strong></span>
                            <span>Max Solved: <strong className="text-blue-400">{maxSolved}</strong></span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition absolute top-4 right-4 md:static">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* 2. Controls Section */}
                <div className="p-4 sm:p-6 bg-gray-800/30 border-b border-gray-800 space-y-4">
                    <form onSubmit={handleSearch} className="flex flex-col xl:flex-row gap-4 xl:items-end">

                        {/* Core Filters */}
                        <div className="flex flex-wrap gap-3 flex-1">
                            <div className="flex-1 min-w-[140px]">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">College</label>
                                <input name="college" value={filters.college} onChange={handleFilterChange} placeholder="Filter College..." className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                            </div>
                            <div className="w-32">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Branch</label>
                                <input name="branch" value={filters.branch} onChange={handleFilterChange} placeholder="Branch" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                            </div>
                            <div className="w-24">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Year</label>
                                <input name="year" type="number" value={filters.year} onChange={handleFilterChange} placeholder="Year" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                            </div>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-bold text-sm transition h-[38px] mt-auto">Apply</button>
                        </div>

                        {/* Range Filters */}
                        <div className="flex flex-wrap items-end gap-3 border-l border-gray-700 pl-0 xl:pl-4">
                            <div className="w-24">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Min Solved</label>
                                <input name="min" type="number" value={solvedRange.min} onChange={handleRangeChange} placeholder="0" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-green-500 outline-none" />
                            </div>
                            <div className="text-gray-500 mb-2">-</div>
                            <div className="w-24">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Max Solved</label>
                                <input name="max" type="number" value={solvedRange.max} onChange={handleRangeChange} placeholder={maxSolved.toString()} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-green-500 outline-none" />
                            </div>
                        </div>
                    </form>
                </div>

                {/* 3. Data Table */}
                <div className="flex-grow overflow-auto bg-gray-900/50 relative">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : processedStudents.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <div className="text-4xl mb-4">📂</div>
                            <p>No students match your filters.</p>
                        </div>
                    ) : (
                        <div className="min-w-max"> {/* Container for horizontal scroll */}
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-900 text-xs uppercase tracking-wider text-gray-400 sticky top-0 z-30 shadow-lg">
                                    <tr>
                                        {/* Sticky First Column */}
                                        <th
                                            className="p-4 bg-gray-900 sticky left-0 z-40 border-b border-r border-gray-800 cursor-pointer hover:text-white transition w-[250px]"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Student Name
                                                {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                                            </div>
                                        </th>

                                        <th className="p-4 border-b border-gray-800 cursor-pointer hover:text-white transition w-[150px]" onClick={() => handleSort('year')}>
                                            <div className="flex items-center gap-1">
                                                Info
                                                {sortConfig.key === 'year' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                                            </div>
                                        </th>

                                        <th className="p-4 border-b border-gray-800 text-center cursor-pointer hover:text-white transition w-[150px]" onClick={() => handleSort('progressPercentage')}>
                                            <div className="flex items-center justify-center gap-1">
                                                Overall Progress
                                                {sortConfig.key === 'progressPercentage' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                                            </div>
                                        </th>

                                        <th className="p-4 border-b border-gray-800 text-center cursor-pointer hover:text-white transition w-[100px]" onClick={() => handleSort('totalSolved')}>
                                            <div className="flex items-center justify-center gap-1">
                                                Total
                                                {sortConfig.key === 'totalSolved' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                                            </div>
                                        </th>

                                        {/* Chapter Headers */}
                                        {chapterHeaders.map((ch, i) => (
                                            <th key={i} className="p-4 border-b border-gray-800 text-center min-w-[120px] whitespace-normal text-[10px] leading-tight text-gray-500">
                                                {ch}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-800 text-sm">
                                    {processedStudents.map((student) => (
                                        <tr key={student.userId} className="hover:bg-gray-800/40 transition group">

                                            {/* Sticky Name Column */}
                                            <td className="p-4 bg-gray-900/95 sticky left-0 z-20 border-r border-gray-800 group-hover:bg-gray-800 transition">
                                                <div className="font-bold text-white truncate max-w-[200px]" title={student.name}>{student.name}</div>
                                                <div className="text-[10px] text-gray-500 truncate max-w-[200px]">{student.email}</div>
                                            </td>

                                            <td className="p-4 text-gray-400">
                                                <div className="font-medium text-gray-300">{student.branch || '-'}</div>
                                                <div className="text-[10px] opacity-70">Year {student.year || '-'} • {student.college?.slice(0, 15)}...</div>
                                            </td>

                                            <td className="p-4 text-center">
                                                <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-1">
                                                    <div className="absolute top-0 left-0 h-full bg-blue-500" style={{ width: `${student.progressPercentage}%` }}></div>
                                                </div>
                                                <div className="text-xs font-bold text-blue-400">{Math.round(student.progressPercentage)}%</div>
                                            </td>

                                            <td className="p-4 text-center font-mono font-bold text-white">
                                                {student.totalSolved}
                                            </td>

                                            {/* Chapter Data */}
                                            {chapterHeaders.map((ch, i) => {
                                                const solved = getChapterProgress(student, ch);
                                                return (
                                                    <td key={i} className={`p-4 text-center border-l border-gray-800/30 ${solved === 0 ? 'text-gray-700' : 'text-gray-300'}`}>
                                                        {solved || '-'}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 4. Footer Legend */}
                <div className="p-4 border-t border-gray-800 bg-gray-900/80 text-[10px] text-gray-500 flex justify-between items-center">
                    <div>Showing {processedStudents.length} of {students.length} students</div>
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> High Activity</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-700"></span> No Activity</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
