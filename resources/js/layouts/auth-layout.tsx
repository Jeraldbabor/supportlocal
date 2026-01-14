import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
    children,
    title,
    description,
    sellerCount,
    featuredArtisans,
    disableLogoLink,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
    sellerCount?: number;
    featuredArtisans?: Array<{
        id: number;
        name: string;
        avatar_url: string;
    }>;
    disableLogoLink?: boolean;
}) {
    return (
        <AuthLayoutTemplate
            title={title}
            description={description}
            sellerCount={sellerCount}
            featuredArtisans={featuredArtisans}
            disableLogoLink={disableLogoLink}
            {...props}
        >
            {children}
        </AuthLayoutTemplate>
    );
}
