'use server';
import prisma from '@/lib/prisma';
import * as z from 'zod';
import { signIn } from '@/auth';
import bcryptjs from 'bcryptjs';
import { AuthError } from 'next-auth';
import { LoginSchema, RegisterSchema } from '@/schema/auth';

import { DEFAULT_ADMIN_LOGIN_REDIRECT } from '@/routes';
import { sendVerificationEmail } from '@/lib/mail';
import { generateVerificationToken } from '@/lib/tokens';

export async function authenticate(values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid fields!' };
    }

    const { email, password } = validatedFields.data;

    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    console.log(user);

    if (user && user.emailVerified && !user.password) {
        return { error: 'Please login with your provider' };
    }

    if (!user || !user.email || !user.password) {
        return { error: 'Email does not exist!' };
    }

    if (user && !user.emailVerified) {
        const verificationToken = await generateVerificationToken(user.email);

        if (verificationToken) {
            await sendVerificationEmail({
                email: verificationToken.email,
                token: verificationToken.token,
            });
            return {
                success: 'Confirmation email sent successfully. Please check your email',
            };
        }
    }

    try {
        if (user.role === 'USER') {
            await signIn('credentials', {
                email,
                password,
                redirectTo: callbackUrl || '/',
            });
        } else {
            await signIn('credentials', {
                email,
                password,
                redirectTo: callbackUrl || DEFAULT_ADMIN_LOGIN_REDIRECT,
            });
        }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: 'Invalid credentials!' };
                case 'OAuthAccountNotLinked':
                    return { error: 'Invalid Account not Link' };
                default:
                    return { error: 'Something went wrong!' };
            }
        }
        throw error;
    } finally {
        prisma.$disconnect();
    }
}

export async function register(values: z.infer<typeof RegisterSchema>) {
    try {
        const validatedFields = RegisterSchema.safeParse(values);
        if (!validatedFields.success) {
            return { error: 'Invalid fields!' };
        }

        const { email, password, name } = validatedFields.data;
        const hashedPassword = await bcryptjs.hash(password, 10);

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: 'Email already in use!' };
        }

        await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });

        const verificationEmail = await generateVerificationToken(email);

        if (verificationEmail) {
            await sendVerificationEmail({
                email: verificationEmail.email,
                token: verificationEmail.token,
            });
        }

        return {
            success: 'Confirmation email sent successfully. Please check your email',
        };
    } catch (error) {
        console.error('Error during registration:', error);
        return {
            error: 'Database Error: Failed to register user.',
        };
    } finally {
        await prisma.$disconnect();
    }
}
