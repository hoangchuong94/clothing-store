import { ProductDetail } from '@/types';

export const genders = [
    { id: '1', label: 'Men' },
    { id: '2', label: 'Women' },
    { id: '3', label: 'Unisex' },
];

export const sizes = [
    { id: '1', label: 'XS' },
    { id: '2', label: 'S' },
    { id: '3', label: 'M' },
    { id: '4', label: 'XL' },
    { id: '5', label: 'XXL' },
    { id: '6', label: '2XXL' },
];

const getRandomDate = (start: Date, end: Date): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

export const productDetails: ProductDetail[] = Array.from({ length: 15 }, (_, index) => {
    const id = (index + 1).toString();
    const createdAt = getRandomDate(new Date(2022, 0, 1), new Date(2023, 11, 31));
    const updatedAt = getRandomDate(createdAt, new Date(2024, 0, 1)); // updatedAt sau createdAt
    const startDay = getRandomDate(new Date(2023, 0, 1), new Date(2023, 6, 30));
    const endDay = getRandomDate(startDay, new Date(2023, 11, 31));

    return {
        id,
        name: `Product ${id}`,
        description: `Description of Product ${id}`,
        type: `Type ${id}`,
        price: 100 * (index + 1),
        quantity: 10 * (index + 1),
        capacity: 500 + 50 * index,
        thumbnail: `url-to-thumbnail-${id}`,
        images: [
            {
                id: `img${id}`,
                createdAt,
                updatedAt,
                url: `url-to-image-${id}`,
            },
        ],
        colors: [
            {
                name: `Color ${id}`,
                id: `color${id}`,
                code: `#${Math.floor(Math.random() * 16777215)
                    .toString(16)
                    .padStart(6, '0')}`, // Mã màu ngẫu nhiên
                createdAt,
                updatedAt,
            },
        ],
        promotions: [
            {
                id: `promo${id}`,
                name: `Promotion ${id}`,
                createdAt,
                updatedAt,
                description: `Promo description ${id}`,
                startDay,
                endDay,
            },
        ],
        detailCategory: {
            name: `Detail Category ${id}`,
            id: `detailCat${id}`,
            createdAt,
            updatedAt,
            subCategoryId: `subCat${id}`,
        },
        subCategory: {
            name: `Sub Category ${id}`,
            id: `subCat${id}`,
            createdAt,
            updatedAt,
            categoryId: `cat${id}`,
        },
        category: {
            name: `Category ${id}`,
            id: `cat${id}`,
            createdAt,
            updatedAt,
        },
        createdAt,
        updatedAt,
    };
});
