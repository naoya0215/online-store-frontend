export interface Contact {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    category: string;
    message: string;
    created_at: string;
    updated_at: string;
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
    name: string;
    email: string;
    category: string;
    date_from: string;
    date_to: string;
}