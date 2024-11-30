import { FieldValues, FieldPath, UseControllerProps, ControllerRenderProps } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import CheckboxPopsUp from '@/components/custom/custom-checkbox';
import CustomSelect from '@/components/custom/custom-select';
import { Textarea } from '@/components/ui/textarea';
import { useMemo, useCallback } from 'react';
import UploadImage from '@/components/uploader-image';
import UploadImages from '@/components/uploader-images';
import { type FileState } from '@/components/multi-image-dropzone';

interface GenericFieldProps<TFieldValues extends FieldValues> {
    label?: string;
    renderInput: (field: ControllerRenderProps<TFieldValues, any>) => React.ReactNode;
}

export const GenericField = <TFieldValues extends FieldValues>({
    label,
    renderInput,
    ...fieldProps
}: GenericFieldProps<TFieldValues> & UseControllerProps<TFieldValues>) => (
    <FormField
        control={fieldProps.control}
        name={fieldProps.name as FieldPath<TFieldValues>}
        render={({ field }) => (
            <FormItem>
                <FormLabel>{label}</FormLabel>
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

interface InputFieldProps<TFieldValues extends FieldValues> extends UseControllerProps<TFieldValues> {
    className?: string;
    label: string;
    placeholder: string;
    type?: string;
}

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

interface NumericInputFieldProps<TFieldValues extends FieldValues> extends UseControllerProps<TFieldValues> {
    className?: string;
    label: string;
    placeholder: string;
}

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

interface TextAreaFieldProps<TFieldValues extends FieldValues> extends UseControllerProps<TFieldValues> {
    className?: string;
    label: string;
    placeholder: string;
}

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

interface SelectFieldProps<TFieldValues extends FieldValues, TItem> extends UseControllerProps<TFieldValues> {
    label: string;
    items: TItem[];
    getItemKey: (item: TItem) => string | number;
    renderItem: (item: TItem) => string;
    placeholder?: string;
    disabled?: boolean;
}

export const SelectField = <TFieldValues extends FieldValues, TItem>({
    label,
    items = [],
    getItemKey,
    renderItem,
    placeholder = 'Select an item',
    disabled,
    ...fieldProps
}: SelectFieldProps<TFieldValues, TItem>) => {
    const memoizedItems = useMemo(() => items, [items]);

    const memoizedRenderItem = useCallback((item: TItem) => renderItem(item), [renderItem]);

    return (
        <GenericField
            label={label}
            {...fieldProps}
            renderInput={(field) => (
                <CustomSelect
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

interface CheckboxFieldProps<TFieldValues extends FieldValues, TItem> extends UseControllerProps<TFieldValues> {
    label: string;
    items: TItem[];
    getItemKey: (item: TItem) => string | number;
    renderItem: (item: TItem) => string;
    disabled?: boolean;
}

export const CheckboxField = <TFieldValues extends FieldValues, TItem>({
    label,
    items,
    getItemKey,
    renderItem,
    disabled,
    ...fieldProps
}: CheckboxFieldProps<TFieldValues, TItem>) => {
    const memoizedItems = useMemo(() => items, [items]);
    const memoizedRenderItem = useCallback((item: TItem) => renderItem(item), [renderItem]);

    return (
        <GenericField
            label={label}
            {...fieldProps}
            renderInput={(field) => (
                <CheckboxPopsUp
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

interface ImageFieldProps<TFieldValues extends FieldValues> extends UseControllerProps<TFieldValues> {
    className?: string;
    label?: string;
    setUrl: React.Dispatch<React.SetStateAction<string>>;
}

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

interface ImagesFieldProps<TFieldValues extends FieldValues> extends UseControllerProps<TFieldValues> {
    className?: string;
    label?: string;
    setUrls: React.Dispatch<React.SetStateAction<string[]>>;
}

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
