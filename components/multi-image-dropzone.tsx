'use client';

import { formatFileSize } from '@edgestore/react/utils';
import { Plus, UploadCloudIcon, X } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { twMerge } from 'tailwind-merge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const variants = {
    base: 'relative  rounded-md aspect-square flex justify-center items-center flex-col  min-h-[60px] min-w-[60px] cursor-pointer border border-dashed border-gray-400 dark:border-gray-300 transition-colors duration-200 ease-in-out',
    image: 'border-0 p-0 w-full h-full relative shadow-md bg-slate-200 dark:bg-slate-900 rounded-md',
    active: 'border-2',
    disabled: 'bg-gray-200 border-gray-300 cursor-default pointer-events-none bg-opacity-30 dark:bg-gray-700',
    accept: 'border border-blue-500 bg-blue-500 bg-opacity-10',
    reject: 'border border-red-700 bg-red-700 bg-opacity-10',
};

export type FileState = {
    file: File | string;
    key: string; // used to identify the file in the progress callback
    progress: 'PENDING' | 'COMPLETE' | 'ERROR' | number;
};

type InputProps = {
    className?: string;
    value?: FileState[];
    onChange?: (files: FileState[]) => void | Promise<void>;
    onFilesAdded?: (addedFiles: FileState[]) => void | Promise<void>;
    disabled?: boolean;
    dropzoneOptions?: DropzoneOptions & { maxSize?: number };
};

const ERROR_MESSAGES = {
    fileTooLarge(maxSize: number) {
        return `The file is too large. Max size is ${formatFileSize(maxSize)}.`;
    },
    fileInvalidType() {
        return 'Invalid file type.';
    },
    tooManyFiles(maxFiles: number) {
        return `You can only add ${maxFiles} file(s).`;
    },
    fileNotSupported() {
        return 'The file is not supported.';
    },
};

