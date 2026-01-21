import { AlertTriangle, CheckCircle, TrendingUp, User } from 'lucide-react';

interface ProfileCompletenessWidgetProps {
    completeness: number;
    missingFields?: string[];
    hasAvatar: boolean;
    emailVerified: boolean;
    businessSetup: boolean;
    compact?: boolean;
}

export function ProfileCompletenessWidget({
    completeness,
    missingFields = [],
    hasAvatar,
    emailVerified,
    businessSetup,
    compact = false,
}: ProfileCompletenessWidgetProps) {
    const getCompletionColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (compact) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4" style={{ colorScheme: 'light' }}>
                <div className="mb-2 flex items-center justify-between sm:mb-3">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 sm:text-base">
                        <User className="h-4 w-4" style={{ color: '#6b7280' }} />
                        Profile
                    </h4>
                    <span className="text-base font-bold text-blue-600 sm:text-lg">{completeness}%</span>
                </div>

                <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ${getCompletionColor(completeness)}`}
                        style={{ width: `${completeness}%` }}
                    ></div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6" style={{ colorScheme: 'light' }}>
            <div className="mb-3 flex items-center justify-between sm:mb-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 sm:text-lg">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#6b7280' }} />
                    Profile Completeness
                </h3>
                <span className="text-xl font-bold text-blue-600 sm:text-2xl">{completeness}%</span>
            </div>

            <div className="mb-3 h-2 w-full rounded-full bg-gray-200 sm:mb-4 sm:h-3">
                <div
                    className={`h-2 rounded-full transition-all duration-500 sm:h-3 ${getCompletionColor(completeness)}`}
                    style={{ width: `${completeness}%` }}
                ></div>
            </div>

            <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    {hasAvatar ? (
                        <CheckCircle className="h-4 w-4" style={{ color: '#22c55e' }} />
                    ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className="text-gray-600">Profile Picture</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    {emailVerified ? (
                        <CheckCircle className="h-4 w-4" style={{ color: '#22c55e' }} />
                    ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className="text-gray-600">Email Verified</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    {businessSetup ? (
                        <CheckCircle className="h-4 w-4" style={{ color: '#22c55e' }} />
                    ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className="text-gray-600">Business Setup</span>
                </div>
            </div>

            {missingFields.length > 0 && (
                <div className="mt-3 rounded-lg bg-amber-50 p-2.5 sm:mt-4 sm:p-3">
                    <div className="mb-1 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" style={{ color: '#d97706' }} />
                        <p className="text-xs font-medium text-amber-700 sm:text-sm">Incomplete Fields</p>
                    </div>
                    <p className="text-xs text-amber-600">{missingFields.join(', ')}</p>
                </div>
            )}
        </div>
    );
}

interface AccountHealthWidgetProps {
    score: number;
    title?: string;
    compact?: boolean;
}

export function AccountHealthWidget({ score, title = 'Account Health', compact = false }: AccountHealthWidgetProps) {
    const getHealthColor = (healthScore: number) => {
        if (healthScore >= 80) return { text: 'text-green-600', bg: 'bg-green-500' };
        if (healthScore >= 60) return { text: 'text-yellow-600', bg: 'bg-yellow-500' };
        return { text: 'text-red-600', bg: 'bg-red-500' };
    };

    const colors = getHealthColor(score);

    if (compact) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4" style={{ colorScheme: 'light' }}>
                <div className="mb-2 flex items-center justify-between sm:mb-3">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 sm:text-base">
                        <TrendingUp className="h-4 w-4" style={{ color: '#6b7280' }} />
                        Health
                    </h4>
                    <span className={`text-base font-bold sm:text-lg ${colors.text}`}>{score}%</span>
                </div>

                <div className="h-2 w-full rounded-full bg-gray-200">
                    <div className={`h-2 rounded-full transition-all duration-500 ${colors.bg}`} style={{ width: `${score}%` }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6" style={{ colorScheme: 'light' }}>
            <div className="mb-3 flex items-center justify-between sm:mb-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 sm:text-lg">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#6b7280' }} />
                    {title}
                </h3>
                <div className="text-right">
                    <span className={`text-xl font-bold sm:text-2xl ${colors.text}`}>{score}%</span>
                    <p className="text-xs text-gray-500">Score</p>
                </div>
            </div>

            <div className="h-2 w-full rounded-full bg-gray-200 sm:h-3">
                <div className={`h-2 rounded-full transition-all duration-500 sm:h-3 ${colors.bg}`} style={{ width: `${score}%` }}></div>
            </div>

            <div className="mt-3 text-center sm:mt-4">
                <p className={`text-sm font-medium ${colors.text}`}>{score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}</p>
                <p className="text-xs text-gray-500">
                    {score >= 80
                        ? 'Your account is well-secured'
                        : score >= 60
                          ? 'Consider improving security'
                          : 'Please update your security settings'}
                </p>
            </div>
        </div>
    );
}
