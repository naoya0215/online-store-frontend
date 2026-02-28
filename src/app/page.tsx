'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        // ログイン状態チェック
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (token) {
        // ログイン済み → ダッシュボードへ
        router.push('/dashboard');
        } else {
        // 未ログイン → ログインページへ
        router.push('/auth/login');
        }
    }, [router]);

    // リダイレクト中の表示
    return (
        <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
}

// 使用シーン
// シーン1: 初回アクセス
// ユーザーがブラウザで localhost:3000/ を開く
// ↓
// page.tsx が実行される
// ↓
// トークンなし → /auth/login へリダイレクト
// シーン2: ログイン済みユーザー
// ログイン済みユーザーが localhost:3000/ を開く
// ↓
// page.tsx が実行される
// ↓
// トークンあり → /dashboard へリダイレクト
// シーン3: ブックマークや直接アクセス
// ユーザーがルートURLをブックマークして再訪問
// ↓
// 認証状態をチェックして適切なページに誘導