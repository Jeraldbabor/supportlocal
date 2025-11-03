import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

interface ProfileCompletionStatus {
    is_complete: boolean;
    percentage: number;
    completed_fields: number;
    total_fields: number;
    missing_fields: Array<{
        field: string;
        label: string;
    }>;
    has_email_verified: boolean;
    has_profile_picture: boolean;
}

interface ProfileCompletionRecommendation {
    title: string;
    description: string;
    action: string;
    url: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    missing_fields?: Array<{
        field: string;
        label: string;
    }>;
}

interface ProfileCompletionBannerProps {
    status: ProfileCompletionStatus;
    recommendation: ProfileCompletionRecommendation | null;
    className?: string;
    dismissible?: boolean;
    compact?: boolean;
}

export default function ProfileCompletionBanner({
    status,
    recommendation: initialRecommendation,
    className,
    dismissible = true,
    compact = false,
}: ProfileCompletionBannerProps) {
    // Check localStorage for dismissal on mount
    const [isDismissed, setIsDismissed] = useState(() => {
        if (typeof window !== 'undefined') {
            const dismissed = localStorage.getItem('profile_completion_banner_dismissed');
            // Only consider dismissed if it was within the last 7 days
            if (dismissed) {
                const dismissedTime = new Date(dismissed).getTime();
                const now = new Date().getTime();
                const daysSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60 * 24);
                return daysSinceDismissed < 7;
            }
        }
        return false;
    });

    // Don't show if dismissed
    if (isDismissed) {
        return null;
    }

    // Don't show if complete and no recommendation
    if (status.is_complete && !initialRecommendation) {
        return null;
    }

    // If no recommendation but profile incomplete, create a default one
    const recommendation = initialRecommendation || {
        title: 'Complete Your Profile',
        description: 'Please complete your profile to use all features of the system.',
        action: 'Complete Profile',
        url: '/profile',
        priority: 'critical' as const,
        missing_fields: status.missing_fields,
    };

    // Determine icon and styling based on priority
    const priorityConfig = {
        critical: {
            icon: AlertCircle,
            variant: 'destructive' as const,
            bgColor: 'bg-red-50 dark:bg-red-950/20',
            borderColor: 'border-red-200 dark:border-red-800',
            iconColor: 'text-red-600 dark:text-red-400',
            buttonVariant: 'destructive' as const,
        },
        high: {
            icon: AlertTriangle,
            variant: 'default' as const,
            bgColor: 'bg-orange-50 dark:bg-orange-950/20',
            borderColor: 'border-orange-200 dark:border-orange-800',
            iconColor: 'text-orange-600 dark:text-orange-400',
            buttonVariant: 'default' as const,
        },
        medium: {
            icon: Info,
            variant: 'default' as const,
            bgColor: 'bg-blue-50 dark:bg-blue-950/20',
            borderColor: 'border-blue-200 dark:border-blue-800',
            iconColor: 'text-blue-600 dark:text-blue-400',
            buttonVariant: 'default' as const,
        },
        low: {
            icon: Info,
            variant: 'default' as const,
            bgColor: 'bg-gray-50 dark:bg-gray-950/20',
            borderColor: 'border-gray-200 dark:border-gray-800',
            iconColor: 'text-gray-600 dark:text-gray-400',
            buttonVariant: 'secondary' as const,
        },
    };

    const priority = recommendation?.priority || 'medium';
    const config = priorityConfig[priority];
    const Icon = config.icon;

    const handleDismiss = () => {
        setIsDismissed(true);

        // Store dismissal in localStorage with timestamp
        localStorage.setItem('profile_completion_banner_dismissed', new Date().toISOString());

        // Send to server
        router.post(
            '/profile/dismiss-completion-reminder',
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleAction = () => {
        if (recommendation?.url) {
            router.visit(recommendation.url);
        }
    };

    if (compact) {
        return (
            <Alert className={cn(config.bgColor, config.borderColor, 'mb-4', className)}>
                <Icon className={cn('size-4', config.iconColor)} />
                <AlertTitle className="flex items-center justify-between">
                    <span>{recommendation?.title || 'Complete Your Profile'}</span>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant={config.buttonVariant} onClick={handleAction} className="h-7">
                            {recommendation?.action || 'Complete Now'}
                        </Button>
                        {dismissible && (
                            <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-7 w-7 p-0">
                                <X className="size-4" />
                                <span className="sr-only">Dismiss</span>
                            </Button>
                        )}
                    </div>
                </AlertTitle>
            </Alert>
        );
    }

    return (
        <Card className={cn('mb-6 overflow-hidden', config.bgColor, config.borderColor, className)}>
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div
                        className={cn(
                            'rounded-full p-2',
                            priority === 'critical' && 'bg-red-100 dark:bg-red-900/30',
                            priority === 'high' && 'bg-orange-100 dark:bg-orange-900/30',
                            priority === 'medium' && 'bg-blue-100 dark:bg-blue-900/30',
                            priority === 'low' && 'bg-gray-100 dark:bg-gray-900/30',
                        )}
                    >
                        <Icon className={cn('size-6', config.iconColor)} />
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold">{recommendation?.title || 'Complete Your Profile'}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {recommendation?.description || 'Fill in your personal information to use all features of the system.'}
                                </p>
                            </div>
                            {dismissible && (
                                <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8 w-8 p-0">
                                    <X className="size-4" />
                                    <span className="sr-only">Dismiss</span>
                                </Button>
                            )}
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Profile Completion</span>
                                <span className="font-medium">{status.percentage}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                    className={cn(
                                        'h-full transition-all duration-500',
                                        priority === 'critical' && 'bg-red-500',
                                        priority === 'high' && 'bg-orange-500',
                                        priority === 'medium' && 'bg-blue-500',
                                        priority === 'low' && 'bg-gray-500',
                                    )}
                                    style={{ width: `${status.percentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Missing fields */}
                        {recommendation?.missing_fields && recommendation.missing_fields.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <p className="text-sm font-medium">Missing Information:</p>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {recommendation.missing_fields.map((field) => (
                                        <div key={field.field} className="flex items-center gap-2 rounded-md bg-background/50 px-3 py-2 text-sm">
                                            <AlertCircle className="size-4 text-muted-foreground" />
                                            <span>{field.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Optional enhancements */}
                        {status.is_complete && (
                            <div className="mt-3 space-y-2">
                                <p className="text-sm font-medium">Enhance Your Profile:</p>
                                <div className="flex flex-wrap gap-2">
                                    {!status.has_email_verified && (
                                        <div className="flex items-center gap-2 rounded-md bg-background/50 px-3 py-2 text-sm">
                                            <AlertTriangle className="size-4 text-orange-500" />
                                            <span>Email not verified</span>
                                        </div>
                                    )}
                                    {!status.has_profile_picture && (
                                        <div className="flex items-center gap-2 rounded-md bg-background/50 px-3 py-2 text-sm">
                                            <Info className="size-4 text-blue-500" />
                                            <span>No profile picture</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action button */}
                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleAction} variant={config.buttonVariant} className="gap-2">
                                {recommendation?.action || 'Complete Profile'}
                            </Button>
                            {status.is_complete && (
                                <Button onClick={handleDismiss} variant="outline">
                                    Maybe Later
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

// Compact inline version for use in specific contexts
export function ProfileCompletionInline({ status, recommendation: initialRecommendation, className }: ProfileCompletionBannerProps) {
    if (status.is_complete && !initialRecommendation) {
        return null;
    }

    const recommendation = initialRecommendation || {
        title: 'Complete Your Profile',
        description: 'Please complete your profile to use all features of the system.',
        action: 'Complete Profile',
        url: '/profile',
        priority: 'critical' as const,
        missing_fields: status.missing_fields,
    };

    return (
        <div
            className={cn(
                'flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm dark:border-orange-800 dark:bg-orange-950/20',
                className,
            )}
        >
            <AlertTriangle className="size-4 text-orange-600 dark:text-orange-400" />
            <span className="flex-1">Profile {status.percentage}% complete</span>
            <Button
                size="sm"
                variant="outline"
                onClick={() => {
                    if (recommendation?.url) {
                        router.visit(recommendation.url);
                    }
                }}
                className="h-7"
            >
                Complete
            </Button>
        </div>
    );
}
