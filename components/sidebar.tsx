'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
    CirclePercent,
    CreditCard,
    Settings,
    LayoutDashboard,
    Store,
    ChartNoAxesCombined,
    ChevronsUpDown,
    ChevronDown,
    NotebookText,
    HandCoins,
    ListRestart,
} from 'lucide-react';
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
    useSidebar,
} from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { DashboardSideNavProps } from '@/types';
import logo from '@/public/static/logo-retina.png';

export default function DashboardSidebar({ user }: DashboardSideNavProps) {
    const pathname = usePathname();
    const { state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar } = useSidebar();
    const isActive = (path: string) => pathname.split('/').includes(path);

    return (
        <Sidebar variant="floating" collapsible="icon" className="bg-slate-300">
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
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem className="flex items-center justify-center">
                                <SidebarMenuButton
                                    asChild
                                    className={`${
                                        pathname.split('/').filter(Boolean).pop() === 'dashboard'
                                            ? 'bg-green-400 text-white hover:bg-green-400 hover:text-white'
                                            : ''
                                    }`}
                                >
                                    <Link href={'/dashboard'}>
                                        <LayoutDashboard />
                                        <span>Overview</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem className="flex items-center justify-center">
                                <SidebarMenuButton
                                    asChild
                                    className={` ${
                                        isActive('analytics')
                                            ? 'bg-green-400 text-white hover:bg-green-400 hover:text-white'
                                            : ''
                                    }`}
                                >
                                    <Link href={'/dashboard/analytics'}>
                                        <ChartNoAxesCombined />
                                        <span>Analytics</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem className="flex items-center justify-center">
                                <SidebarMenuButton
                                    asChild
                                    className={` ${
                                        isActive('product')
                                            ? 'bg-green-400 text-white hover:bg-green-400 hover:text-white'
                                            : ''
                                    }`}
                                >
                                    <Link href={'/dashboard/product'}>
                                        <Store />
                                        <span>Product</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem className="flex items-center justify-center">
                                <SidebarMenuButton
                                    asChild
                                    className={` ${
                                        isActive('sales')
                                            ? 'bg-green-400 text-white hover:bg-green-400 hover:text-white'
                                            : ''
                                    }`}
                                >
                                    <Link href={'/dashboard/sales'}>
                                        <CirclePercent />
                                        <span>Sales</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Transaction</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem className="flex items-center justify-center">
                                <SidebarMenuButton
                                    asChild
                                    className={` ${
                                        isActive('payment')
                                            ? 'bg-green-400 text-white hover:bg-green-400 hover:text-white'
                                            : ''
                                    }`}
                                >
                                    <Link href={'/dashboard/payment'}>
                                        <CreditCard />
                                        <span>Payment</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem className="flex items-center justify-center">
                                <SidebarMenuButton
                                    asChild
                                    className={` ${
                                        isActive('returns')
                                            ? 'bg-green-400 text-white hover:bg-green-400 hover:text-white'
                                            : ''
                                    }`}
                                >
                                    <Link href={'/dashboard/returns'}>
                                        <HandCoins />
                                        <span>Returns</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem className="flex items-center justify-center">
                                <SidebarMenuButton
                                    asChild
                                    className={` ${
                                        isActive('invoice')
                                            ? 'bg-green-400 text-white hover:bg-green-400 hover:text-white'
                                            : ''
                                    }`}
                                >
                                    <Link href={'/dashboard/invoice'}>
                                        <NotebookText />
                                        <span>Invoice</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem className="flex items-center justify-center">
                                <SidebarMenuButton
                                    asChild
                                    className={` ${
                                        isActive('refunds')
                                            ? 'bg-green-400 text-white hover:bg-green-400 hover:text-white'
                                            : ''
                                    }`}
                                >
                                    <Link href={'/dashboard/refunds'}>
                                        <ListRestart />
                                        <span>Refunds</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>General</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <Collapsible className="group/collapsible">
                                <SidebarMenuItem
                                    className={`hover:cursor-pointer ${!open && 'flex items-center justify-center'}`}
                                >
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton asChild>
                                            <div>
                                                <Settings />
                                                <span>Setting</span>
                                                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                            </div>
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                <Link href={'/#'}>
                                                    <span>Setting</span>
                                                </Link>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <Link href={'/#'}>
                                                    <span>Setting</span>
                                                </Link>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <Link href={'/#'}>
                                                    <span>Setting</span>
                                                </Link>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <Link href={'/#'}>
                                                    <span>Setting</span>
                                                </Link>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <Link href={'/#'}>
                                                    <span>Setting</span>
                                                </Link>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                            <Collapsible className="group/collapsible">
                                <SidebarMenuItem
                                    className={`hover:cursor-pointer ${!open && 'flex items-center justify-center'}`}
                                >
                                    <CollapsibleTrigger asChild className="hover:cursor-pointer">
                                        <SidebarMenuButton asChild>
                                            <div>
                                                <Settings />
                                                <span>Setting</span>
                                                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                            </div>
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                <Link href={'/#'}>
                                                    <span>Setting</span>
                                                </Link>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <Link href={'/#'}>
                                                    <span>Setting</span>
                                                </Link>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <Link href={'/#'}>
                                                    <span>Setting</span>
                                                </Link>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <Link href={'/#'}>
                                                    <span>Setting</span>
                                                </Link>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <Link href={'/#'}>
                                                    <span>Setting</span>
                                                </Link>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter>
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem className="flex items-center justify-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="flex w-full items-center justify-center">
                                        <Avatar className="cursor-pointer">
                                            <AvatarImage
                                                src={user.image || 'https://github.com/shadcn.png'}
                                                alt={user.name || ''}
                                            />
                                        </Avatar>
                                        <SidebarMenuButton
                                            className={`flex justify-between hover:bg-transparent ${!open && 'hidden'}`}
                                        >
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
            </SidebarFooter>
        </Sidebar>
    );
}
