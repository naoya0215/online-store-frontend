'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Admin {
    id: number;
    name: string;
    email: string;
}

export default function Header() {
    const router = useRouter();
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        // ユーザー情報を取得
        const adminStr = localStorage.getItem('admin') || sessionStorage.getItem('admin');
        if (adminStr) {
            try {
                const adminData = JSON.parse(adminStr);
                setAdmin(adminData);
            } catch (error) {
                console.error('ユーザー情報の解析エラー:', error);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('admin');
        router.push('/auth/login');
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-wide">
                            On-lineShop
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* 通知アイコン */}
                        <button className="p-2 text-gray-400 hover:text-gray-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>

                        {/* ユーザードロップダウン */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-medium">
                                        {admin?.name?.charAt(0).toUpperCase() || 'A'}
                                    </span>
                                </div>
                                <span className="text-gray-700 font-medium">
                                    {admin?.name || 'Admin'}
                                </span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                    <div className="py-1">
                                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                                            <div className="font-medium">{admin?.name}</div>
                                            <div className="text-gray-500">{admin?.email}</div>
                                        </div>
                                        <button
                                            onClick={() => {/* プロフィール編集機能 */}}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            プロフィール
                                        </button>
                                        <button
                                            onClick={() => {/* 設定機能 */}}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            設定
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            ログアウト
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}