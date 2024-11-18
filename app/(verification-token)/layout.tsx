export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="bg-slate-200">
            <div className="mx-auto flex min-h-screen md:max-w-screen-sm">
                <div className="m-auto flex w-full p-4">
                    <div className="w-full rounded-xl border border-gray-900 bg-gradient-to-r from-gray-300 to-neutral-100">
                        <div className="p-5">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
