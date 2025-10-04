import { CheckCircle, AlertTriangle, User, TrendingUp } from 'lucide-react';

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
    compact = false 
}: ProfileCompletenessWidgetProps) {
    const getCompletionColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (compact) {
        return (
            <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                    </h4>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {completeness}%
                    </span>
                </div>
                
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getCompletionColor(completeness)}`}
                        style={{ width: `${completeness}%` }}
                    ></div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Completeness
                </h3>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {completeness}%
                </span>
            </div>
            
            <div className="mb-4 h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div 
                    className={`h-3 rounded-full transition-all duration-500 ${getCompletionColor(completeness)}`}
                    style={{ width: `${completeness}%` }}
                ></div>
            </div>
            
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    {hasAvatar ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className="text-gray-600 dark:text-gray-300">Profile Picture</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                    {emailVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className="text-gray-600 dark:text-gray-300">Email Verified</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                    {businessSetup ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className="text-gray-600 dark:text-gray-300">Business Setup</span>
                </div>
            </div>
            
            {missingFields.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                            Incomplete Fields
                        </p>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                        {missingFields.join(', ')}
                    </p>
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

export function AccountHealthWidget({ score, title = "Account Health", compact = false }: AccountHealthWidgetProps) {
    const getHealthColor = (healthScore: number) => {
        if (healthScore >= 80) return { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-500' };
        if (healthScore >= 60) return { text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500' };
        return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-500' };
    };

    const colors = getHealthColor(score);

    if (compact) {
        return (
            <div className="rounded-xl border bg-white p-4 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Health
                    </h4>
                    <span className={`text-lg font-bold ${colors.text}`}>
                        {score}%
                    </span>
                </div>
                
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div 
                        className={`h-2 rounded-full transition-all duration-500 ${colors.bg}`}
                        style={{ width: `${score}%` }}
                    ></div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {title}
                </h3>
                <div className="text-right">
                    <span className={`text-2xl font-bold ${colors.text}`}>
                        {score}%
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                </div>
            </div>
            
            <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div 
                    className={`h-3 rounded-full transition-all duration-500 ${colors.bg}`}
                    style={{ width: `${score}%` }}
                ></div>
            </div>
            
            <div className="mt-4 text-center">
                <p className={`text-sm font-medium ${colors.text}`}>
                    {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {score >= 80 ? 'Your account is well-secured' : 
                     score >= 60 ? 'Consider improving security' : 
                     'Please update your security settings'}
                </p>
            </div>
        </div>
    );
}