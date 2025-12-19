import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from "jwt-decode";
import apiClient from '../api/axios';
import { type User, type LoginResponse } from '../features/auth/types.ts';

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Funkcja pomocnicza do dekodowania tokena
    const handleToken = (token: string) => {
        try {
            const decoded = jwtDecode<User>(token);
            // Sprawdź czy token nie wygasł
            if (decoded.exp * 1000 < Date.now()) {
                logout();
                return;
            }
            setUser({ ...decoded, role: decoded.role || (decoded as any).authorities?.[0] });
            localStorage.setItem('token', token);
        } catch (error) {
            console.error("Błąd dekodowania tokena", error);
            logout();
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            handleToken(token);
        }
        setIsLoading(false);
    }, []);

    const login = (token: string) => {
        handleToken(token);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        // Opcjonalnie: przekierowanie
        window.location.href = '/login'; 
    };

    const isAdmin = user?.role === 'ADMIN' || (user as any)?.role === 'ROLE_ADMIN';

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, isAdmin }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};