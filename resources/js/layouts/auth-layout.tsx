import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({ children, title, description, sellerCount, featuredArtisans, ...props }: { 
    children: React.ReactNode; 
    title: string; 
    description: string; 
    sellerCount?: number;
    featuredArtisans?: Array<{
        id: number;
        name: string;
        avatar_url: string;
    }>;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description} sellerCount={sellerCount} featuredArtisans={featuredArtisans} {...props}>
            {children}
        </AuthLayoutTemplate>
    );
}
