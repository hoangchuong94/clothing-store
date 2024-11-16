import { TriangleAlert } from 'lucide-react';
interface FormErrorProps {
    message?: string;
}

export const FormError = ({ message }: FormErrorProps) => {
    if (!message) return null;

    return (
        <div className="mt-2 flex items-center gap-x-2 rounded-md bg-red-300/40 p-3 text-sm text-red-500">
            <TriangleAlert className="h-4 w-4" />
            <p>{message}</p>
        </div>
    );
};
