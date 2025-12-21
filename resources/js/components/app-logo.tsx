export default function AppLogo() {
    return (
        <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg transition-all duration-300 group-hover:shadow-xl">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l8 4"
                    />
                </svg>
            </div>
            <div className="ml-3 grid flex-1 text-left">
                <span className="truncate text-base leading-tight font-bold tracking-tight">Artisan Hub</span>
                <span className="truncate text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Marketplace</span>
            </div>
        </>
    );
}
