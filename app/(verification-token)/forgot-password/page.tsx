'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { ForgotPasswordSchema, EmailSchema } from '@/schema/auth';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { forgotPassword, sendVerificationEmail } from '@/actions/forgot-password';
import { ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/loading-spinner';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

    const searchParams = useSearchParams();

    const tokenParam = searchParams.get('token');

    const formSendEmail = useForm<z.infer<typeof EmailSchema>>({
        resolver: zodResolver(EmailSchema),
        defaultValues: {
            email: '',
        },
    });

    const formForgotPassword = useForm<z.infer<typeof ForgotPasswordSchema>>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            password: '',
            passwordConfirm: '',
        },
    });

    const onSubmitVerification = (values: z.infer<typeof EmailSchema>) => {
        setError('');
        setSuccess('');

        startTransition(() => {
            sendVerificationEmail(values).then((data) => {
                setError(data?.error);
                setSuccess(data?.success);
            });
        });
    };

    const onSubmitForgotPassword = (values: z.infer<typeof ForgotPasswordSchema>) => {
        setError('');
        setSuccess('');

        startTransition(() => {
            forgotPassword(values, tokenParam).then((data) => {
                setError(data?.error);
                setSuccess(data?.success);
            });
        });
    };

    return (
        <div>
            <Link href={'/'} className="mb-2 block p-5 text-center text-4xl text-zinc-800">
                Forgot Password
            </Link>
            {!tokenParam && (
                <Form {...formSendEmail}>
                    <form onSubmit={formSendEmail.handleSubmit(onSubmitVerification)} className="space-y-6">
                        <div className="space-y-4">
                            <FormField
                                control={formSendEmail.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="border border-gray-800"
                                                {...field}
                                                disabled={isPending}
                                                placeholder="Enter your email address"
                                                type="email"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormError message={error} />
                        <FormSuccess message={success} />
                        <Button disabled={isPending} type="submit" className="w-full">
                            {isPending ? (
                                <LoadingSpinner />
                            ) : (
                                <>
                                    <p>Send Email</p>
                                    <ArrowRight className="ml-auto h-5 w-5 text-gray-50" />
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            )}

            {tokenParam && (
                <Form {...formForgotPassword}>
                    <form onSubmit={formForgotPassword.handleSubmit(onSubmitForgotPassword)} className="space-y-6">
                        <div className="space-y-4">
                            <FormField
                                control={formForgotPassword.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="border border-gray-800"
                                                {...field}
                                                disabled={isPending}
                                                placeholder="Enter your new password"
                                                type="password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={formForgotPassword.control}
                                name="passwordConfirm"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password Confirm</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="border border-gray-800"
                                                {...field}
                                                disabled={isPending}
                                                placeholder="Enter your new password confirmation"
                                                type="password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormError message={error} />
                        <FormSuccess message={success} />
                        <Button
                            className={`mt-6 w-full ${isPending && 'bg-gray-700'}`}
                            aria-disabled={isPending}
                            disabled={isPending}
                            type="submit"
                        >
                            {isPending ? (
                                <LoadingSpinner />
                            ) : (
                                <>
                                    <p>Reset password</p>
                                    <ArrowRight className="ml-auto h-5 w-5 text-gray-50" />
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            )}
        </div>
    );
}
