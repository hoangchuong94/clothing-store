'use client';
import z from 'zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, SquarePen } from 'lucide-react';
import { CreateProductSchema } from '@/schema/product';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { genders, sizes } from '@/data/placeholder';
import { CardCreateProductFormProps } from '@/types/';
import {
    ImageField,
    ImagesField,
    InputField,
    NumericInputField,
    PopoverSelectField,
    RadioGroupField,
    SelectGroupField,
    TextAreaField,
    ToggleGroupField,
} from '@/components/custom/custom-field';

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
            categories: [{ id: '1', name: 'clothing' }],
        },
    });

    const onSubmit = (values: z.infer<typeof CreateProductSchema>) => {
        console.log(values);
    };
    return (
        <div className="px-4">
            <div className="flex w-full items-center justify-between pb-4">
                <h1 className="flex items-center justify-center">
                    <SquarePen className="mr-2" />
                    <span>Create Product</span>
                </h1>
                <Button size="lg" className="rounded-3xl bg-green-400 text-white">
                    <Check />
                    Add Product
                </Button>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    <div className="max-md:space-y-2 md:flex md:flex-row md:space-x-2">
                        <div className="space-y-2 md:w-8/12">
                            <CardCreateProductForm label="General Information" className="space-y-4 xl:space-y-6">
                                <InputField
                                    name="name"
                                    label="Name Product"
                                    className="bg-slate-200 focus:bg-white"
                                    placeholder="Please enter your name"
                                />

                                <TextAreaField
                                    name="description"
                                    label="Description Product"
                                    className="h-30 bg-slate-200 focus:bg-white"
                                    placeholder="Type your message here."
                                />

                                <div className="grid gap-4 xl:grid-cols-2 xl:gap-2">
                                    <ToggleGroupField
                                        className="data-[state=off]:bg-white data-[state=on]:bg-green-400 data-[state=on]:text-white"
                                        name="size"
                                        label="Size"
                                        items={sizes}
                                        renderItem={(item) => item.label}
                                        getItemKey={(item) => item.id}
                                        description="Pick Available Size"
                                    />

                                    <RadioGroupField
                                        className="data-[state=checked]:bg-green-400 data-[state=unchecked]:bg-white data-[state=checked]:text-white"
                                        label="Gender"
                                        name="gender"
                                        items={genders}
                                        description="Pick Available gender"
                                        getItemKey={(item) => item.id}
                                        renderItem={(item) => item.label}
                                    />
                                </div>
                            </CardCreateProductForm>

                            <CardCreateProductForm label="Pricing And Stock" className="space-y-6">
                                <div className="grid grid-cols-2 gap-2">
                                    <NumericInputField
                                        className="bg-slate-200 focus:bg-white"
                                        label="Price"
                                        name="price"
                                        placeholder="Please enter your price product"
                                    />

                                    <NumericInputField
                                        className="bg-slate-200 focus:bg-white"
                                        label="Stock"
                                        name="stock"
                                        placeholder="Please enter your stock product"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <NumericInputField
                                        className="bg-slate-200 focus:bg-white"
                                        label="Discount"
                                        name="discount"
                                        placeholder="Enter your discount"
                                    />

                                    <SelectGroupField
                                        classNameBtn="bg-slate-200"
                                        classNameItem="hover:cursor-pointer"
                                        name="discountType"
                                        label="Discount Type"
                                        placeholder="Select item"
                                        items={[
                                            { id: '1', name: 'light' },
                                            { id: '2', name: 'dark' },
                                            { id: '3', name: 'system' },
                                        ]}
                                        getItemKey={(item) => item.id}
                                        renderItem={(item) => item.name}
                                    />
                                </div>
                            </CardCreateProductForm>
                        </div>

                        <div className="flex flex-col space-y-2 md:w-4/12">
                            <CardCreateProductForm label="Upload Image" className="flex flex-1 flex-col">
                                <div className="flex items-center justify-start md:flex-col">
                                    <ImageField control={form.control} name="thumbnailFile" setUrl={setThumbnailUrl} />
                                    <ImagesField control={form.control} name="imageFiles" setUrls={setImageUrls} />
                                </div>
                            </CardCreateProductForm>

                            <CardCreateProductForm>
                                <PopoverSelectField
                                    label="Category"
                                    name="category"
                                    items={[
                                        { id: '1', name: 'clothing' },
                                        { id: '2', name: 'jean' },
                                    ]}
                                    getItemKey={(item) => item.id}
                                    renderItem={(item) => item.name}
                                />

                                <Button className="mt-2 w-full bg-green-400" type="button">
                                    Add Category
                                </Button>
                            </CardCreateProductForm>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export const CardCreateProductForm = ({ children, label, className }: CardCreateProductFormProps) => {
    return (
        <div className={`rounded-2xl bg-slate-100 p-4 ${className}`}>
            <div className="mb-2 flex w-full justify-start">
                <h2 className="text-left">{label}</h2>
            </div>
            {children}
        </div>
    );
};
