'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/loading-spinner';

export default function Feedback() {
    return (
        <div className="container m-auto h-screen">
            <div className="flex h-full items-center justify-center">
                <Button className="w-full">
                    <LoadingSpinner />
                    loading
                </Button>
            </div>
        </div>
    );
}
