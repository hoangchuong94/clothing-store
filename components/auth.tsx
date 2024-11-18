import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/auth-header';
import Footer from '@/components/auth-footer';

interface AuthCardWrapperProps {
    headerLabel: string;
    footerLabel: string;
    footerHref: string;
    children: React.ReactNode;
    className?: string;
}

export default function AuthCardWrapper({
    headerLabel,
    footerLabel,
    footerHref,
    children,
    className,
}: AuthCardWrapperProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <Header label={headerLabel} />
            </CardHeader>
            <CardContent>{children}</CardContent>
            <CardFooter>
                <Footer href={footerHref} label={footerLabel} />
            </CardFooter>
        </Card>
    );
}
