import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import ProfileCompletionBanner from '@/components/ProfileCompletionBanner';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { props: pageProps } = usePage<{
        profileCompletion?: {
            status: any;
            recommendation: any;
        };
    }>();

    const profileCompletion = pageProps.profileCompletion;

    // Show banner if we have profile completion data and either:
    // 1. Profile is incomplete, OR
    // 2. There's a recommendation (even if profile is technically complete)
    const shouldShowBanner = profileCompletion && 
                            profileCompletion.status && 
                            (!profileCompletion.status.is_complete || profileCompletion.recommendation);

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {/* Profile Completion Banner */}
                {shouldShowBanner && (
                    <div className="px-4 pt-4">
                        <ProfileCompletionBanner
                            status={profileCompletion.status}
                            recommendation={profileCompletion.recommendation}
                            dismissible={true}
                        />
                    </div>
                )}
                {children}
            </AppContent>
        </AppShell>
    );
}
