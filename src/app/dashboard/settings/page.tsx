'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
    name: string;
    email: string;
}

interface PasswordForm {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
    });

    const [passwordForm, setPasswordForm] = useState<PasswordForm>({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('プロフィール情報の取得に失敗');
            }

            const data = await response.json();
            
            if (data.success) {
                setProfile({
                    name: data.user.name,
                    email: data.user.email,
                });
            }
        } catch (error) {
            console.error('プロフィール取得エラー:', error);
            setMessage({ type: 'error', text: 'プロフィール情報の取得に失敗しました' });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profile),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage({ type: 'success', text: 'プロフィールを更新しました' });
            } else {
                throw new Error(data.message || 'プロフィールの更新に失敗しました');
            }
        } catch (error) {
            console.error('プロフィール更新エラー:', error);
            setMessage({ 
                type: 'error', 
                text: error instanceof Error ? error.message : 'プロフィールの更新に失敗しました' 
            });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            setMessage({ type: 'error', text: '新しいパスワードが一致しません' });
            setSaving(false);
            return;
        }

        if (passwordForm.new_password.length < 8) {
            setMessage({ type: 'error', text: 'パスワードは8文字以上で入力してください' });
            setSaving(false);
            return;
        }

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(passwordForm),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage({ type: 'success', text: 'パスワードを変更しました' });
                setPasswordForm({
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: '',
                });
            } else {
                throw new Error(data.message || 'パスワードの変更に失敗しました');
            }
        } catch (error) {
            console.error('パスワード変更エラー:', error);
            setMessage({ 
                type: 'error', 
                text: error instanceof Error ? error.message : 'パスワードの変更に失敗しました' 
            });
        } finally {
            setSaving(false);
        }
    };

    const handleProfileChange = (field: keyof UserProfile, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handlePasswordChange = (field: keyof PasswordForm, value: string) => {
        setPasswordForm(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">設定</h1>
            </div>

            {message && (
                <div className={`rounded-md p-4 ${
                    message.type === 'success' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                }`}>
                    <p className={`text-sm ${
                        message.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                        {message.text}
                    </p>
                </div>
            )}

            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 ${
                                activeTab === 'profile'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            プロフィール
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 ${
                                activeTab === 'password'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            パスワード変更
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    お名前
                                </label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => handleProfileChange('name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    メールアドレス
                                </label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => handleProfileChange('email', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                >
                                    {saving ? '保存中...' : '保存する'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-2xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    現在のパスワード
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.current_password}
                                    onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    新しいパスワード
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.new_password}
                                    onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    minLength={8}
                                />
                                <p className="mt-1 text-sm text-gray-500">8文字以上で入力してください</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    新しいパスワード（確認）
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.new_password_confirmation}
                                    onChange={(e) => handlePasswordChange('new_password_confirmation', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    minLength={8}
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                >
                                    {saving ? '変更中...' : 'パスワードを変更'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">アカウント情報</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">ログインメールアドレス</span>
                        <span className="font-medium">{profile.email}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-500">アカウント名</span>
                        <span className="font-medium">{profile.name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}