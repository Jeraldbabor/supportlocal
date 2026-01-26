import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Package, Shield, ShoppingBag } from 'lucide-react';

export default function UserRoleDisplay() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    if (!user) return null;

    const getRoleConfig = () => {
        switch (user.role) {
            case 'seller':
                return {
                    icon: <Package className="h-4 w-4" style={{ color: '#1d4ed8' }} />,
                    color: 'bg-blue-50 text-blue-700 border-blue-200',
                    name: 'Seller/Artisan',
                };
            case 'administrator':
                return {
                    icon: <Shield className="h-4 w-4" style={{ color: '#b91c1c' }} />,
                    color: 'bg-red-50 text-red-700 border-red-200',
                    name: 'Administrator',
                };
            case 'buyer':
                return {
                    icon: <ShoppingBag className="h-4 w-4" style={{ color: '#15803d' }} />,
                    color: 'bg-green-50 text-green-700 border-green-200',
                    name: 'Buyer',
                };
            default:
                return {
                    icon: <Shield className="h-4 w-4" style={{ color: '#374151' }} />,
                    color: 'bg-gray-50 text-gray-700 border-gray-200',
                    name: 'User',
                };
        }
    };

    const config = getRoleConfig();

    return (
        <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${config.color}`}
            style={{ colorScheme: 'light' }}
        >
            {config.icon}
            <span>{config.name}</span>
        </div>
    );
}
