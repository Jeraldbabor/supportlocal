import { CheckCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
}

export default function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for animation to complete
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    }[type];

    return (
        <div
            className={`fixed top-4 right-4 z-[9999] transition-all duration-300 ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
        >
            <div className={`${bgColor} flex min-w-[300px] items-center gap-3 rounded-lg px-6 py-4 text-white shadow-lg`}>
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{message}</span>
                <button onClick={handleClose} className="flex-shrink-0 text-white hover:text-gray-200">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
