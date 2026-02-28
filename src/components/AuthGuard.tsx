'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
    children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
            setIsAuthenticated(false);
            router.push('/auth/login');
            return;
        }

        setIsAuthenticated(true);
    }, [router]);

    // 認証チェック中はローディング表示
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">認証確認中...</p>
                </div>
            </div>
        );
    }

    // 認証されていない場合は何も表示しない（リダイレクト中）
    if (!isAuthenticated) {
        return null;
    }

    // 認証済みの場合のみ子コンポーネントを表示
    return <>{children}</>;
}