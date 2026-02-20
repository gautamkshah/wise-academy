'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
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

    if (user) {
        navLinks.push({ name: 'Profile', href: '/profile' });
        navLinks.push({ name: 'Connect', href: '/connect' });
    }

    return (
        <nav className="bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        WiseAcad
                    </Link>

                    {/* Desktop Menu */}
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

                    <div className="hidden md:block">
                        <Link
                            href={user ? "/dashboard" : "/login"}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-6 rounded-full transition shadow-lg shadow-blue-600/20"
                        >
                            {user ? 'Dashboard' : 'Login'}
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-400 hover:text-white transition"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Dropdown */}
                {isOpen && (
                    <div className="md:hidden mt-4 pb-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`text-sm font-bold uppercase tracking-widest transition px-2 py-1 ${pathname === link.href ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            href={user ? "/dashboard" : "/login"}
                            onClick={() => setIsOpen(false)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-6 rounded-xl transition text-center shadow-lg shadow-blue-600/20"
                        >
                            {user ? 'Dashboard' : 'Login'}
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
