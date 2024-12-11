import React from 'react';
import { Slash } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import LinkHierarchy from '@/components/link-hierarchy';

export default function DashboardHeader() {
    return (
        <div className="flex h-14 items-center justify-between px-2">
            <div className="flex items-center justify-center">
                <SidebarTrigger />
                <BreadcrumbSeparator className="list-none">
                    <Slash />
                </BreadcrumbSeparator>
                <LinkHierarchy />
            </div>
        </div>
    );
}
