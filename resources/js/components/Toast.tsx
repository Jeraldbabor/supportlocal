import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
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

    const iconColorClass = {
        success: 'text-green-500',
        error: 'text-red-500',
        info: 'text-blue-500',
    }[type];

    const Icon = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
    }[type];

    return (
        <div
            className={`fixed bottom-6 left-6 z-[9999] transition-all duration-300 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
        >
            <div className="flex min-w-[320px] max-w-md items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">
                <Icon className={`h-5 w-5 flex-shrink-0 ${iconColorClass}`} />
                <span className="flex-1 text-sm font-medium text-gray-900">{message}</span>
                <button 
                    onClick={handleClose} 
                    className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
