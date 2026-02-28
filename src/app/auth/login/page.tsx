'use client'

import {useState} from 'react';
import {useRouter} from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberme: false,
    });

    const [errors, setErrors] = useState({
        email: '',
        password: '',
        general: '',
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // 入力時にエラーをクリア
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
                general: '',
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({ email: '', password: '', general: ''});

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });
            const data = await response.json();

            // バリデーションエラーの確認
            if (response.status === 422) {        
                const newErrors = { email: '', password: '', general: '' };
                if (data.errors.email) {
                    newErrors.email = data.errors.email[0];
                }
                if (data.errors.password) {
                    newErrors.password = data.errors.password[0];
                }
                setErrors(newErrors);
                return;
            }

            // 認証失敗によるエラーメッセージ
            if (response.status === 401) {
                setErrors({
                    email: '',
                    password: '',
                    general: data.message
                });
                return;
            }

            if (response.ok && data.success) {
                // トークン保存
                if (formData.rememberme) {
                    // "ログイン情報を保存"がチェックされている場合
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('admin', JSON.stringify(data.admin));
                } else {
                    // セッションストレージに保存（ブラウザ閉じると削除）
                    sessionStorage.setItem('token', data.token);
                    sessionStorage.setItem('admin', JSON.stringify(data.admin));
                }
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('ログインエラー', error);
        }
    }

    return(
        <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8'>
                <div>
                    <h2 className='text-center text-3xl font-extrabold text-gray-900'>
                        管理者ログイン
                    </h2>
                </div>
                {/* ログインフォーム */}
                <form className='mt-8 space-y-6' onSubmit={handleSubmit} noValidate>
                    {/* 認証エラーメッセージ */}
                    {errors.general && (
                        <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md'>
                            <div>
                                {errors.general}
                            </div>
                        </div>
                    )}
                    <div>
                        {/* メールアドレス */}
                        <div className='mb-4'>
                            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                                メールアドレス
                            </label>
                            <input 
                                id='email'
                                name='email'
                                type='text' 
                                value={formData.email}
                                onChange={handleInputChange}
                                className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                                placeholder='admin@example.com'
                            />
                        </div>
                        <div className='mb-4'>
                            {errors.email && (
                                <p className='text-sm text-red-600 mt-1'>
                                    {errors.email}
                                </p>
                            )}
                        </div>
                        {/* パスワード */}
                        <div className='mb-4'>
                            <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                                パスワード
                            </label>
                            <input 
                                id='password'
                                name='password'
                                type='password' 
                                value={formData.password}
                                onChange={handleInputChange}
                                className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                                placeholder='パスワードを入力'
                            />
                        </div>
                        <div className='mb-4'>
                            {errors.password && (
                                <p className='text-sm text-red-600 mt-1'>
                                    {errors.password}
                                </p>
                            )}
                        </div>
                        {/* ログイン情報保存 */}
                        <div className='flex items-center justify-between mb-8'>
                            <div className='flex items-center'>
                                <input 
                                    id='remember-me'
                                    name='rememberme'
                                    type='checkbox'
                                    checked={formData.rememberme}
                                    onChange={handleInputChange}
                                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                                />
                                <label htmlFor='remember-me' className='ml-2 block text-sm text-gray-900'>
                                    ログイン情報を保存する
                                </label>
                            </div>
                        </div>
                        {/* ログインボタン */}
                        <button
                            type='submit'
                            className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            ログイン
                        </button>
                    </div>
                </form>
            </div>
        </div>      
    );
}