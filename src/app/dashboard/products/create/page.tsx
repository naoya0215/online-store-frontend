'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category, ProductFormData } from '../types/product';

export default function ProductCreatePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category_id: '',
    price: '',
    description: '',
    stock_quantity: '',
    low_stock_threshold: '10',
    image_path: '',
  });
  const [errors, setErrors] = useState<Record<string, string | string[]>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // カテゴリデータを取得
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/create`, {
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
      console.error('カテゴリ取得エラー:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
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
      
      // ファイルが選択されている場合のみ追加
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products`, {
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
          console.error('商品作成エラー:', data.message || 'エラーが発生しました');
          setErrors({ general: data.message || '商品の作成に失敗しました' });
        }
      }
    } catch (error) {
      console.error('商品作成エラー:', error);
    } 
  };

  return (
    <div className="mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">商品登録</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
              画像 <span className="text-red-500">*</span>
            </label>
              <input
                type="file"
                name="image_path"
                onChange={handleFileChange}
                accept="image/*"
                className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.image ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div>
                {/* 画像プレビュー */}
                {imagePreview && (
                    <div className="relative inline-block">
                    <img
                        src={imagePreview}
                        alt="商品画像プレビュー"
                        className="max-w-full max-h-full object-contain rounded-md"
                    />
                    </div>
                )}
              </div>
            
              {errors.image && <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.image)}</p>}
            
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
              className={`w-full h-50 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="商品の詳細説明を入力"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.description)}</p>}
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              戻る
            </button>
            <button
              type="submit"
              className={"px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"}
            >
              商品を作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}