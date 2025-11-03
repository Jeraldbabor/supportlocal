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

export default function AuthSimpleLayout({
    children,
    title,
    description,
    sellerCount = 0,
    featuredArtisans = [],
}: PropsWithChildren<AuthLayoutProps>) {
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
        <div className="flex min-h-screen overflow-hidden">
            {/* Left Side - Artisan Images Showcase */}
            <div className="relative hidden overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-amber-800 lg:flex lg:w-1/2 xl:w-3/5">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: '60px 60px',
                        }}
                    />
                </div>

                {/* Content overlay */}
                <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 py-4 text-white">
                    <div className="mx-auto max-w-lg space-y-3 text-center">
                        <div className="space-y-1.5">
                            <h2 className="text-xl leading-tight font-extrabold drop-shadow-lg lg:text-2xl">Discover Amazing Artisans</h2>
                            <p className="text-xs leading-relaxed font-medium text-amber-50 drop-shadow-md lg:text-sm">
                                Connect with talented local artisans and discover unique handcrafted products.
                            </p>
                        </div>

                        {/* Artisan profiles grid */}
                        <div className="mt-3 grid grid-cols-2 gap-2.5">
                            {displayArtisans.map((artisan, index) => (
                                <div
                                    key={`artisan-grid-${artisan.id}-${index}`}
                                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 border-white/40 bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/60 hover:bg-white/30 hover:shadow-2xl"
                                >
                                    <img
                                        src={artisan.avatar_url}
                                        alt={artisan.name}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        onError={(e) => {
                                            // Fallback to generated avatar if image fails to load
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.name)}&color=D97706&background=FEF3C7`;
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-amber-900/70 via-amber-900/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <div className="w-full p-1.5 text-white">
                                            <span className="text-[10px] font-semibold drop-shadow-lg">{artisan.name}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-center space-x-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-amber-50 backdrop-blur-sm">
                            <div className="flex -space-x-1.5">
                                {displayArtisans.slice(0, 3).map((artisan, index) => (
                                    <img
                                        key={`artisan-avatar-${artisan.id}-${index}`}
                                        src={artisan.avatar_url}
                                        alt={artisan.name}
                                        className="h-6 w-6 rounded-full border-2 border-white object-cover shadow-lg ring-1 ring-amber-400/50"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.name)}&color=D97706&background=FEF3C7&size=24`;
                                        }}
                                    />
                                ))}
                                {displayArtisans.length > 3 && (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-amber-600 shadow-lg ring-1 ring-amber-400/50">
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
                <div className="absolute top-0 right-0 h-80 w-80 translate-x-32 -translate-y-32 animate-pulse rounded-full bg-gradient-to-bl from-amber-400/20 to-transparent blur-3xl"></div>
                <div
                    className="absolute bottom-0 left-0 h-96 w-96 -translate-x-48 translate-y-48 animate-pulse rounded-full bg-gradient-to-tr from-orange-400/15 to-transparent blur-3xl"
                    style={{ animationDelay: '1s' }}
                ></div>
                <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-300/10 to-orange-300/10 blur-2xl"></div>
            </div>

            {/* Right Side - Form */}
            <div className="flex w-full items-center justify-center overflow-y-auto bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-amber-50/50 p-3 sm:p-4 lg:w-1/2 xl:w-2/5 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="my-auto w-full max-w-md py-2">
                    {/* Card container */}
                    <div className="rounded-xl border-2 border-amber-100 bg-white p-4 shadow-2xl transition-shadow duration-300 hover:shadow-amber-200/50 sm:p-5 dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-gray-700/50">
                        <div className="flex flex-col gap-3">
                            {/* Logo and Header */}
                            <div className="flex flex-col items-center gap-2">
                                <Link href="/" className="group flex flex-col items-center gap-1.5 font-medium">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l8 4"
                                            />
                                        </svg>
                                    </div>
                                    <span className="sr-only">{title}</span>
                                </Link>

                                <div className="space-y-0.5 text-center">
                                    <h1 className="bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 bg-clip-text text-lg font-extrabold text-transparent dark:from-amber-400 dark:via-amber-300 dark:to-orange-400">
                                        {title}
                                    </h1>
                                    <p className="text-[11px] leading-relaxed font-medium text-gray-600 dark:text-gray-400">{description}</p>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="space-y-1">{children}</div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400"></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
