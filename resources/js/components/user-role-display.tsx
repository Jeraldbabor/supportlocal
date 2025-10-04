import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Package, Shield, ShoppingBag } from 'lucide-react';

export default function UserRoleDisplay() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    if (!user) return null;

    const getRoleIcon = () => {
        switch (user.role) {
            case 'seller':
                return <Package className="h-4 w-4" />;
            case 'administrator':
                return <Shield className="h-4 w-4" />;
            case 'buyer':
                return <ShoppingBag className="h-4 w-4" />;
            default:
                return <Shield className="h-4 w-4" />;
        }
    };

    const getRoleColor = () => {
        switch (user.role) {
            case 'seller':
                return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
            case 'administrator':
                return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800';
            case 'buyer':
                return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/50 dark:text-gray-300 dark:border-gray-800';
        }
    };

    const getRoleDisplayName = () => {
        switch (user.role) {
            case 'seller':
                return 'Seller/Artisan';
            case 'administrator':
                return 'Administrator';
            case 'buyer':
                return 'Buyer';
            default:
                return 'User';
        }
    };

    return (
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${getRoleColor()}`}>
            {getRoleIcon()}
            <span>{getRoleDisplayName()}</span>
        </div>
    );
}
