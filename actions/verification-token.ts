'use server';

import prisma from '@/lib/prisma';

export const getVerificationByToken = async (token: string) => {
    try {
        const verificationToken = await prisma.verificationToken.findUnique({
            where: {
                token: token,
            },
        });
        return verificationToken;
    } catch (error) {
        return null;
    }
};

export const getVerificationTokenByEmail = async (email: string) => {
    try {
        const getVerificationTokenByEmail = await prisma.verificationToken.findFirst({
            where: {
                email: email,
            },
        });

        return getVerificationTokenByEmail;
    } catch (error) {
        return null;
    }
};
