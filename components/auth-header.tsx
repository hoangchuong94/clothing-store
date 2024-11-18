import React from 'react';
import Logo from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import logo from '@/public/static/logo-retina.png';

export default function AuthHeader({ label }: { label: string }) {
    return (
        <div>
            <Logo className="w-20" alt="logo auth" href="/" urlStatic={logo} />
            <div className="text-center font-serif text-4xl">
                <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                    {label}
                </span>
            </div>
            <Separator className="mt-5 bg-slate-500" />
        </div>
    );
}
