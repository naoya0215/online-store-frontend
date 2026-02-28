export interface Order {
    id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    postal_code: string;
    prefecture: string;
    city: string;
    address: string;
    building: string | null;
    delivery_notes: string | null;
    payment_method: 'credit' | 'bank' | 'cod';
    subtotal: number;
    shipping_fee: number;
    total_amount: number;
    created_at: string;
    updated_at: string;
    items?: OrderItem[];
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    product_name: string;
    size: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

export interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface SearchFilters {
    customer_name: string;
    customer_email: string;
    payment_method: string;
    date_from: string;
    date_to: string;
}