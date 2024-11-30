'use client';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema } from '@/schema/auth';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { register } from '@/actions/auth';
import { ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/loading-spinner';
import AuthCardWrapper from '@/components/auth';
import { Input } from '@/components/ui/input';

export default function SignUpForm() {
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: '',
            password: '',
            name: '',
            passwordConfirm: '',
        },
    });

    const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
        setError('');
        setSuccess('');
        startTransition(() => {
            register(values)
                .then((data) => {
                    if (data?.error) {
                        form.reset();
                        setError(data.error);
                    }
                    if (data?.success) {
                        form.reset();
                        setSuccess(data.success);
                    }
                })
                .catch(() => setError('Something went wrong'));
        });
    };

    return (
        <AuthCardWrapper
            className="xl:rounded-none"
            headerLabel="Sign Up"
            footerLabel="You Have An Account ? "
            footerHref="/signIn"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="py-2">
                                <FormLabel>Name : </FormLabel>
                                <FormControl>
                                    <Input placeholder="Please enter your name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="py-2">
                                <FormLabel>Email : </FormLabel>
                                <FormControl>
                                    <Input placeholder="Please enter your name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="py-2">
                                <FormLabel>Password :</FormLabel>
                                <FormControl>
                                    <Input placeholder="Please enter your password" {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="passwordConfirm"
                        render={({ field }) => (
                            <FormItem className="py-2">
                                <FormLabel>Password Confirm :</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Please enter your password confirm"
                                        {...field}
                                        type="password"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button className="mt-6 w-full" aria-disabled={isPending} disabled={isPending} type="submit">
                        {isPending ? (
                            <LoadingSpinner />
                        ) : (
                            <div>
                                <p>Sign Up</p>
                                <ArrowRight className="ml-auto h-5 w-5 text-gray-50" />
                            </div>
                        )}
                    </Button>
                </form>
            </Form>

            <div className="pt-2">
                <FormError message={error} />
                <FormSuccess message={success} />
            </div>
        </AuthCardWrapper>
    );
}
