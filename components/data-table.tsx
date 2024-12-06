'use client';
import React from 'react';
import { Input } from '@/components/ui/input';

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
    VisibilityState,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/data-table-pagination';
import { DataTableViewOptions } from '@/components/data-table-view-options';
import { DatePickerWithRange } from '@/components/data-date-picker';
import { DateRange } from 'react-day-picker';
import { Button } from './ui/button';
import Link from 'next/link';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData extends { createdAt?: Date }, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    console.log(data);
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const [rowSelection, setRowSelection] = React.useState({});

    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);

    console.log();

    const filteredData = React.useMemo(() => {
        if (!dateRange || !dateRange.from || !dateRange.to) return data;

        return data.filter((item) => {
            if (item.createdAt !== undefined && item.createdAt !== null) {
                const productDate = new Date(item.createdAt);
                if (dateRange && dateRange.from && dateRange.to) {
                    return productDate >= dateRange.from && productDate <= dateRange.to;
                }
                return data;
            }
            return data;
        });
    }, [data, dateRange]);

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div>
            <div className="mb-4 flex justify-between space-x-2">
                <Link href={'/dashboard/product/create'}>
                    <Button className="bg-green-400 text-white">Create Product</Button>
                </Link>
                <div className="flex space-x-2">
                    <div className="relative">
                        <Input
                            placeholder="Filter name..."
                            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                            className="focus:outline-primary hover:border-brand-500-secondary- invalid:border-error-500 invalid:focus:border-error-500 peer block h-[36px] w-full appearance-none overflow-hidden overflow-ellipsis text-nowrap rounded-[8px] border border-slate-200 bg-white px-4 pr-[48px] text-sm text-slate-900 focus:border-transparent focus:outline focus:outline-2 focus:ring-0"
                            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                            id="floating_outlined"
                            type="text"
                        />
                        <label
                            className="text-primary peer-focus:text-primary peer-invalid:text-error-500 focus:invalid:text-error-500 data-[disabled]:bg-gray-50-background- absolute start-1 top-2 z-10 origin-[0] -translate-y-[1.2rem] scale-75 transform bg-white px-2 text-[14px] leading-[150%] duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-z-10 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:z-10 peer-focus:-translate-y-[1.2rem] peer-focus:scale-75 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
                            htmlFor="floating_outlined"
                        >
                            Search...
                        </label>
                        <div className="absolute right-3 top-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="slate-300"
                                viewBox="0 0 24 24"
                                height="20"
                                width="20"
                            >
                                <path d="M10.979 16.8991C11.0591 17.4633 10.6657 17.9926 10.0959 17.9994C8.52021 18.0183 6.96549 17.5712 5.63246 16.7026C4.00976 15.6452 2.82575 14.035 2.30018 12.1709C1.77461 10.3068 1.94315 8.31525 2.77453 6.56596C3.60592 4.81667 5.04368 3.42838 6.82101 2.65875C8.59833 1.88911 10.5945 1.79039 12.4391 2.3809C14.2837 2.97141 15.8514 4.21105 16.8514 5.86977C17.8513 7.52849 18.2155 9.49365 17.8764 11.4005C17.5979 12.967 16.8603 14.4068 15.7684 15.543C15.3736 15.9539 14.7184 15.8787 14.3617 15.4343C14.0051 14.9899 14.0846 14.3455 14.4606 13.9173C15.1719 13.1073 15.6538 12.1134 15.8448 11.0393C16.0964 9.62426 15.8261 8.166 15.0841 6.93513C14.3421 5.70426 13.1788 4.78438 11.81 4.34618C10.4412 3.90799 8.95988 3.98125 7.641 4.55236C6.32213 5.12348 5.25522 6.15367 4.63828 7.45174C4.02135 8.74982 3.89628 10.2276 4.28629 11.6109C4.67629 12.9942 5.55489 14.1891 6.75903 14.9737C7.67308 15.5693 8.72759 15.8979 9.80504 15.9333C10.3746 15.952 10.8989 16.3349 10.979 16.8991Z"></path>
                                <rect
                                    transform="rotate(-49.6812 12.2469 14.8859)"
                                    rx="1"
                                    height="10.1881"
                                    width="2"
                                    y="14.8859"
                                    x="12.2469"
                                ></rect>
                            </svg>
                        </div>
                    </div>
                    <DataTableViewOptions table={table} />
                    <DatePickerWithRange onDateRangeChange={setDateRange} />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-slate-200">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="pt-2">
                <DataTablePagination table={table} />
            </div>
        </div>
    );
}
