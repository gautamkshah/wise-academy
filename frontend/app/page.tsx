import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <main className="flex flex-col items-center justify-center text-center mt-20 px-4">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-sm font-medium">
                    🚀 The Ultimate Coding Platform
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                    Master <span className="text-blue-500">DSA</span> & <br />
                    Crack <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Top Companies</span>
                </h1>
                <p className="max-w-2xl text-lg text-gray-400 mb-10 leading-relaxed">
                    Join <b>1000+ students</b> mastering Data Structures, Algorithms, and System Design.
                    Track your progress across LeetCode, CodeForces, and CodeChef in one place.
                </p>
                <div className="flex gap-4">
                    <Link href="/courses" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105">
                        Start Learning
                    </Link>
                    <Link href="/leaderboard" className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-bold text-lg transition-all">
                        View Leaderboard
                    </Link>
                </div>

                {/* Stats / Social Proof */}
                <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 text-center opacity-80">
                    <div>
                        <div className="text-3xl font-bold text-white">450+</div>
                        <div className="text-sm text-gray-500 mt-1">Curated Problems</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">1000+</div>
                        <div className="text-sm text-gray-500 mt-1">Active Students</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">50+</div>
                        <div className="text-sm text-gray-500 mt-1">Top Placements</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">Daily</div>
                        <div className="text-sm text-gray-500 mt-1">Live Updates</div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-40 border-t border-gray-800 py-12 text-center text-gray-500">
                <p>© 2025 WiseAcademy. Built for scale.</p>
            </footer>
        </div>
    );
}
