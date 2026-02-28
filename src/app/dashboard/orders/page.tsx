'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Order, Pagination, SearchFilters } from './types/order';


const PAYMENT_METHODS = {
    credit: 'クレジットカード',
    bank: '銀行振込',
    cod: '代金引換',
};

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [filters, setFilters] = useState<SearchFilters>({
        customer_name: '',
        customer_email: '',
        payment_method: '',
        date_from: '',
        date_to: '',
    });

    const fetchOrders = useCallback(async (page: number = currentPage, searchFilters: SearchFilters = filters) => {
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
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('注文データの取得に失敗');
            }

            const data = await response.json();
            
            if (data.success) {
                setOrders(data.orders || []);
                setPagination(data.pagination);
            } else {
                throw new Error(data.message || '注文データの取得に失敗しました');
            }
        } catch (error) {
            console.error('注文データの取得エラー:', error);
            setError(error instanceof Error ? error.message : '注文データの取得に失敗しました');
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters]);

    const handleSearch = useCallback(() => {
        setCurrentPage(1);
        fetchOrders(1, filters);
    }, [filters, fetchOrders]);

    const handleReset = useCallback(() => {
        const resetFilters = {
            customer_name: '',
            customer_email: '',
            payment_method: '',
            date_from: '',
            date_to: '',
        };
        setFilters(resetFilters);
        setCurrentPage(1);
        fetchOrders(1, resetFilters);
    }, [fetchOrders]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        fetchOrders(page, filters);
    }, [filters, fetchOrders]);

    const handleFilterChange = (key: keyof SearchFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleShowDetail = async (order: Order) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${order.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            
            if (data.success) {
                setSelectedOrder(data.order);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('注文詳細の取得エラー:', error);
            alert('注文詳細の取得に失敗しました');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('この注文を削除してもよろしいですか？')) {
            return;
        }

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                alert('注文を削除しました');
                fetchOrders();
            } else {
                throw new Error(data.message || '削除に失敗しました');
            }
        } catch (error) {
            console.error('削除エラー:', error);
            alert('削除に失敗しました');
        }
    };

    useEffect(() => {
        fetchOrders(1);
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY'
        }).format(price);
    };

    const getPaymentMethodName = (method: string) => {
        return PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS] || method;
    };

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

    if (loading && orders.length === 0) {
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
                    onClick={() => fetchOrders()}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    再試行
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">注文管理</h1>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
                            <input
                                type="text"
                                value={filters.customer_name}
                                onChange={(e) => handleFilterChange('customer_name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="お名前で検索"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                            <input
                                type="email"
                                value={filters.customer_email}
                                onChange={(e) => handleFilterChange('customer_email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="メールアドレスで検索"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">決済方法</label>
                            <select
                                value={filters.payment_method}
                                onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">すべての決済方法</option>
                                {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">注文日（開始）</label>
                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">注文日（終了）</label>
                            <input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

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

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注文番号</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注文日時</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">お名前</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">メールアドレス</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">決済方法</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">合計金額</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        No.{order.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(order.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.customer_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.customer_email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            {getPaymentMethodName(order.payment_method)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatPrice(order.total_amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleShowDetail(order)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            >
                                                詳細
                                            </button>
                                            <button
                                                onClick={() => handleDelete(order.id)}
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

                    {orders.length === 0 && (
                        <div className="text-center py-12">
                            <h3 className="mt-2 text-sm font-medium text-gray-900">注文がありません</h3>
                        </div>
                    )}
                </div>
                {renderPagination()}
            </div>

            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">注文詳細 No.{selectedOrder.id}</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">お客様情報</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">注文日時</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">お名前</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedOrder.customer_name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedOrder.customer_email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">電話番号</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedOrder.customer_phone}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">配送先情報</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">郵便番号</label>
                                    <p className="mt-1 text-sm text-gray-900">〒{selectedOrder.postal_code}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">住所</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedOrder.prefecture}{selectedOrder.city}{selectedOrder.address}
                                        {selectedOrder.building && ` ${selectedOrder.building}`}
                                    </p>
                                </div>
                                {selectedOrder.delivery_notes && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">配送メモ</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedOrder.delivery_notes}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">決済方法</label>
                                    <p className="mt-1 text-sm text-gray-900">{getPaymentMethodName(selectedOrder.payment_method)}</p>
                                </div>
                            </div>
                        </div>

                        {selectedOrder.items && selectedOrder.items.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-semibold text-lg border-b pb-2 mb-4">注文商品</h3>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">商品名</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">サイズ</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">単価</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">数量</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">小計</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedOrder.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-2 text-sm text-gray-900">{item.product_name}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">{item.size}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{formatPrice(item.unit_price)}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">{item.quantity}</td>
                                                <td className="px-4 py-2 text-sm font-medium text-gray-900">{formatPrice(item.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="mt-6 bg-gray-50 p-4 rounded">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>商品小計</span>
                                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>送料</span>
                                    <span>{formatPrice(selectedOrder.shipping_fee)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                                    <span>合計金額</span>
                                    <span>{formatPrice(selectedOrder.total_amount)}</span>
                                </div>
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