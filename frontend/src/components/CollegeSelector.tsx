'use client';

import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../lib/config';

interface College {
    id: string;
    name: string;
}

interface CollegeSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function CollegeSelector({ value, onChange }: CollegeSelectorProps) {
    const [query, setQuery] = useState('');
    const [colleges, setColleges] = useState<College[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isCustom, setIsCustom] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // If initial value exists and is not in the list (or we haven't fetched), 
        // we might want to set query to it. But for now simplified.
        if (value) {
            setQuery(value);
            // Check if it looks like a custom entry (simplified logic)
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchColleges = async (search: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/colleges?q=${search}`);
            if (res.ok) {
                const data = await res.json();
                setColleges(data);
            }
        } catch (error) {
            console.error('Failed to fetch colleges', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setQuery(newVal);
        setIsCustom(false);
        setIsOpen(true);
        onChange(newVal); // Propagate change immediately for custom typing

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchColleges(newVal);
        }, 300);
        return () => clearTimeout(timeoutId);
    };

    const handleSelect = (collegeName: string) => {
        setQuery(collegeName);
        onChange(collegeName);
        setIsOpen(false);
        setIsCustom(collegeName === 'Other');
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-gray-400 text-sm mb-2">College / University</label>
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => { setIsOpen(true); fetchColleges(''); }}
                placeholder="Search for your college..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                    ) : colleges.length > 0 ? (
                        <>
                            {colleges.map((college) => (
                                <div
                                    key={college.id}
                                    onClick={() => handleSelect(college.name)}
                                    className="px-4 py-3 hover:bg-gray-700 cursor-pointer text-sm transition"
                                >
                                    {college.name}
                                </div>
                            ))}
                            <div
                                onClick={() => handleSelect('Other')}
                                className="px-4 py-3 hover:bg-gray-700 cursor-pointer text-sm text-blue-400 border-t border-gray-700 font-bold"
                            >
                                Other (Type manually)
                            </div>
                        </>
                    ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            No matches found.
                            <button onClick={() => setIsOpen(false)} className="text-blue-400 ml-1 hover:underline">
                                Type manually
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isCustom && (
                <p className="text-xs text-yellow-500 mt-2">
                    Selected "Other". Please type your college name fully above.
                </p>
            )}
        </div>
    );
}
