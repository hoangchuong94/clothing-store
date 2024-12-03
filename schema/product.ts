import { z } from 'zod';

export const ImagesSchema = z
    .array(
        z.object({
            file: z.union([z.instanceof(File), z.string()]),
            key: z.string(),
            progress: z.union([z.literal('PENDING'), z.literal('COMPLETE'), z.literal('ERROR'), z.number()]),
        }),
    )
    .min(1, 'At least one image must be selected')
    .refine((arr) => arr.every((item) => item.progress !== 'ERROR' || item === undefined), {
        message: 'Please check image uploader ',
    });

export const CreateProductSchema = z.object({
    name: z.string({ required_error: 'Email is required' }).min(1, 'Password is required'),
    description: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
    size: z.array(z.string()),
    gender: z.array(z.string()),
    price: z.number(),
    stock: z.number(),
    discount: z.number(),
    discountType: z.string(),
    thumbnailFile: z.string(),
    imageFiles: ImagesSchema,
    categories: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
        }),
    ),
});
