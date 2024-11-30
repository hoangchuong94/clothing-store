'use client';
import React from 'react';
import { Slash } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { usePathname } from 'next/navigation';

export default function LinkHierarchy() {
    const router = usePathname();
    const segments = router.split('/').filter((segment) => segment !== '');
    return (
        <Breadcrumb className="px-2">
            <BreadcrumbList>
                {segments.map((segment, index) => (
                    <React.Fragment key={index}>
                        {index !== 0 && (
                            <BreadcrumbSeparator>
                                <Slash />
                            </BreadcrumbSeparator>
                        )}
                        <BreadcrumbItem className="text-xs capitalize text-stone-950">
                            {index !== segments.length - 1 ? (
                                <BreadcrumbLink href={`/${segments.slice(0, index + 1).join('/')}`}>
                                    <p className="hover:underline hover:underline-offset-4">{segment}</p>
                                </BreadcrumbLink>
                            ) : (
                                <p className="cursor-default text-stone-400">{segment}</p>
                            )}
                        </BreadcrumbItem>
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
