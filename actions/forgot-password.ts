'use server';
import * as z from 'zod';
import prisma from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { getVerificationByToken } from '@/actions/verification-token';
import { ForgotPasswordSchema, EmailSchema } from '@/schema/auth';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationForgotPassword } from '@/lib/mail';

export const forgotPassword = async (values: z.infer<typeof ForgotPasswordSchema>, token?: string | null) => {
    try {
        if (!token) {
            return { error: 'Missing token!' };
        }

        const validatedFields = ForgotPasswordSchema.safeParse(values);

        if (!validatedFields.success) {
            return { error: 'Invalid fields!' };
        }

        const { password } = validatedFields.data;
        const hashedPassword = await bcryptjs.hash(password, 10);

        const existingToken = await getVerificationByToken(token);

        if (!existingToken) {
            return { error: 'Invalid token!' };
        }

        const hasExpired = new Date(existingToken.expires) < new Date();

        if (hasExpired) {
            return { error: 'Token has expired!' };
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: existingToken.email,
            },
        });

        if (!existingUser) return { error: 'Email does not exist!' };

        await prisma.user.update({
            where: { id: existingUser.id },
            data: { password: hashedPassword },
        });

        await prisma.verificationToken.delete({
            where: {
                id: existingToken.id,
            },
        });
        return { success: 'Password updated!' };
    } catch (error) {
        return { error: 'something wrong.' };
    } finally {
        prisma.$disconnect();
    }
};

export const sendVerificationEmail = async (values: z.infer<typeof EmailSchema>) => {
    try {
        const validatedFields = EmailSchema.safeParse(values);

        if (!validatedFields.success) {
            return { error: 'Invalid emaiL!' };
        }

        const { email } = validatedFields.data;

        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!user) {
            return {
                error: 'email does not exist',
            };
        }

        if (user) {
            const verificationEmail = await generateVerificationToken(email);

            if (verificationEmail) {
                sendVerificationForgotPassword(verificationEmail?.email, verificationEmail?.token);
            }

            return {
                success: 'Confirmation email sent successfully. Please check your email',
            };
        }
    } catch (error) {
        return { error: 'something wrong.' };
    } finally {
        prisma.$disconnect();
    }
};
