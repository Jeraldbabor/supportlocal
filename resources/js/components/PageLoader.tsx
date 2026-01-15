import { usePageLoading } from '@/hooks/usePageLoading';
import { PageSkeleton } from './ui/skeleton';

export default function PageLoader({ children }: { children: React.ReactNode }) {
    const isLoading = usePageLoading();

    if (isLoading) {
        return <PageSkeleton />;
    }

    return <>{children}</>;
}
