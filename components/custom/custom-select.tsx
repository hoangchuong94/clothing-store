'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CustomSelectProps<T> {
    items: T[];
    value: T;
    getItemName: (item: T) => string;
    getKey: (item: T) => string | number;
    onChange?: (value: T | null) => void;
    disabled?: boolean;
}

export default function CustomSelect<T>({
    items = [],
    value,
    getItemName,
    getKey,
    onChange,
    disabled = false,
}: CustomSelectProps<T>) {
    const [open, setOpen] = React.useState(false);
    const selectedItemName = React.useMemo(() => (value ? getItemName(value) : 'Select item'), [value, getItemName]);

    const handleSelect = React.useCallback(
        (currentValue: string) => {
            const selectedItem = items.find((item) => getItemName(item) === currentValue);

            if (onChange) {
                onChange(selectedItem || null);
            }
            setOpen(false);
        },
        [items, getItemName, onChange],
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    aria-labelledby="custom-select-button"
                    className="justify-between"
                    disabled={disabled}
                >
                    {selectedItemName}
                    <ChevronsUpDown className={cn('ml-2 h-4 w-4 shrink-0 opacity-50')} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
                <Command>
                    <CommandInput placeholder="Search..." disabled={disabled} />
                    <CommandList>
                        <CommandEmpty>No data</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    className="cursor-pointer"
                                    key={getKey(item)}
                                    value={getItemName(item)}
                                    onSelect={() => handleSelect(getItemName(item))}
                                    disabled={disabled}
                                    aria-selected={value && getItemName(value) === getItemName(item) ? true : false}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value && getItemName(value) === getItemName(item)
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                    {getItemName(item)}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
