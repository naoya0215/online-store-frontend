'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product, Category, Pagination, SearchFilters} from './types/product';
import Link from 'next/link';

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // 検索フィルター
    const [filters, setFilters] = useState<SearchFilters>({
        name: '',
        category_id: '',
        min_price: '',
        max_price: '',
        min_stock: '',
        max_stock: '',
        is_selling: ''
    });

    // 編集画面へ遷移
    const handleEdit = (productId: number) => {
        router.push(`/dashboard/products/${productId}/edit`);
    };

    // カテゴリー取得
    const fetchCategories = useCallback(async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCategories(data.categories || []);
                }
            }
        } catch (error) {
            console.error('カテゴリーデータの取得エラー:', error);
        }
    }, []);

    // 商品取得（検索・ページネーション対応）
    const fetchProducts = useCallback(async (page: number = currentPage, searchFilters: SearchFilters = filters) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            // クエリパラメータの構築
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('per_page', '10');
            
            // 検索条件を追加
            Object.entries(searchFilters).forEach(([key, value]) => {
                if (value && value.toString().trim() !== '') {
                    params.append(key, value.toString());
                }
            });
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('商品データの取得に失敗');
            }

            const data = await response.json();
            
            if (data.success) {
                setProducts(data.products || []);
                setPagination(data.pagination);
            } else {
                throw new Error(data.message || '商品データの取得に失敗しました');
            }
        } catch (error) {
            console.error('商品データの取得エラー:', error);
            setError(error instanceof Error ? error.message : '商品データの取得に失敗しました');
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters]);

    // 検索実行
    const handleSearch = useCallback(() => {
        setCurrentPage(1);
        fetchProducts(1, filters);
    }, [filters, fetchProducts]);

    // 検索条件リセット
    const handleReset = useCallback(() => {
        const resetFilters = {
            name: '',
            category_id: '',
            min_price: '',
            max_price: '',
            min_stock: '',
            max_stock: '',
            is_selling: ''
        };
        setFilters(resetFilters);
        setCurrentPage(1);
        fetchProducts(1, resetFilters);
    }, [fetchProducts]);

    // ページ変更
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        fetchProducts(page, filters);
    }, [filters, fetchProducts]);

    // フィルター値変更
    const handleFilterChange = (key: keyof SearchFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts(1);
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY'
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ja-JP');
    };

    const getImageUrl = (imagePath: string | null) => {
        // バックエンドから完全なURLが返されるため、そのまま使用
        return imagePath;
    };

    // ページネーションコンポーネント
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

        // 前へボタン
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

        // ページ番号
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

        // 次へボタン
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
                <div className="flex justify-between flex-1 sm:hidden">
                    {currentPage > 1 && (
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            前へ
                        </button>
                    )}
                    {currentPage < pagination.last_page && (
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            次へ
                        </button>
                    )}
                </div>
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

    if (loading) {
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
                    onClick={() => fetchProducts()}
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
                <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <Link href="/dashboard/products/create">
                        新規商品追加
                    </Link>
                </button>
            </div>

            {/* 検索フォーム */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4 space-y-4">
                    {/* 商品名とカテゴリーの行 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 商品名 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">商品名</label>
                            <input
                                type="text"
                                value={filters.name}
                                onChange={(e) => handleFilterChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="商品名で検索"
                            />
                        </div>

                        {/* カテゴリー */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリー</label>
                            <select
                                value={filters.category_id}
                                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">すべてのカテゴリー</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 価格と在庫の範囲入力の行 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 価格範囲 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">価格</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    value={filters.min_price}
                                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="最小価格"
                                    min="0"
                                />
                                <span className="text-gray-500">〜</span>
                                <input
                                    type="number"
                                    value={filters.max_price}
                                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="最大価格"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* 在庫範囲 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">在庫</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    value={filters.min_stock}
                                    onChange={(e) => handleFilterChange('min_stock', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="在庫下限"
                                    min="0"
                                />
                                <span className="text-gray-500">〜</span>
                                <input
                                    type="number"
                                    value={filters.max_stock}
                                    onChange={(e) => handleFilterChange('max_stock', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="在庫上限"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 販売状況 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">販売状況</label>
                        <div className="flex items-center space-x-4 mt-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="is_selling"
                                    value=""
                                    checked={filters.is_selling === ''}
                                    onChange={(e) => handleFilterChange('is_selling', e.target.value)}
                                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-3 text-lg">すべて</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="is_selling"
                                    value="1"
                                    checked={filters.is_selling === '1'}
                                    onChange={(e) => handleFilterChange('is_selling', e.target.value)}
                                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-3 text-lg">販売中</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="is_selling"
                                    value="0"
                                    checked={filters.is_selling === '0'}
                                    onChange={(e) => handleFilterChange('is_selling', e.target.value)}
                                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-3 text-lg">準備中</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* 検索ボタン */}
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
                    >
                        リセット
                    </button>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200 flex items-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>検索中...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span>検索</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 商品一覧 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">画像</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品名</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">価格</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">在庫数</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">販売ステータス</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">更新日</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => {
                                const imageUrl = getImageUrl(product.image_path);
                                
                                return (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        {/* 画像 */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-24 h-24 relative">
                                                {imageUrl ? (
                                                    <Image
                                                        src={imageUrl}
                                                        alt={product.name}
                                                        fill
                                                        sizes="64px"
                                                        className="object-cover rounded-md"
                                                        onError={(e) => {
                                                            // 画像読み込みエラー時の処理
                                                            console.error('画像読み込みエラー:', imageUrl);
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* 商品名 */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            <div className="text-sm text-gray-500 max-w-xs truncate">{product.description}</div>
                                        </td>

                                        {/* カテゴリ */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.category_name || '-'}
                                        </td>

                                        {/* 価格 */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {formatPrice(product.price)}
                                        </td>

                                        {/* 在庫数 */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-900">{product.stock_quantity || 0}</span>
                                            </div>
                                        </td>

                                        {/* 販売ステータス */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                product.is_selling 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {product.is_selling ? '販売中' : '準備中'}
                                            </span>
                                        </td>

                                        {/* 更新日 */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(product.updated_at)}
                                        </td>

                                        {/* 操作 */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button 
                                                    onClick={() => handleEdit(product.id)}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                                    >
                                                    編集
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {products.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v4M6 13h2" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">商品がありません</h3>
                        </div>
                    )}
                </div>
                {/* ページネーション */}
                {renderPagination()}
            </div>
        </div>
    );
}