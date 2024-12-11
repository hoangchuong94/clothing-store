'use client';
import z from 'zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, SquarePen } from 'lucide-react';

import { CreateProductSchema } from '@/schema/product';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
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
import { genders, sizes } from '@/data/placeholder';
import { CardCreateProductFormProps } from '@/types/';

export default function CreateProductForm() {
    const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    const form = useForm<z.infer<typeof CreateProductSchema>>({
        resolver: zodResolver(CreateProductSchema),
        defaultValues: {
            name: '',
            description: '',
            discountType: '',
            thumbnailFile: '',
            price: 0,
            stock: 0,
            discount: 0,
            gender: 'Men',
            size: ['XS', 'S'],
            imageFiles: [],
            categories: [],
        },
    });

    const onSubmit = (values: z.infer<typeof CreateProductSchema>) => {
        console.log(values);
    };
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="px-3 pb-2 max-md:space-y-2 md:grid md:grid-cols-10 md:gap-2"
            >
                <div className="col-span-10 max-md:mb-2">
                    <div className="flex w-full items-center justify-between">
                        <div>
                            <h1 className="flex items-center justify-center">
                                <SquarePen className="mr-2" />
                                <span>Create Product</span>
                            </h1>
                        </div>

                        <Button size="lg" className="hidden rounded-3xl bg-green-400 text-white md:inline-flex">
                            <Check />
                            Add Product
                        </Button>
                        <Button size="sm" className="rounded-3xl bg-green-400 text-white md:hidden">
                            <Check />
                            Add Product
                        </Button>
                    </div>
                </div>
                <div className="gap-2 space-y-2 md:col-span-6 lg:col-span-7">
                    <div className="space-y-2 rounded-2xl bg-slate-100 p-4">
                        <label>General</label>
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
                        <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-2">
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
                    </div>

                    <div className="space-y-2 rounded-2xl bg-slate-100 p-4">
                        <label>Price and Stock</label>
                        <div className="grid-cols-2 gap-2 md:grid">
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
                        <div className="grid-cols-2 gap-2 md:grid">
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
                    </div>

                    {/* <div className="space-y-2 rounded-2xl bg-slate-100 p-4">
                        <label>Price and Stock</label>
                        <div className="grid-cols-2 gap-2 md:grid">
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
                        <div className="grid-cols-2 gap-2 md:grid">
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
                    </div> */}
                </div>
                <div className="space-y-2 md:col-span-4 lg:col-span-3">
                    <div className="max:md:flex items-center justify-center space-y-2 rounded-2xl bg-slate-100 p-4">
                        <label>Upload Image</label>
                        <ImageField
                            className="bg-white"
                            control={form.control}
                            name="thumbnailFile"
                            setUrl={setThumbnailUrl}
                        />
                        <ImagesField
                            className="bg-white"
                            control={form.control}
                            name="imageFiles"
                            setUrls={setImageUrls}
                        />
                    </div>

                    {/* <div className="space-y-2 rounded-2xl bg-slate-100 p-4">
                        <label>Category</label>
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
                    </div> */}
                </div>
            </form>
        </Form>
    );
}
