'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Contact, Pagination, SearchFilters } from './types/contact';

const CATEGORIES = {
    product: '商品について',
    order: '注文について',
    shipping: '配送について',
    payment: 'お支払いについて',
    return: '返品・交換について',
    technical: '技術的な問題',
    other: 'その他',
};

export default function ContactsPage() {
    const router = useRouter();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // 検索フィルター
    const [filters, setFilters] = useState<SearchFilters>({
        name: '',
        email: '',
        category: '',
        date_from: '',
        date_to: '',
    });

    // お問い合わせ取得
    const fetchContacts = useCallback(async (page: number = currentPage, searchFilters: SearchFilters = filters) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('per_page', '10');
            
            Object.entries(searchFilters).forEach(([key, value]) => {
                if (value && value.toString().trim() !== '') {
                    params.append(key, value.toString());
                }
            });
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/contacts?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('お問い合わせデータの取得に失敗');
            }

            const data = await response.json();
            
            if (data.success) {
                setContacts(data.contacts || []);
                setPagination(data.pagination);
            } else {
                throw new Error(data.message || 'お問い合わせデータの取得に失敗しました');
            }
        } catch (error) {
            console.error('お問い合わせデータの取得エラー:', error);
            setError(error instanceof Error ? error.message : 'お問い合わせデータの取得に失敗しました');
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters]);

    // 検索実行
    const handleSearch = useCallback(() => {
        setCurrentPage(1);
        fetchContacts(1, filters);
    }, [filters, fetchContacts]);

    // 検索条件リセット
    const handleReset = useCallback(() => {
        const resetFilters = {
            name: '',
            email: '',
            category: '',
            date_from: '',
            date_to: '',
        };
        setFilters(resetFilters);
        setCurrentPage(1);
        fetchContacts(1, resetFilters);
    }, [fetchContacts]);

    // ページ変更
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        fetchContacts(page, filters);
    }, [filters, fetchContacts]);

    // フィルター値変更
    const handleFilterChange = (key: keyof SearchFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // 詳細表示
    const handleShowDetail = (contact: Contact) => {
        setSelectedContact(contact);
        setShowDetailModal(true);
    };

    // 削除
    const handleDelete = async (id: number) => {
        if (!confirm('このお問い合わせを削除してもよろしいですか？')) {
            return;
        }

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/contacts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                alert('お問い合わせを削除しました');
                fetchContacts();
            } else {
                throw new Error(data.message || '削除に失敗しました');
            }
        } catch (error) {
            console.error('削除エラー:', error);
            alert('削除に失敗しました');
        }
    };

    useEffect(() => {
        fetchContacts(1);
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getCategoryName = (category: string) => {
        return CATEGORIES[category as keyof typeof CATEGORIES] || category;
    };

    // ページネーション
    const renderPagination = () => {
        if (!pagination || pagination.last_page <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        const half = Math.floor(maxVisiblePages / 2);
        
        let start = Math.max(1, currentPage - half);
        let end = Math.min(pagination.last_page, start + maxVisiblePages - 1);
        
        if (end - start < maxVisiblePages - 1) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        if (currentPage > 1) {
            pages.push(
                <button
                    key="prev"
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
                >
                    前へ
                </button>
            );
        }

        for (let i = start; i <= end; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 text-sm font-medium border ${
                        i === currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {i}
                </button>
            );
        }

        if (currentPage < pagination.last_page) {
            pages.push(
                <button
                    key="next"
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
                >
                    次へ
                </button>
            );
        }

        return (
            <div className="flex items-center justify-between px-4 py-3 mb-8 bg-white border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            <span className="font-medium">{pagination.from}</span> - <span className="font-medium">{pagination.to}</span> 件目 / 全 <span className="font-medium">{pagination.total}</span> 件
                        </p>
                    </div>
                    <div className="flex">{pages}</div>
                </div>
            </div>
        );
    };

    if (loading && contacts.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">{error}</p>
                <button 
                    onClick={() => fetchContacts()}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    再試行
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ページヘッダー */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">お問い合わせ管理</h1>
            </div>

            {/* 検索フォーム */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* お名前 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
                            <input
                                type="text"
                                value={filters.name}
                                onChange={(e) => handleFilterChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="お名前で検索"
                            />
                        </div>

                        {/* メールアドレス */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                            <input
                                type="email"
                                value={filters.email}
                                onChange={(e) => handleFilterChange('email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="メールアドレスで検索"
                            />
                        </div>

                        {/* カテゴリー */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリー</label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">すべてのカテゴリー</option>
                                {Object.entries(CATEGORIES).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 期間 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">受付日（開始）</label>
                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">受付日（終了）</label>
                            <input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 検索ボタン */}
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        リセット
                    </button>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        検索
                    </button>
                </div>
            </div>

            {/* お問い合わせ一覧 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">受付日時</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">お名前</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">メールアドレス</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">電話番号</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">カテゴリー</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {contacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(contact.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {contact.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {contact.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {contact.phone || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {getCategoryName(contact.category)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleShowDetail(contact)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            >
                                                詳細
                                            </button>
                                            <button
                                                onClick={() => handleDelete(contact.id)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                            >
                                                削除
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {contacts.length === 0 && (
                        <div className="text-center py-12">
                            <h3 className="mt-2 text-sm font-medium text-gray-900">お問い合わせがありません</h3>
                        </div>
                    )}
                </div>
                {renderPagination()}
            </div>

            {/* 詳細モーダル */}
            {showDetailModal && selectedContact && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">お問い合わせ詳細</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">受付日時</label>
                                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedContact.created_at)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">お名前</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedContact.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedContact.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">電話番号</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedContact.phone || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">カテゴリー</label>
                                <p className="mt-1 text-sm text-gray-900">{getCategoryName(selectedContact.category)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">お問い合わせ内容</label>
                                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}