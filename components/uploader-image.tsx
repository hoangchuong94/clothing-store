'use client';

import { useEffect, useState, useCallback } from 'react';
import { SingleImageDropzone } from '@/components/single-image-dropzone';
import { useEdgeStore } from '@/lib/edgestore';
import { Progress } from '@/components/ui/progress';

interface UploadImageProps {
    file: File | string;
    onChange: (file: File | string) => void;
    setUrl: React.Dispatch<React.SetStateAction<string>>;
}

export default function UploadImage({ file, setUrl, onChange }: UploadImageProps) {
    const { edgestore } = useEdgeStore();
    const [isAutoUpdate, setIsAutoUpdate] = useState(true);
    const [progress, setProgress] = useState(0);

    const handleUpload = useCallback(
        async (file: File) => {
            try {
                const res = await edgestore.publicImages.upload({
                    file,
                    input: { type: 'thumbnail' },
                    options: { temporary: true },
                    onProgressChange: (progress) => {
                        setProgress(progress);
                    },
                });
                return res;
            } catch (error) {
                console.error('Image upload failed:', error);
                return null;
            } finally {
                setIsAutoUpdate(false);
            }
        },
        [edgestore],
    );

    useEffect(() => {
        if (isAutoUpdate && file instanceof File) {
            handleUpload(file).then((imageUploaded) => {
                if (imageUploaded) {
                    setUrl(imageUploaded.url);
                }
            });
        }
    }, [file, isAutoUpdate, handleUpload, setUrl]);

    return (
        <>
            <SingleImageDropzone
                className="bg-white md:h-[160px] md:w-[160px] lg:h-[200px] lg:w-[200px] xl:h-[250px] xl:w-[250px]"
                value={file}
                onChange={(newFile) => {
                    setIsAutoUpdate(true);
                    setProgress(0);
                    onChange(newFile || '');
                }}
                dropzoneOptions={{
                    maxSize: 1000000,
                }}
            />
            {/* <Progress className="mt-0 h-2 w-[300px]" value={!file ? 0 : progress} /> */}
        </>
    );
}
