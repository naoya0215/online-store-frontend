import { ReactNode } from 'react';
import Header from '@/components/Header';
import Menu from '@/components/Menu';
import AuthGuard from '@/components/AuthGuard';

// childrenプロパティは、このレイアウト内でレンダリングされる子要素（各ページのコンテンツ）を指します。
interface DashboardLayoutProps {
    children: ReactNode;
}

export default function dashboardLayout ({ children }: DashboardLayoutProps) {
    return (
        <AuthGuard>
            <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
                <Header />
                <div className="flex flex-1 min-h-0">
                    <aside className="w-64 bg-white shadow-sm flex-shrink-0">
                        <Menu />
                    </aside>
                    <main className="flex-1 min-h-0 overflow-auto">
                        <div className="h-full p-4">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}