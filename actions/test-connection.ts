import prisma from '@/lib/prisma';

export default async function testConnection() {
    try {
        const users = await prisma.user.findMany();
        console.log(users);
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}
