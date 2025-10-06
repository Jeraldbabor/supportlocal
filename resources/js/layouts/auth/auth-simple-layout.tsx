import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
    sellerCount?: number;
    featuredArtisans?: Array<{
        id: number;
        name: string;
        avatar_url: string;
    }>;
}

export default function AuthSimpleLayout({ children, title, description, sellerCount = 0, featuredArtisans = [] }: PropsWithChildren<AuthLayoutProps>) {
    // Format the seller count for display
    const formatSellerCount = (count: number): string => {
        if (count >= 1000) {
            return `${Math.floor(count / 1000)}k+`;
        } else if (count >= 100) {
            return `${count}+`;
        } else {
            return count.toString();
        }
    };

    const displayCount = formatSellerCount(sellerCount);

    // Create placeholder artisans if we don't have enough real ones
    const getDisplayArtisans = () => {
        const placeholders = [
            { id: -1, name: 'Artisan 1', avatar_url: 'https://ui-avatars.com/api/?name=Artisan+1&color=7F9CF5&background=EBF4FF' },
            { id: -2, name: 'Artisan 2', avatar_url: 'https://ui-avatars.com/api/?name=Artisan+2&color=7F9CF5&background=EBF4FF' },
            { id: -3, name: 'Artisan 3', avatar_url: 'https://ui-avatars.com/api/?name=Artisan+3&color=7F9CF5&background=EBF4FF' },
            { id: -4, name: 'Artisan 4', avatar_url: 'https://ui-avatars.com/api/?name=Artisan+4&color=7F9CF5&background=EBF4FF' },
        ];
        
        // Combine real artisans with placeholders if needed
        const combined = [...featuredArtisans];
        while (combined.length < 4) {
            combined.push(placeholders[combined.length]);
        }
        
        return combined.slice(0, 4);
    };

    const displayArtisans = getDisplayArtisans();

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Artisan Images Showcase */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }} />
                </div>
                
                {/* Content overlay */}
                <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
                    <div className="max-w-md text-center space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-3xl xl:text-4xl font-bold leading-tight">
                                Discover Amazing Artisans
                            </h2>
                            <p className="text-blue-100 text-lg leading-relaxed">
                                Connect with talented local artisans and discover unique handcrafted products that tell a story.
                            </p>
                        </div>
                        
                        {/* Artisan profiles grid */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {displayArtisans.map((artisan, index) => (
                                <div key={`artisan-grid-${artisan.id}-${index}`} className="aspect-square rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 overflow-hidden relative group cursor-pointer hover:bg-white/30 transition-all duration-200">
                                    <img 
                                        src={artisan.avatar_url} 
                                        alt={artisan.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback to generated avatar if image fails to load
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.name)}&color=7F9CF5&background=EBF4FF`;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end">
                                        <div className="p-3 text-white">
                                            <span className="text-sm font-medium">{artisan.name}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex items-center justify-center space-x-2 text-blue-100">
                            <div className="flex -space-x-2">
                                {displayArtisans.slice(0, 3).map((artisan, index) => (
                                    <img
                                        key={`artisan-avatar-${artisan.id}-${index}`}
                                        src={artisan.avatar_url}
                                        alt={artisan.name}
                                        className="w-8 h-8 rounded-full border-2 border-white/50 object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.name)}&color=7F9CF5&background=EBF4FF&size=32`;
                                        }}
                                    />
                                ))}
                                {displayArtisans.length > 3 && (
                                    <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-white/50 flex items-center justify-center">
                                        <span className="text-xs font-medium">+{displayArtisans.length - 3}</span>
                                    </div>
                                )}
                            </div>
                            <span className="text-sm">
                                {sellerCount > 0 ? `Join ${displayCount} artisans` : 'Be the first artisan'}
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-48 -translate-x-48"></div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12 bg-gray-50 dark:bg-gray-900">
                <div className="w-full max-w-sm">
                    {/* Card container */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex flex-col gap-6">
                            {/* Logo and Header */}
                            <div className="flex flex-col items-center gap-4">
                                <Link href={home()} className="flex flex-col items-center gap-2 font-medium group">
                                    <img 
                                        src="/artisanicon.png" 
                                        alt="Artisan Icon" 
                                        className="size-16 drop-shadow-lg"
                                    />
                                    <span className="sr-only">{title}</span>
                                </Link>

                                <div className="space-y-2 text-center">
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                        {title}
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                        {description}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Form Content */}
                            <div className="space-y-1">
                                {children}
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
