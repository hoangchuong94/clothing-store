import { useMemo, useCallback } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FieldValues, FieldPath, UseControllerProps, ControllerRenderProps } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';

import UploadImage from '@/components/uploader-image';
import UploadImages from '@/components/uploader-images';
import PopoverCheckbox from '@/components/custom/popover-checkbox';
import PopoverSelect from '@/components/custom/popover-select';

interface GenericFieldProps<TFieldValues extends FieldValues> {
    label?: string;
    description?: string;
    renderInput: (field: ControllerRenderProps<TFieldValues, any>) => React.ReactNode;
}

interface InputFieldProps<TFieldValues extends FieldValues> extends UseControllerProps<TFieldValues> {
    className?: string;
    label: string;
    placeholder: string;
    type?: string;
}

interface NumericInputFieldProps<TFieldValues extends FieldValues> extends UseControllerProps<TFieldValues> {
    className?: string;
    label: string;
    placeholder: string;
}
interface TextAreaFieldProps<TFieldValues extends FieldValues> extends UseControllerProps<TFieldValues> {
    className?: string;
    label: string;
    placeholder: string;
}
interface PopoverSelectFieldProps<TFieldValues extends FieldValues, TItem> extends UseControllerProps<TFieldValues> {
    label: string;
    items: TItem[];
    getItemKey: (item: TItem) => string | number;
    renderItem: (item: TItem) => string;
    placeholder?: string;
    disabled?: boolean;
}
interface PopoverCheckboxFieldProps<TFieldValues extends FieldValues, TItem> extends UseControllerProps<TFieldValues> {
    label: string;
    items: TItem[];
    getItemKey: (item: TItem) => string | number;
    renderItem: (item: TItem) => string;
    disabled?: boolean;
}

interface ToggleGroupFieldProps<TFieldValues extends FieldValues, TItem> extends UseControllerProps<TFieldValues> {
    label: string;
    items: TItem[];
    getItemKey: (item: TItem) => string | number;
    renderItem: (item: TItem) => string;
    description: string;
    className?: string;
}

interface RadioGroupFieldProps<TFieldValues extends FieldValues, TItem> extends UseControllerProps<TFieldValues> {
    label: string;
    items: TItem[];
    getItemKey: (item: TItem) => string | number;
    renderItem: (item: TItem) => string;
    description: string;
    className?: string;
}

interface SelectGroupFieldProps<TFieldValues extends FieldValues, TItem> extends UseControllerProps<TFieldValues> {
    label: string;
    placeholder: string;
    items: TItem[];
    getItemKey: (item: TItem) => string | number;
    renderItem: (item: TItem) => string;
    description?: string;
    classNameBtn?: string;
    classNameContent?: string;
    classNameItem?: string;
}

interface ImageFieldProps<TFieldValues extends FieldValues> extends UseControllerProps<TFieldValues> {
    className?: string;
    label?: string;
    setUrl: React.Dispatch<React.SetStateAction<string>>;
}
interface ImagesFieldProps<TFieldValues extends FieldValues> extends UseControllerProps<TFieldValues> {
    className?: string;
    label?: string;
    setUrls: React.Dispatch<React.SetStateAction<string[]>>;
}

export const GenericField = <TFieldValues extends FieldValues>({
    label,
    description,
    renderInput,
    ...fieldProps
}: GenericFieldProps<TFieldValues> & UseControllerProps<TFieldValues>) => (
    <FormField
        control={fieldProps.control}
        name={fieldProps.name as FieldPath<TFieldValues>}
        render={({ field }) => (
            <FormItem className="flex flex-col">
                {label && <FormLabel>{label}</FormLabel>}
                {description && <FormDescription>{description}</FormDescription>}
                <FormControl>{renderInput(field)}</FormControl>
                <FormMessage />
            </FormItem>
        )}
    />
);

const preventInvalidNumberInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const invalidChars = ['e', 'E', '+', '-', '0'];
    if (event.currentTarget.value === '' && event.key === '0') {
        event.preventDefault();
    } else if (event.currentTarget.value === '' && event.key === '.') {
        event.preventDefault();
    } else if (invalidChars.includes(event.key)) {
        event.preventDefault();
    }
};

