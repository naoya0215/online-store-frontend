'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Product,  Category, UpdateProductFormData } from '../../types/product';

export default function ProductEditPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    
    const [categories, setCategories] = useState<Category[]>([]);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<UpdateProductFormData>({
        name: '',
        category_id: '',
        price: '',
        description: '',
        stock_quantity: '',
        low_stock_threshold: '10',
        image_path: '',
        is_selling: false, // デフォルトは準備中
    });
    const [errors, setErrors] = useState<Record<string, string | string[]>>({});
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

    // 商品データとカテゴリデータを取得
    useEffect(() => {
        if (productId) {
        fetchProductData();
        }
    }, [productId]);

    // 商品データを取得する関数
    const fetchProductData = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${productId}/edit`, {
                headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // 商品データとカテゴリデータを設定
                    const productData = data.product;
                    console.log('Original API data:', productData.is_selling, typeof productData.is_selling);

                    setProduct(productData);
                    setCategories(data.categories || []);
                    setCurrentImageUrl(productData.image_path);
                    
                    // フォームデータを設定
                    setFormData({
                        name: productData.name || '',
                        category_id: productData.category_id?.toString() || '',
                        price: productData.price?.toString() || '',
                        description: productData.description || '',
                        stock_quantity: productData.stock_quantity?.toString() || '',
                        low_stock_threshold: productData.low_stock_threshold?.toString() || '10',
                        image_path: '',
                        is_selling: Boolean(productData.is_selling),
                    });
                }
            } else {
                console.error('商品データの取得に失敗しました');
                router.push('/dashboard/products');
            }
        } catch (error) {
            console.error('商品データの取得エラー:', error);
            router.push('/dashboard/products');
        } finally {
            setLoading(false);
        }
    };

    // 削除機能
    const handleDelete = async (productId: number, productName: string) => {
        if (!confirm(`「${productName}」を削除してもよろしいですか？`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();

            if (response.ok && data.success) {
                // 削除成功時は商品一覧ページにリダイレクト
                router.push('/dashboard/products');
            } else {
                alert(data.message || '削除に失敗しました');
            }
        } catch (error) {
        console.error('削除エラー:', error);
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'radio' && name === 'is_selling') {
            const boolValue = value === 'true';
            console.log('Radio button clicked:', value, '-> boolean:', boolValue);
            setFormData(prev => {
                const newData = { ...prev, [name]: boolValue };
                console.log('Updated formData.is_selling:', newData.is_selling);
                return newData;
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // エラーをクリア
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        console.log('File selected:', file); 
        if (file) {
            setSelectedFile(file);
            // 画像プレビューを作成
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null);
            setImagePreview(null);
        }

        // エラーをクリア
        if (errors.image_path) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.image_path;
                return newErrors;
            });
        }
    };

    const getErrorMessage = (fieldErrors: string | string[] | undefined): string => {
        if (!fieldErrors) return '';
        if (Array.isArray(fieldErrors)) {
            return fieldErrors[0]; // 最初のエラーメッセージを表示
        }
        return fieldErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            // FormDataを作成
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('category_id', formData.category_id);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('stock_quantity', formData.stock_quantity);
            formDataToSend.append('low_stock_threshold', formData.low_stock_threshold);
            formDataToSend.append('is_selling', formData.is_selling ? '1' : '0');
            formDataToSend.append('_method', 'PUT'); 
            
            // ファイルが選択されている場合のみ追加
            if (selectedFile) {
                formDataToSend.append('image', selectedFile);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${productId}`, {
                method: 'POST',
                headers: {
                'Authorization': `Bearer ${token}`,
                },
                body: formDataToSend,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                router.push('/dashboard/products');
            } else {
                // バリデーションエラーまたはその他のエラーを処理
                if (response.status === 422 && data.errors) {
                    setErrors(data.errors);
                } else {
                    console.error('商品更新エラー:', data.message || 'エラーが発生しました');
                    setErrors({ general: data.message || '商品の更新に失敗しました' });
                }
            }
        } catch (error) {
            console.error('商品更新エラー:', error);
            setErrors({ general: '商品の更新に失敗しました' });
        } 
    };

    if (loading) {
        return (
        <div className="mx-auto p-6">
            <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
            </div>
            </div>
        </div>
        );
    }

    if (!product) {
        return (
        <div className="mx-auto p-6">
            <div className="bg-white rounded-lg shadow p-6">
            <p className="text-red-500">商品が見つかりませんでした。</p>
            </div>
        </div>
        );
    }

    return (
        <div className="mx-auto p-6">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">商品編集</h1>
                    <button 
                        onClick={() => handleDelete(product.id, product.name)}
                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                    >
                        削除
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-lg flex space-x-6">
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="radio" 
                                name="is_selling" 
                                value="true" 
                                checked={formData.is_selling === true}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-lg">販売中</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="radio" 
                                name="is_selling" 
                                value="false" 
                                checked={formData.is_selling === false}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-lg">準備中</span>
                        </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 商品名 */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            商品名 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="商品名を入力"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.name)}</p>}
                        </div>

                        {/* カテゴリー */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            カテゴリー <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.category_id ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">カテゴリーを選択</option>
                            {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        {errors.category_id && <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.category_id)}</p>}
                        </div>
                    </div>

                    {/* 価格・在庫数・在庫警告閾値を横並び */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 価格 */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            価格 (円) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.price ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                            min="0"
                            step="1"
                        />
                        {errors.price && <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.price)}</p>}
                        </div>

                        {/* 在庫数 */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            在庫数 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="stock_quantity"
                            value={formData.stock_quantity}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.stock_quantity ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                            min="0"
                        />
                        {errors.stock_quantity && <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.stock_quantity)}</p>}
                        </div>

                        {/* 在庫警告閾値 */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            在庫警告閾値 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="low_stock_threshold"
                            value={formData.low_stock_threshold}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.low_stock_threshold ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                            min="0"
                        />
                        {errors.low_stock_threshold && <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.low_stock_threshold)}</p>}
                        </div>
                    </div>

                    {/* 画像 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            画像
                        </label>
                        <div className="space-y-4">
                            {/* 隠されたinput要素 */}
                            <input
                                type="file"
                                name="image_path"
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                                id="image-upload"
                            />
                            
                            {/* カスタムボタンとファイル名表示 */}
                            <div className="flex items-center space-x-4">
                                <label
                                    htmlFor="image-upload"
                                    className={`inline-flex items-center w-1/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200 ${
                                        errors.image ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    ファイルを選択
                                </label>
                            </div>
                            
                            {/* 画像プレビュー */}
                            <div className="space-y-2">
                                {imagePreview ? (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">新しい画像（プレビュー）:</p>
                                        <div className="relative inline-block">
                                            <img
                                                src={imagePreview}
                                                alt="新しい商品画像プレビュー"
                                                className="max-w-full max-h-full object-contain rounded-md"
                                            />
                                        </div>
                                    </div>
                                ) : currentImageUrl ? (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">現在の画像:</p>
                                        <div className="relative inline-block">
                                            <img
                                                src={currentImageUrl}
                                                alt="現在の商品画像"
                                                className="max-w-full max-h-full object-contain rounded-md"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm text-gray-500">画像が設定されていません</p>
                                    </div>
                                )}
                            </div>
                            
                            {errors.image && <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.image)}</p>}
                        </div>
                    </div>

                    {/* 商品説明 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        商品説明 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="商品の詳細説明を入力"
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.description)}</p>}
                    </div>

                    {/* 一般エラーメッセージ */}
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-red-600 text-sm">{getErrorMessage(errors.general)}</p>
                        </div>
                    )}

                    {/* ボタン */}
                    <div className="flex justify-end space-x-4 pt-6">
                        <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                        戻る
                        </button>
                        <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                        >
                        商品を更新
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}