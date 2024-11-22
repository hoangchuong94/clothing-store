import Link from 'next/link';
import React from 'react';

interface FooterAuthProps {
    label: string;
    href: string;
}

export default function FooterAuth({ label, href }: FooterAuthProps) {
    return (
        <Link href={href} className="my-4 flex w-full items-center justify-center text-sm">
            <p className="text-black">
                {label}
                <span className="text-blue-500 active:opacity-5">click here</span>
            </p>
        </Link>
    );
}