export const SelectGroupField = <TFieldValues extends FieldValues, TItem>({
    label,
    items = [],
    getItemKey,
    renderItem,
    description,
    placeholder,
    classNameBtn,
    classNameContent,
    classNameItem,
    ...fieldProps
}: SelectGroupFieldProps<TFieldValues, TItem>) => {
    return (
        <GenericField
            label={label}
            description={description}
            {...fieldProps}
            renderInput={(field) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className={classNameBtn}>
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent className={classNameContent}>
                        {items.map((item) => (
                            <SelectItem value={renderItem(item)} key={getItemKey(item)} className={classNameItem}>
                                {renderItem(item)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        />
    );
};

export const RadioGroupField = <TFieldValues extends FieldValues, TItem>({
    label,
    items = [],
    getItemKey,
    renderItem,
    description,
    className,
    ...fieldProps
}: RadioGroupFieldProps<TFieldValues, TItem>) => {
    return (
        <GenericField
            label={label}
            description={description}
            {...fieldProps}
            renderInput={(field) => (
                <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value[0]}
                    className="flex flex-1 space-y-1"
                >
                    {items.map((item) => {
                        return (
                            <FormItem className="flex items-center space-x-3 space-y-0" key={getItemKey(item)}>
                                <FormControl>
                                    <RadioGroupItem value={renderItem(item)} className={className} />
                                </FormControl>
                                <FormLabel className="font-normal">{renderItem(item)}</FormLabel>
                            </FormItem>
                        );
                    })}
                </RadioGroup>
            )}
        />
    );
};

export const ToggleGroupField = <TFieldValues extends FieldValues, TItem>({
    label,
    items = [],
    getItemKey,
    renderItem,
    description,
    className,
    ...fieldProps
}: ToggleGroupFieldProps<TFieldValues, TItem>) => {
    return (
        <GenericField
            label={label}
            description={description}
            {...fieldProps}
            renderInput={(field) => (
                <ToggleGroup
                    type="multiple"
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex justify-start"
                >
                    {items.map((item) => {
                        return (
                            <ToggleGroupItem key={getItemKey(item)} value={renderItem(item)} className={className}>
                                {renderItem(item)}
                            </ToggleGroupItem>
                        );
                    })}
                </ToggleGroup>
            )}
        />
    );
};

export const InputField = <TFieldValues extends FieldValues>({
    className,
    label,
    placeholder,
    type = 'text',
    ...fieldProps
}: InputFieldProps<TFieldValues>) => (
    <GenericField
        label={label}
        {...fieldProps}
        renderInput={(field) => (
            <Input {...field} value={field.value ?? ''} placeholder={placeholder} type={type} className={className} />
        )}
    />
);

export const NumericInputField = <TFieldValues extends FieldValues>({
    className,
    label,
    placeholder,
    ...fieldProps
}: NumericInputFieldProps<TFieldValues>) => (
    <GenericField
        label={label}
        {...fieldProps}
        renderInput={(field) => (
            <Input
                {...field}
                placeholder={placeholder}
                type="number"
                inputMode="numeric"
                className={className}
                value={(field.value === 0 ? '' : field.value) ?? ''}
                onKeyDown={preventInvalidNumberInput}
            />
        )}
    />
);

export const TextAreaField = <TFieldValues extends FieldValues>({
    className,
    label,
    placeholder,
    ...fieldProps
}: TextAreaFieldProps<TFieldValues>) => (
    <GenericField
        label={label}
        {...fieldProps}
        renderInput={(field) => <Textarea placeholder={placeholder} className={className} {...field} />}
    />
);

export const PopoverSelectField = <TFieldValues extends FieldValues, TItem>({
    label,
    items = [],
    getItemKey,
    renderItem,
    placeholder = 'Select an item',
    disabled,
    ...fieldProps
}: PopoverSelectFieldProps<TFieldValues, TItem>) => {
    const memoizedItems = useMemo(() => items, [items]);

    const memoizedRenderItem = useCallback((item: TItem) => renderItem(item), [renderItem]);

    return (
        <GenericField
            label={label}
            {...fieldProps}
            renderInput={(field) => (
                <PopoverSelect
                    items={memoizedItems}
                    value={field.value}
                    getItemName={memoizedRenderItem}
                    getKey={getItemKey}
                    onChange={field.onChange}
                    disabled={disabled}
                />
            )}
        />
    );
};

export const PopoverCheckboxField = <TFieldValues extends FieldValues, TItem>({
    label,
    items,
    getItemKey,
    renderItem,
    disabled,
    ...fieldProps
}: PopoverCheckboxFieldProps<TFieldValues, TItem>) => {
    const memoizedItems = useMemo(() => items, [items]);
    const memoizedRenderItem = useCallback((item: TItem) => renderItem(item), [renderItem]);

    return (
        <GenericField
            label={label}
            {...fieldProps}
            renderInput={(field) => (
                <PopoverCheckbox
                    items={memoizedItems}
                    value={field.value}
                    onChange={field.onChange}
                    renderItem={memoizedRenderItem}
                    getItemKey={getItemKey}
                    disabled={disabled}
                />
            )}
        />
    );
};

export const ImageField = <TFieldValues extends FieldValues>({
    label,
    setUrl,
    ...fieldProps
}: ImageFieldProps<TFieldValues>) => (
    <GenericField
        label={label}
        {...fieldProps}
        renderInput={(field) => (
            <UploadImage file={field.value as File | string} onChange={field.onChange} setUrl={setUrl} />
        )}
    />
);

export const ImagesField = <TFieldValues extends FieldValues>({
    label,
    setUrls,
    ...fieldProps
}: ImagesFieldProps<TFieldValues>) => (
    <GenericField
        label={label}
        {...fieldProps}
        renderInput={(field) => {
            return <UploadImages setUrls={setUrls} onChange={field.onChange} initialFileStates={field.value} />;
        }}
    />
);
