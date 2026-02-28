'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Admin {
    id: number;
    name: string;
    email: string;
}

interface DashboardStats {
    memberCount: number;
    todayNewMembers: number;
    todayOrders: number;
    inquiries: number;
}

interface MonthlyOrderData {
    date: string;
    orders: number;
}

interface WeeklyOrderData {
    week: string;
    orders: number;
}

interface TopProduct {
    rank: number;
    name: string;
    points: number;
}

interface StockProduct {
    name: string;
}

export default function DashboardPage() {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true);

    // ダッシュボード統計データ
    const [stats] = useState<DashboardStats>({
        memberCount: 156789,
        todayNewMembers: 23,
        todayOrders: 45,
        inquiries: 12,
    });

    // 月間受注状況データ
    const [monthlyData] = useState<MonthlyOrderData[]>([
        { date: '2023/01', orders: 4800 },
        { date: '2023/02', orders: 4200 },
        { date: '2023/03', orders: 4000 },
        { date: '2023/04', orders: 3800 },
        { date: '2023/05', orders: 3900 },
        { date: '2023/06', orders: 3600 },
        { date: '2023/07', orders: 3500 },
        { date: '2023/08', orders: 3700 },
        { date: '2023/09', orders: 3800 },
        { date: '2023/10', orders: 3900 },
        { date: '2023/11', orders: 4000 },
        { date: '2023/12', orders: 4100 },
    ]);

    // 週間受注状況データ
    const [weeklyData] = useState<WeeklyOrderData[]>([
        { week: '2025/05/01', orders: 1200 },
        { week: '2025/05/02', orders: 2100 },
        { week: '2025/05/03', orders: 1700 },
        { week: '2025/05/04', orders: 1300 },
        { week: '2025/05/05', orders: 2000 },
        { week: '2025/05/06', orders: 2200 },
        { week: '2025/05/07', orders: 2500 },
        { week: '2025/05/08', orders: 2400 },
        { week: '2025/05/09', orders: 2700 },
    ]);

    // 今日の売れ筋トップ
    const [topProducts] = useState<TopProduct[]>([
        { rank: 1, name: 'スマートフォン XR-123', points: 1250 },
        { rank: 2, name: 'ワイヤレスイヤホン Pro', points: 980 },
        { rank: 3, name: 'ランニングシューズ Elite', points: 750 },
    ]);

    // 在庫情報　// ここは5件までとする
    const [outOfStockProducts] = useState<StockProduct[]>([
        { name: 'ゲーミングキーボード RGB' },
        { name: 'ワイヤレスマウス Pro' },
        { name: 'モニタースタンド調整式' },
        { name: 'USB-Cハブ 7in1' },
        { name: 'スマートウォッチ Sport' },
    ]);

    const [lowStockProducts] = useState<StockProduct[]>([
        { name: 'Bluetoothスピーカー防水' },
        { name: 'ノートパソコンスタンド' },
        { name: 'ワイヤレス充電器 15W' },
        { name: 'フィットネストラッカー' },
        { name: 'ポータブルSSD 1TB' },
    ]);

    useEffect(() => {
        // ユーザー情報取得（認証チェックはAuthGuardで行われる）
        const adminStr = localStorage.getItem('admin') || sessionStorage.getItem('admin');
        if (adminStr) {
            try {
                const adminData = JSON.parse(adminStr);
                setAdmin(adminData);
            } catch (error) {
                console.error('ユーザー情報の解析エラー:', error);
            }
        }
        setLoading(false);
    }, []);

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('ja-JP').format(num);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!admin) {
        return null;
    }

    return (
        <div className="flex-1 min-h-0 space-y-4">
            {/* 上段のレイアウト */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 月間受注状況グラフ */}
                <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">月間受注状況</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 10 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Line 
                                    type="monotone" 
                                    dataKey="orders" 
                                    stroke="#3b82f6" 
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 統計カード群 */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    {/* 会員人数 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">会員人数</h4>
                        <p className="text-xs text-gray-400 mb-4">成長する顧客基盤の総数</p>
                        <div className="flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full border-4 border-gray-200 flex items-center justify-center">
                                <span className="text-xl font-bold text-gray-900">{formatNumber(stats.memberCount)}</span>
                            </div>
                            <span className="ml-2 text-sm text-gray-600">件</span>
                        </div>
                    </div>

                    {/* 本日入会人数 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">本日入会人数</h4>
                        <p className="text-xs text-gray-400 mb-4">今日の新規参加者数</p>
                        <div className="flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full border-4 border-green-200 flex items-center justify-center">
                                <span className="text-xl font-bold text-green-600">{stats.todayNewMembers}</span>
                            </div>
                            <span className="ml-2 text-sm text-gray-600">件</span>
                        </div>
                    </div>

                    {/* 本日の注文数 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">本日の注文数</h4>
                        <p className="text-xs text-gray-400 mb-4">本日の売上貢献指標</p>
                        <div className="flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full border-4 border-blue-200 flex items-center justify-center">
                                <span className="text-xl font-bold text-blue-600">{stats.todayOrders}</span>
                            </div>
                            <span className="ml-2 text-sm text-gray-600">件</span>
                        </div>
                    </div>

                    {/* 問い合わせ件数 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">問い合わせ件数</h4>
                        <p className="text-xs text-gray-400 mb-4">顧客サポートの需要状況</p>
                        <div className="flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full border-4 border-orange-200 flex items-center justify-center">
                                <span className="text-xl font-bold text-orange-600">{stats.inquiries}</span>
                            </div>
                            <span className="ml-2 text-sm text-gray-600">件</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 下段のレイアウト */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 週間受注状況 */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">週間受注状況</h3>
                        <div className="flex items-center mt-2">
                            <span className="text-sm text-gray-500">期間選択: </span>
                            <select className="ml-2 text-sm border border-gray-300 rounded px-2 py-1">
                                <option>2025/05/01 ～ 2025/05/07</option>
                            </select>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">単位: 円　2020/05/01 - 2020/05/20 の売上(円)</div>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="week" 
                                    tick={{ fontSize: 10 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Bar dataKey="orders" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 今日の売れ筋トップ */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">今日の売れ筋トップ</h3>
                    <div className="space-y-3">
                        {topProducts.map((product) => (
                            <div key={product.rank} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    {product.rank === 1 && (
                                        <span className="text-2xl mr-2">👑</span>
                                    )}
                                    <span className="text-sm font-medium text-gray-700">
                                        {product.rank}位
                                    </span>
                                    <span className="ml-3 text-sm text-gray-900">{product.name}</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 mr-1"></div>
                                    <span className="text-sm text-gray-600">{product.points}点</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 在庫情報 */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">在庫情報</h3>
                    
                    {/* 在庫切れ商品 */}
                    <div>
                        <h4 className="text-sm font-medium text-red-600 mb-3">在庫切れ商品</h4>
                        <div className="space-y-2">
                            {outOfStockProducts.map((product, index) => (
                                <div key={index} className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                                    <span className="text-sm text-gray-700">{product.name}</span>
                                    <span className="text-xs text-red-600 font-medium">在庫切れ</span>
                                </div>
                            ))}
                        </div>
                        
                        {/* ページネーション */}
                        <div className="flex items-center justify-center mt-4 space-x-1">
                            <button className="w-7 h-7 text-xs border rounded hover:bg-gray-100 flex items-center justify-center">‹</button>
                            <span className="text-xs text-gray-500 px-2">01</span>
                            <button className="w-7 h-7 text-xs bg-blue-500 text-white rounded flex items-center justify-center">02</button>
                            <span className="text-xs text-gray-500 px-1">03</span>
                            <span className="text-xs text-gray-500 px-1">04</span>
                            <span className="text-xs text-gray-500 px-1">05</span>
                            <span className="text-xs text-gray-500 px-1">06</span>
                            <button className="w-7 h-7 text-xs border rounded hover:bg-gray-100 flex items-center justify-center">›</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}