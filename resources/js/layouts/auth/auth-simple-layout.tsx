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

    
    const getDisplayArtisans = () => {
        const placeholders = [
            { id: -1, name: 'Artisan 1', avatar_url: 'https://ui-avatars.com/api/?name=Artisan+1&color=7F9CF5&background=EBF4FF' },
            { id: -2, name: 'Artisan 2', avatar_url: 'https://ui-avatars.com/api/?name=Artisan+2&color=7F9CF5&background=EBF4FF' },
            { id: -3, name: 'Artisan 3', avatar_url: 'https://ui-avatars.com/api/?name=Artisan+3&color=7F9CF5&background=EBF4FF' },
            { id: -4, name: 'Artisan 4', avatar_url: 'https://ui-avatars.com/api/?name=Artisan+4&color=7F9CF5&background=EBF4FF' },
        ];
        
       
        const combined = [...featuredArtisans];
        while (combined.length < 4) {
            combined.push(placeholders[combined.length]);
        }
        
        return combined.slice(0, 4);
    };

    const displayArtisans = getDisplayArtisans();

    return (
        <div className="min-h-screen flex overflow-hidden">
            {/* Left Side - Artisan Images Showcase */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-amber-800">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }} />
                </div>
                
                {/* Content overlay */}
                <div className="relative z-10 flex flex-col justify-center items-center px-6 py-4 text-white w-full h-full">
                    <div className="max-w-lg text-center space-y-3 mx-auto">
                        <div className="space-y-1.5">
                            <h2 className="text-xl lg:text-2xl font-extrabold leading-tight drop-shadow-lg">
                                Discover Amazing Artisans
                            </h2>
                            <p className="text-amber-50 text-xs lg:text-sm leading-relaxed font-medium drop-shadow-md">
                                Connect with talented local artisans and discover unique handcrafted products.
                            </p>
                        </div>
                        
                        {/* Artisan profiles grid */}
                        <div className="grid grid-cols-2 gap-2.5 mt-3">
                            {displayArtisans.map((artisan, index) => (
                                <div key={`artisan-grid-${artisan.id}-${index}`} className="aspect-square rounded-lg bg-white/20 backdrop-blur-md border-2 border-white/40 overflow-hidden relative group cursor-pointer hover:bg-white/30 hover:border-white/60 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                    <img 
                                        src={artisan.avatar_url} 
                                        alt={artisan.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {
                                            // Fallback to generated avatar if image fails to load
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.name)}&color=D97706&background=FEF3C7`;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-amber-900/70 via-amber-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                                        <div className="p-1.5 text-white w-full">
                                            <span className="text-[10px] font-semibold drop-shadow-lg">{artisan.name}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex items-center justify-center space-x-2 text-amber-50 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/30">
                            <div className="flex -space-x-1.5">
                                {displayArtisans.slice(0, 3).map((artisan, index) => (
                                    <img
                                        key={`artisan-avatar-${artisan.id}-${index}`}
                                        src={artisan.avatar_url}
                                        alt={artisan.name}
                                        className="w-6 h-6 rounded-full border-2 border-white shadow-lg object-cover ring-1 ring-amber-400/50"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.name)}&color=D97706&background=FEF3C7&size=24`;
                                        }}
                                    />
                                ))}
                                {displayArtisans.length > 3 && (
                                    <div className="w-6 h-6 rounded-full bg-amber-600 border-2 border-white shadow-lg flex items-center justify-center ring-1 ring-amber-400/50">
                                        <span className="text-[10px] font-bold text-white">+{displayArtisans.length - 3}</span>
                                    </div>
                                )}
                            </div>
                            <span className="text-[10px] font-semibold">
                                {sellerCount > 0 ? `Join ${displayCount} artisans` : 'Be the first artisan'}
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-400/20 to-transparent rounded-full blur-3xl -translate-y-32 translate-x-32 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-400/15 to-transparent rounded-full blur-3xl translate-y-48 -translate-x-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-amber-300/10 to-orange-300/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-amber-50/50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto">
                <div className="w-full max-w-md my-auto py-2">
                    {/* Card container */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-amber-100 dark:border-gray-700 p-4 sm:p-5 hover:shadow-amber-200/50 dark:hover:shadow-gray-700/50 transition-shadow duration-300">
                        <div className="flex flex-col gap-3">
                            {/* Logo and Header */}
                            <div className="flex flex-col items-center gap-2">
                                <Link href="/" className="flex flex-col items-center gap-1.5 font-medium group">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l8 4" />
                                        </svg>
                                    </div>
                                    <span className="sr-only">{title}</span>
                                </Link>

                                <div className="space-y-0.5 text-center">
                                    <h1 className="text-lg font-extrabold bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 dark:from-amber-400 dark:via-amber-300 dark:to-orange-400 bg-clip-text text-transparent">
                                        {title}
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed font-medium">
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
