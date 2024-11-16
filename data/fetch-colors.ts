import { prisma } from '@/lib/prisma';

export const fetchColors = async () => {
    return await prisma.color.findMany();
};
