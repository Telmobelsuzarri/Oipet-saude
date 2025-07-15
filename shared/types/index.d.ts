/**
 * Tipos TypeScript compartilhados entre todas as plataformas
 */
export interface User {
    _id: string;
    email: string;
    name: string;
    phone?: string;
    avatar?: string;
    isAdmin: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Pet {
    _id: string;
    userId: string;
    name: string;
    species: 'dog' | 'cat' | 'other';
    breed: string;
    birthDate: Date;
    weight: number;
    height: number;
    gender: 'male' | 'female';
    isNeutered: boolean;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface HealthRecord {
    _id: string;
    petId: string;
    date: Date;
    weight?: number;
    height?: number;
    activity?: {
        type: string;
        duration: number;
        intensity: 'low' | 'medium' | 'high';
    };
    calories?: number;
    notes?: string;
    createdAt: Date;
}
export interface FoodScan {
    _id: string;
    petId: string;
    userId: string;
    imageUrl: string;
    recognizedFood?: string;
    nutritionalInfo?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    confidence: number;
    createdAt: Date;
}
export interface Notification {
    _id: string;
    userId: string;
    title: string;
    message: string;
    type: 'feeding' | 'health' | 'news' | 'system';
    isRead: boolean;
    data?: any;
    createdAt: Date;
}
export interface Analytics {
    _id: string;
    userId: string;
    event: string;
    data: Record<string, any>;
    timestamp: Date;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone?: string;
}
export interface GlassComponentProps {
    children: React.ReactNode;
    intensity?: 'light' | 'medium' | 'strong';
    style?: any;
    className?: string;
}
export interface LogoProps {
    size?: 'small' | 'medium' | 'large' | 'xlarge';
    showText?: boolean;
    variant?: 'default' | 'white' | 'glass';
    withGlass?: boolean;
    style?: any;
    className?: string;
}
export interface AppConfig {
    apiUrl: string;
    environment: 'development' | 'staging' | 'production';
    features: {
        glassEffects: boolean;
        darkMode: boolean;
        notifications: boolean;
        analytics: boolean;
    };
}
export interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    glass: string;
}
export interface NavigationItem {
    id: string;
    label: string;
    icon: string;
    route: string;
    badge?: number;
}
export interface DashboardMetric {
    id: string;
    title: string;
    value: number | string;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
    change?: number;
    color?: string;
}
export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string;
        borderWidth?: number;
    }[];
}
export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
    placeholder?: string;
    required?: boolean;
    validation?: (value: any) => string | null;
    options?: {
        label: string;
        value: string;
    }[];
}
export interface AppState {
    user: User | null;
    pets: Pet[];
    notifications: Notification[];
    isLoading: boolean;
    error: string | null;
    theme: 'light' | 'dark';
    glassEnabled: boolean;
}
export interface AppError {
    code: string;
    message: string;
    details?: any;
    timestamp: Date;
}
export interface PaginationParams {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface FilterParams {
    search?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    [key: string]: any;
}
