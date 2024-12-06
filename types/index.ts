import { User, Image, Category, Color, Promotion, DetailCategory, SubCategory } from '@prisma/client';

export interface DashboardSideNavProps {
    user: User;
}

export interface DashboardFooterProps {
    user: User;
}

export type UploadedImage = {
    url: string;
    thumbnailUrl: string | null;
    size: number;
    uploadedAt: Date;
    metadata: Record<string, never>;
    path: {
        type: string;
    };
    pathOrder: 'type'[];
};

export interface CardCreateProductFormProps {
    label?: string;
    className?: string;
    children: React.ReactNode;
}

export type ProductDetail = {
    id: string;
    name: string;
    description: string;
    type: string;
    price: number;
    quantity: number;
    capacity: number;
    thumbnail: string;
    images: Image[];
    colors: Color[];
    promotions: Promotion[];
    detailCategory: DetailCategory;
    subCategory: SubCategory;
    category: Category;
    createdAt: Date;
    updatedAt: Date;
};
