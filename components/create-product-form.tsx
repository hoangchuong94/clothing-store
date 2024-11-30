'use client';
import z from 'zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CreateProductSchema } from '@/schema/product';
import { Button } from './ui/button';
import { Check, SquarePen } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from './ui/textarea';
import { ImageField, ImagesField } from './custom/custom-field';

const genders = [
    { id: '1', label: 'Men' },
    {
        id: '2',
        label: 'Women',
    },
    {
        id: '3',
        label: 'Unisex',
    },
];
const sizes = [
    {
        id: '1',
        label: 'XS',
    },
    {
        id: '2',
        label: 'S',
    },
    {
        id: '3',
        label: 'M',
    },
    {
        id: '4',
        label: 'XL',
    },
    {
        id: '5',
        label: 'XXL',
    },
    {
        id: '6',
        label: '2XXL',
    },
] as const;

export default function CreateProductForm() {
    const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    const form = useForm<z.infer<typeof CreateProductSchema>>({
        resolver: zodResolver(CreateProductSchema),
        defaultValues: {
            name: '',
            description: '',
            size: ['XS', 'S'],
            gender: ['Men'],
            price: 0,
            stock: 0,
            discount: 0,
            discountType: '',
            thumbnailFile: '',
            imageFiles: [],
        },
    });

    const onSubmit = (values: z.infer<typeof CreateProductSchema>) => {
        console.log(values);
    };
    return (
        <div className="bg-white px-4">
            <div className="flex w-full items-center justify-between">
                <div className="my-4 text-2xl">
                    <h1 className="flex items-center justify-center">
                        <SquarePen className="mr-2" />
                        <span>Create Product</span>
                    </h1>
                </div>
                <div>
                    <Button variant="outline" size="lg" className="rounded-3xl bg-green-300 text-white">
                        <Check />
                        Add Product
                    </Button>
                </div>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    <div className="flex flex-row space-x-2">
                        <div className="w-8/12">
                            <div className="rounded-2xl bg-slate-100 p-4">
                                <div className="mb-2">
                                    <h2>General Information</h2>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="py-2">
                                            <FormLabel>Name Product</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="bg-slate-200 focus:bg-white"
                                                    placeholder="Please enter your name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="py-2">
                                            <FormLabel>Description Product</FormLabel>

                                            <FormControl>
                                                {/* <Input
                                                        className="bg-slate-200 focus:bg-white"
                                                        placeholder="Please enter your description"
                                                        {...field}
                                                    /> */}
                                                <div className="grid w-full gap-2">
                                                    <Textarea
                                                        className="bg-slate-200 focus:bg-white"
                                                        placeholder="Type your message here."
                                                        id="message-2"
                                                    />
                                                    <p className="text-muted-foreground text-sm text-gray-400">
                                                        Your description will be visible to the customer support team.
                                                    </p>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="size"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col items-start py-2">
                                                <FormLabel>Size</FormLabel>
                                                <FormDescription>Pick Available Size</FormDescription>
                                                <FormControl>
                                                    <ToggleGroup
                                                        type="multiple"
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        {sizes.map((item) => {
                                                            return (
                                                                <ToggleGroupItem
                                                                    key={item.id}
                                                                    value={item.label}
                                                                    className="data-[state=off]:bg-white data-[state=on]:bg-green-400 data-[state=on]:text-white"
                                                                >
                                                                    {item.label}
                                                                </ToggleGroupItem>
                                                            );
                                                        })}
                                                    </ToggleGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col items-start py-2">
                                                <FormLabel>Gender</FormLabel>
                                                <FormDescription>Pick Available gender</FormDescription>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value[0]}
                                                        className="flex flex-1 space-y-1"
                                                    >
                                                        {genders.map((item) => {
                                                            return (
                                                                <FormItem
                                                                    className="flex items-center space-x-3 space-y-0"
                                                                    key={item.id}
                                                                >
                                                                    <FormControl>
                                                                        <RadioGroupItem
                                                                            value={item.label}
                                                                            className="data-[state=checked]:bg-green-300 data-[state=checked]:text-white"
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        {item.label}
                                                                    </FormLabel>
                                                                </FormItem>
                                                            );
                                                        })}
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="mt-2 rounded-2xl bg-slate-100 p-4">
                                <div className="mb-2">
                                    <h2>Pricing And Stock</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem className="py-2">
                                                <FormLabel>Base Pricing</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="bg-slate-200 focus:bg-white"
                                                        type="number"
                                                        placeholder="Please enter your price product"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="stock"
                                        render={({ field }) => (
                                            <FormItem className="py-2">
                                                <FormLabel>Stock</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="bg-slate-200 focus:bg-white"
                                                        type="number"
                                                        placeholder="Please enter your stock product"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="discount"
                                        render={({ field }) => (
                                            <FormItem className="py-2">
                                                <FormLabel>Discount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="bg-slate-200 focus:bg-white"
                                                        type="number"
                                                        placeholder="Enter your discount"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="discountType"
                                        render={({ field }) => (
                                            <FormItem className="py-2">
                                                <FormLabel>Discount Type</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="bg-slate-200 focus:bg-white"
                                                        type="number"
                                                        placeholder="Enter your price discount type"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="w-4/12">
                            <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-100">
                                <ImageField control={form.control} name="thumbnailFile" setUrl={setThumbnailUrl} />
                                <ImagesField control={form.control} name="imageFiles" setUrls={setImageUrls} />
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
