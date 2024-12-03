'use client';
import React from 'react';
import Link from 'next/link';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import logo from '@/public/static/logo-retina.png';
import { signOut } from 'next-auth/react';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardSideNavProps } from '@/types';
import { ChevronDown, Settings, LayoutDashboard } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

export default function DashboardSideNav({ user }: DashboardSideNavProps) {
    const { open } = useSidebar();
    const items = [
        {
            title: 'Overview',
            icon: LayoutDashboard,
            subNav: [
                {
                    title: 'Product',
                    ulr: '/dashboard/product',
                },
            ],
        },
        {
            title: 'Setting',
            icon: Settings,
            subNav: [
                {
                    title: 'Product',
                    ulr: '/dashboard/product',
                },
            ],
        },
    ];

    let nameFallback = '';

    if (user.name) {
        nameFallback = user.name.charAt(0);
    }

    return (
        <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center justify-center">
                        <Link href={'/dashboard'}>
                            <Image
                                src={logo}
                                alt="logo"
                                quality={100}
                                priority
                                className="h-10 w-auto cursor-pointer"
                            />
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent className="bg-slate-100">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-black">Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item, index) => (
                                <Collapsible
                                    className="group/collapsible"
                                    key={index}
                                    defaultOpen={index === 0 ? true : false}
                                >
                                    <SidebarMenuItem
                                        key={index}
                                        className={`${!open && 'flex items-center justify-center'}`}
                                    >
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                asChild
                                                className="hover:cursor-pointer data-[state=closed]:bg-slate-200 data-[state=open]:bg-slate-200 data-[state=open]:hover:bg-slate-200"
                                            >
                                                <div>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                </div>
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub className="border-slate-400">
                                                {item.subNav &&
                                                    item.subNav.map((item, index) => (
                                                        <SidebarMenuSubItem
                                                            key={index}
                                                            className="hover:underline hover:decoration-from-font"
                                                        >
                                                            <Link href={item.ulr}>
                                                                <span>{item.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            {/* <SidebarFooter>
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex justify-between" asChild>
                                    <div className="flex w-full items-center justify-between">
                                        <Avatar className="cursor-pointer">
                                            <AvatarImage src={user.image || ''} alt={user.name || 'not name account'} />
                                            <AvatarFallback>{nameFallback}</AvatarFallback>
                                        </Avatar>
                                        <SidebarMenuButton className={`flex justify-between ${!open && 'hidden'}`}>
                                            <span className="overflow-hidden">{user.name}</span>
                                            <ChevronsUpDown />
                                        </SidebarMenuButton>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <Button variant="outline" onClick={() => signOut()} className="w-full">
                                        Sign Out
                                    </Button>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
            </SidebarFooter> */}
        </Sidebar>
    );
}
