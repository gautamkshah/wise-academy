'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface User extends FirebaseUser {
    role?: 'USER' | 'ADMIN';
    id?: string;
    name?: string;
    photo?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const syncWithBackend = async (firebaseUser: FirebaseUser) => {
        try {
            const token = await firebaseUser.getIdToken();
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            if (response.ok) {
                const data = await response.json();
                setUser({ ...firebaseUser, ...data.user });
            } else {
                setUser(firebaseUser);
            }
        } catch (error) {
            console.error('Failed to sync with backend:', error);
            setUser(firebaseUser);
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        if (auth.currentUser) {
            await syncWithBackend(auth.currentUser);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                syncWithBackend(firebaseUser);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
