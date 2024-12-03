import { User } from '@prisma/client';

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
