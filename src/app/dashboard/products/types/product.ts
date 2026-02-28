export interface Product {
    id: number;
    admin_id: number;
    category_id: number;
    name: string;
    price: number;
    description: string;
    image_path: string | null;
    display_order: number;
    is_selling: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    // API結合データ（JOIN結果）
    category_name: string | null;
    stock_quantity: number;
}


export interface Category {
    id: number;
    name: string;
    display_order: number;
}

export interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
}

export interface SearchFilters {
    name: string;
    category_id: string;
    min_price: string;
    max_price: string;
    min_stock: string;
    max_stock: string;
    is_selling: string;
}

export interface ProductFormData {
    name: string;
    category_id: string;
    price: string;
    description: string;
    stock_quantity: string;
    low_stock_threshold: string;
    image_path: string;
}

export interface UpdateProductFormData {
    name: string;
    category_id: string;
    price: string;
    description: string;
    stock_quantity: string;
    low_stock_threshold: string;
    image_path: string;
    is_selling: boolean;
}