const MultiImageDropzone = React.forwardRef<HTMLInputElement, InputProps>(
    ({ dropzoneOptions, value, className, disabled, onChange, onFilesAdded }, ref) => {
        const [customError, setCustomError] = React.useState<string>();

        const imageUrls = React.useMemo(() => {
            if (value) {
                return value.map((fileState) => {
                    if (typeof fileState.file === 'string') {
                        // in case an url is passed in, use it to display the image
                        return fileState.file;
                    } else {
                        // in case a file is passed in, create a base64 url to display the image
                        return URL.createObjectURL(fileState.file);
                    }
                });
            }
            return [];
        }, [value]);

        // dropzone configuration
        const { getRootProps, getInputProps, fileRejections, isFocused, isDragAccept, isDragReject } = useDropzone({
            accept: { 'image/*': [] },
            disabled,
            onDrop: (acceptedFiles) => {
                const files = acceptedFiles;
                setCustomError(undefined);

                const maxSize = dropzoneOptions?.maxSize; // Lấy giá trị maxSize từ dropzoneOptions
                if (maxSize && acceptedFiles.some((file) => file.size > maxSize)) {
                    setCustomError(ERROR_MESSAGES.fileTooLarge(maxSize));
                    return;
                }

                if (dropzoneOptions?.maxFiles && (value?.length ?? 0) + files.length > dropzoneOptions.maxFiles) {
                    setCustomError(ERROR_MESSAGES.tooManyFiles(dropzoneOptions.maxFiles));
                    return;
                }
                if (files) {
                    const addedFiles = files.map<FileState>((file) => ({
                        file,
                        key: Math.random().toString(36).slice(2),
                        progress: 'PENDING',
                    }));
                    void onFilesAdded?.(addedFiles);
                    void onChange?.([...(value ?? []), ...addedFiles]);
                }
            },
            ...dropzoneOptions,
        });

        // styling
        const dropZoneClassName = React.useMemo(
            () =>
                twMerge(
                    variants.base,
                    isFocused && variants.active,
                    disabled && variants.disabled,
                    (isDragReject ?? fileRejections[0]) && variants.reject,
                    isDragAccept && variants.accept,
                    className,
                ).trim(),
            [isFocused, fileRejections, isDragAccept, isDragReject, disabled, className],
        );

        // error validation messages
        const errorMessage = React.useMemo(() => {
            if (fileRejections[0]) {
                const { errors } = fileRejections[0];
                if (errors[0]?.code === 'file-too-large') {
                    return ERROR_MESSAGES.fileTooLarge(dropzoneOptions?.maxSize ?? 0);
                } else if (errors[0]?.code === 'file-invalid-type') {
                    return ERROR_MESSAGES.fileInvalidType();
                } else if (errors[0]?.code === 'too-many-files') {
                    return ERROR_MESSAGES.tooManyFiles(dropzoneOptions?.maxFiles ?? 0);
                } else {
                    return ERROR_MESSAGES.fileNotSupported();
                }
            }
            return undefined;
        }, [fileRejections, dropzoneOptions]);

        return (
            <div>
                <Carousel className="flex items-center justify-center">
                    <CarouselContent
                        className={`${value && value?.length === 0 && 'flex items-center justify-center'}`}
                    >
                        <CarouselItem className={`${value && value?.length > 0 ? 'basis-1/3' : 'h-[100px] w-[100px]'}`}>
                            {(!value || value.length < (dropzoneOptions?.maxFiles ?? 0)) && (
                                <div
                                    {...getRootProps({
                                        className: dropZoneClassName,
                                    })}
                                >
                                    <input ref={ref} {...getInputProps()} />
                                    <div className="flex flex-col items-center justify-center text-xs text-gray-400">
                                        <Plus />
                                    </div>
                                </div>
                            )}
                        </CarouselItem>
                        {value?.map(({ file, progress }, index) => (
                            <CarouselItem key={index} className="basis-1/3 hover:cursor-grab">
                                <div key={index} className={variants.image + ' aspect-square'}>
                                    <Image
                                        className="h-full w-full rounded-md object-cover"
                                        src={imageUrls[index]}
                                        alt={typeof file === 'string' ? file : file.name}
                                        width={500}
                                        height={500}
                                        priority
                                    />
                                    {typeof progress === 'number' && (
                                        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-md bg-black bg-opacity-70">
                                            <CircleProgress progress={progress} />
                                        </div>
                                    )}

                                    {typeof progress === 'number' && progress === 0 && (
                                        <div
                                            className="group absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 transform"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                void onChange?.(value.filter((_, i) => i !== index) ?? []);
                                            }}
                                        >
                                            <div className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border border-solid border-gray-500 bg-white transition-all duration-300 hover:h-6 hover:w-6 dark:border-gray-400 dark:bg-black">
                                                <X
                                                    className="text-gray-500 dark:text-gray-400"
                                                    width={16}
                                                    height={16}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {imageUrls[index] && !disabled && progress === 'PENDING' && (
                                        <div
                                            className="group absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 transform"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                void onChange?.(value.filter((_, i) => i !== index) ?? []);
                                            }}
                                        >
                                            <div className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border border-solid border-gray-500 bg-white transition-all duration-300 hover:h-6 hover:w-6 dark:border-gray-400 dark:bg-black">
                                                <X
                                                    className="text-gray-500 dark:text-gray-400"
                                                    width={16}
                                                    height={16}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {imageUrls[index] && !disabled && progress === 'ERROR' && (
                                        <>
                                            <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-md bg-black bg-opacity-10">
                                                <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center text-xs text-white">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                                                        <p className="text-xs text-red-500">Error</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className="group absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 transform"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    void onChange?.(value.filter((_, i) => i !== index) ?? []);
                                                }}
                                            >
                                                <div className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border border-solid border-gray-500 bg-white transition-all duration-300 hover:h-6 hover:w-6 dark:border-gray-400 dark:bg-black">
                                                    <X
                                                        className="text-gray-500 dark:text-gray-400"
                                                        width={16}
                                                        height={16}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {imageUrls[index] &&
                                        typeof file === 'string' &&
                                        !disabled &&
                                        progress === 'COMPLETE' && (
                                            <div
                                                className="group absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 transform"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    void onChange?.(value.filter((_, i) => i !== index) ?? []);
                                                }}
                                            >
                                                <div className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border border-solid border-gray-500 bg-white transition-all duration-300 hover:h-6 hover:w-6 dark:border-gray-400 dark:bg-black">
                                                    <X
                                                        className="text-gray-500 dark:text-gray-400"
                                                        width={16}
                                                        height={16}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-[-14px]" />
                    <CarouselNext className="right-[-14px]" />
                </Carousel>
                {/* Error Text */}
                <div className="mt-1 text-xs text-red-500">{customError ?? errorMessage}</div>
            </div>
        );
    },
);
MultiImageDropzone.displayName = 'MultiImageDropzone';

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, ...props }, ref) => {
        return (
            <button
                className={twMerge(
                    // base
                    'focus-visible:ring-ring inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50',
                    // color
                    'border border-gray-400 text-gray-400 shadow hover:bg-gray-100 hover:text-gray-500 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700',
                    // size
                    'h-6 rounded-md px-2 text-xs',
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);
Button.displayName = 'Button';

export { MultiImageDropzone };

function CircleProgress({ progress }: { progress: number }) {
    const strokeWidth = 10;
    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="relative h-16 w-16">
            <svg
                className="absolute left-0 top-0 -rotate-90 transform"
                width="100%"
                height="100%"
                viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    className="text-gray-400"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    cx={radius + strokeWidth}
                    cy={radius + strokeWidth}
                    r={radius}
                />
                <circle
                    className="text-white transition-all duration-300 ease-in-out"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={((100 - progress) / 100) * circumference}
                    strokeLinecap="round"
                    fill="none"
                    cx={radius + strokeWidth}
                    cy={radius + strokeWidth}
                    r={radius}
                />
            </svg>
            <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center text-xs text-white">
                {Math.round(progress)}%
            </div>
        </div>
    );
}
