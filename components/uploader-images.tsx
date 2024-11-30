'use client';
import { MultiImageDropzone, type FileState } from '@/components/multi-image-dropzone';

import React, { useCallback, useEffect, useState } from 'react';
import { UploadedImage } from '@/types';
import { useEdgeStore } from '@/lib/edgestore';

interface UploadImagesProps {
    setUrls: React.Dispatch<React.SetStateAction<string[]>>;
    initialFileStates: FileState[];
    onChange: (...event: any[]) => void;
}

export default function UploadImages({ setUrls, initialFileStates, onChange }: UploadImagesProps) {
    const { edgestore } = useEdgeStore();
    const [fileStates, setFileStates] = useState<FileState[]>(initialFileStates);

    const updateFileProgress = useCallback(
        (key: string, progress: FileState['progress']) => {
            setFileStates((fileStates) => {
                const newFileStates = structuredClone(fileStates);
                const fileState = newFileStates.find((fileState) => fileState.key === key);
                if (fileState) {
                    fileState.progress = progress;
                }
                return newFileStates;
            });
        },
        [setFileStates],
    );

    const uploadImages = useCallback(
        async (addedFiles: FileState[]) => {
            const data = await Promise.all(
                addedFiles.map(async (file) => {
                    if (file.file instanceof File) {
                        try {
                            const res = await edgestore.publicImages.upload({
                                file: file.file,
                                input: { type: 'product' },
                                options: {
                                    temporary: true,
                                },
                                onProgressChange: async (progress) => {
                                    updateFileProgress(file.key, progress);
                                    if (progress === 100) {
                                        await new Promise((resolve) => setTimeout(resolve, 1000));
                                        updateFileProgress(file.key, 'COMPLETE');
                                    }
                                },
                            });
                            return res;
                        } catch (err: any) {
                            updateFileProgress(file.key, 'ERROR');
                        }
                    } else {
                        updateFileProgress(file.key, 'ERROR');
                    }
                }),
            );
            return data;
        },
        [edgestore, updateFileProgress],
    );

    const handleOnChange = (files: FileState[]) => {
        const urlChange = fileStates.reduce<string[]>((acc, item) => {
            if (typeof item.file === 'string' && item.progress === 'COMPLETE') {
                acc.push(item.file);
            }
            return acc;
        }, []);
        setUrls(urlChange);
        setFileStates(files);
    };

    const handleOnFilesAdded = useCallback(
        async (addedFiles: FileState[]) => {
            setFileStates((prevFileStates) => [...prevFileStates, ...addedFiles]);

            try {
                const imageUploader = await uploadImages(addedFiles);

                const validImages = imageUploader.filter(
                    (img): img is UploadedImage => img !== null && img !== undefined,
                );
                const urlsUploaded = validImages.map((item) => item.url);
                setUrls((prev) => [...prev, ...urlsUploaded]);
            } catch (error) {
                console.error('Failed to upload images:', error);
            }
        },
        [uploadImages, setUrls, setFileStates],
    );

    useEffect(() => {
        if (fileStates.length > 0) {
            onChange(fileStates);
        }
    }, [fileStates, onChange]);

    useEffect(() => {
        //reset form
        if (initialFileStates.length === 0) {
            setFileStates([]);
        }
    }, [setFileStates, initialFileStates]);

    return (
        <MultiImageDropzone
            className="bg-white"
            value={fileStates}
            dropzoneOptions={{
                maxFiles: 6,
                maxSize: 1000000,
            }}
            onChange={handleOnChange}
            onFilesAdded={handleOnFilesAdded}
        />
    );
}
