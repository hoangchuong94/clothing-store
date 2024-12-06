import React from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { CommandList, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import TagList from '@/components/tag-list';

interface PopoverCheckboxProps<T> {
    items: T[];
    value: T[];
    onChange: (value: T[]) => void;
    renderItem: (item: T) => string;
    getItemKey: (item: T) => string | number;
    placeholder?: string;
    disabled?: boolean;
}

const PopoverCheckbox = <T,>({
    items = [],
    value,
    onChange,
    renderItem,
    getItemKey,
    placeholder = 'Select Item',
    disabled = false,
}: PopoverCheckboxProps<T>) => {
    const [open, setOpen] = React.useState(false);
    const handleSelect = (item: T) => {
        if (disabled) return;

        const isSelected = value.some((selected) => getItemKey(selected) === getItemKey(item));
        const newSelectedItems = isSelected
            ? value.filter((selected) => getItemKey(selected) !== getItemKey(item))
            : [...value, item];

        onChange(newSelectedItems);
    };

    return (
        <div className={`flex space-x-1 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="min-w-[200px] justify-between border border-gray-300"
                        disabled={disabled}
                    >
                        {placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="min-w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder="Search item..." disabled={disabled} />
                        <CommandGroup>
                            <CommandList>
                                {items.length > 0 ? (
                                    items.map((item) => (
                                        <CommandItem
                                            className="cursor-pointer"
                                            key={getItemKey(item)}
                                            onSelect={() => handleSelect(item)}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={String(getItemKey(item))}
                                                    checked={value.some(
                                                        (selected) => getItemKey(selected) === getItemKey(item),
                                                    )}
                                                    disabled={disabled}
                                                />
                                                <label
                                                    htmlFor={String(getItemKey(item))}
                                                    className="text-sm font-medium"
                                                >
                                                    {renderItem(item)}
                                                </label>
                                            </div>
                                        </CommandItem>
                                    ))
                                ) : (
                                    <CommandEmpty>No item found.</CommandEmpty>
                                )}
                            </CommandList>
                        </CommandGroup>
                    </Command>
                    <Separator />
                </PopoverContent>
            </Popover>
            <TagList tagList={value} renderItem={renderItem} />
        </div>
    );
};

export default PopoverCheckbox;
