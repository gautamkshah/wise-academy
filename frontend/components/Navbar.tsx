'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    // Force rebuild
    const pathname = usePathname();
    const { user } = useAuth();

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Courses', href: '/courses' },
        { name: 'Contests', href: '/contests' },
        { name: 'Leaderboard', href: '/leaderboard' },
        { name: 'Contact', href: '/contact' },
    ];

    if (user?.role === 'ADMIN') {
        navLinks.push({ name: 'Admin', href: '/admin' });
    }

    return (
        <nav className="bg-gray-900/50 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        WISEACADEMY
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-bold uppercase tracking-widest transition ${pathname === link.href ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <Link
                        href={user ? "/dashboard" : "/login"}
                        className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-6 rounded-full transition shadow-lg shadow-blue-600/20"
                    >
                        {user ? 'Dashboard' : 'Login'}
                    </Link>
                </div>
            </div>
        </nav>
    );
}
