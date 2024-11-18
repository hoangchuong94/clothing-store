'use client';

import { useSearchParams } from 'next/navigation';
import React, { useState, useTransition } from 'react';

import { newVerificationEmail } from '@/actions/new-verification';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import LoadingSpinner from '@/components/loading-spinner';
import { ArrowRight } from 'lucide-react';

export default function NewVerificationPage() {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const [isPending, startTransition] = useTransition();
    const searchParams = useSearchParams();
    const tokenParam = searchParams.get('token');

    const handlerVerificationEmail = () => {
        setError('');
        setSuccess('');

        startTransition(() => {
            if (!tokenParam) {
                setError('Missing token!');
                return;
            }

            newVerificationEmail(tokenParam)
                .then((data) => {
                    setSuccess(data.success);
                    setError(data.error);
                })
                .catch(() => {
                    setError('Something went wrong!');
                });
        });
    };

    return (
        <>
            <div className="flex flex-col">
                <Link href={'/'} className="mb-2 block p-5 text-center text-4xl text-zinc-800">
                    Verification Email
                </Link>
                <div className="mt-2">
                    {success ? (
                        <>
                            <FormSuccess message={success} />
                            <Link href={'/signIn'} className="my-4 block text-center">
                                Click <span className="border-b-2 border-b-blue-800 text-blue-600">here</span> to return
                                to the signIn page
                            </Link>
                        </>
                    ) : (
                        <Button disabled={isPending} onClick={handlerVerificationEmail} className="w-full">
                            {isPending ? (
                                <LoadingSpinner />
                            ) : (
                                <>
                                    <p>Click here</p>
                                    <ArrowRight className="ml-auto h-5 w-5 text-gray-50" />
                                </>
                            )}
                        </Button>
                    )}
                    <FormError message={error} />
                </div>
            </div>
        </>
    );
}
