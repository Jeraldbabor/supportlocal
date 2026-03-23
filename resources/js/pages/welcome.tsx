import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Gavel, HandHeart, MessageSquare, Package, Shield, ShoppingBag, Sparkles, Star, Users } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    const features = [
        {
            icon: Gavel,
            title: 'Custom Order Bidding',
            description:
                'Post what you need and let multiple artisans compete to craft it for you. Compare bids, reviews, and choose the best offer.',
            highlight: true,
        },
        {
            icon: HandHeart,
            title: 'Support Local Hinoba-an Artisans',
            description: 'Every purchase directly supports Filipino craftsmen and small businesses in your community.',
            highlight: false,
        },
        {
            icon: MessageSquare,
            title: 'Direct Communication',
            description: 'Chat directly with artisans to discuss your requirements, customizations, and track your order progress.',
            highlight: false,
        },
        {
            icon: Shield,
            title: 'Secure Transactions',
            description: 'Safe payment options with GCash and Cash on Delivery. Your transactions are protected.',
            highlight: false,
        },
    ];

    const howItWorks = [
        {
            step: 1,
            title: 'Post Your Request',
            description: 'Describe what you want, set your budget range, and upload reference images.',
            icon: Package,
        },
        {
            step: 2,
            title: 'Receive Bids',
            description: 'Local artisans will submit their proposals with pricing and timeline.',
            icon: Users,
        },
        {
            step: 3,
            title: 'Choose & Create',
            description: 'Select the best artisan and watch your custom creation come to life.',
            icon: Sparkles,
        },
    ];

    const testimonials = [
        {
            name: 'Maria Santos',
            role: 'Buyer',
            content: 'I got a beautiful custom bag made exactly how I wanted. The bidding system helped me find the perfect artisan!',
            rating: 5,
        },
        {
            name: 'Juan dela Cruz',
            role: 'Artisan',
            content: 'SupportLocal helped me reach more customers. The marketplace feature brings projects directly to me.',
            rating: 5,
        },
        {
            name: 'Ana Reyes',
            role: 'Buyer',
            content: 'Love how I can communicate directly with artisans. My custom jewelry turned out amazing!',
            rating: 5,
        },
    ];

    return (
        <>
            <Head title="Welcome to SupportLocal">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50">
                {/* Navigation */}
                <header className="sticky top-0 z-50 border-b border-amber-100 bg-white/80 backdrop-blur-md">
                    <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                                <ShoppingBag className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                Support<span className="text-amber-600">Local</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard.url()}
                                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-xl"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login.url()}
                                        replace
                                        className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register.url()}
                                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-xl"
                                    >
                                        Get Started
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden px-4 pt-16 pb-24 sm:px-6 lg:px-8 lg:pt-24 lg:pb-32">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2">
                        <div className="h-[500px] w-[800px] rounded-full bg-gradient-to-br from-amber-200/40 to-orange-200/40 blur-3xl" />
                    </div>

                    <div className="relative mx-auto max-w-7xl">
                        <div className="text-center">
                            {/* Badge */}
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
                                <Sparkles className="h-4 w-4" />
                                <span>The Future of Local E-Commerce</span>
                            </div>

                            {/* Main Heading */}
                            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                                Your Custom Creation,{' '}
                                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                    Crafted by Local Artisans
                                </span>
                            </h1>

                            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
                                Post what you want, receive bids from talented Filipino artisans, and get unique handcrafted products made just for
                                you. Support local Hinoba-an businesses while getting exactly what you need.
                            </p>

                            {/* CTA Buttons */}
                            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link
                                    href={register.url()}
                                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-2xl"
                                >
                                    Start Your Custom Order
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                                <Link
                                    href="/products"
                                    className="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:border-amber-300 hover:bg-amber-50"
                                >
                                    Browse Products
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-amber-600 sm:text-4xl">500+</div>
                                    <div className="mt-1 text-sm text-gray-500">Local Artisans</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-amber-600 sm:text-4xl">10K+</div>
                                    <div className="mt-1 text-sm text-gray-500">Custom Orders</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-amber-600 sm:text-4xl">4.9</div>
                                    <div className="mt-1 text-sm text-gray-500">Average Rating</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Unique Feature Highlight */}
                <section className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div className="text-white">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium">
                                    <Gavel className="h-4 w-4" />
                                    <span>Exclusive Feature</span>
                                </div>
                                <h2 className="text-3xl font-bold sm:text-4xl">Custom Order Bidding System</h2>
                                <p className="mt-4 text-lg text-amber-100">
                                    Unlike other platforms, SupportLocal lets you post your custom order requests and receive competitive bids from
                                    multiple artisans. You're in control!
                                </p>
                                <ul className="mt-8 space-y-4">
                                    {[
                                        'Post your custom request with budget & deadline',
                                        'Receive multiple bids from verified artisans',
                                        'Compare prices, reviews, and portfolios',
                                        'Choose the perfect artisan for your project',
                                        'Track progress with direct messaging',
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-200" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={register.url()}
                                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-amber-600 shadow-lg transition-all hover:bg-amber-50"
                                >
                                    Try It Now
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="rounded-2xl bg-white p-6 shadow-2xl">
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">Open for Bids</span>
                                        <span className="text-sm text-gray-500">3 bids received</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Custom Leather Bag</h3>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Looking for a handcrafted leather messenger bag with custom engraving...
                                    </p>
                                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                                        <span>Budget: ₱2,000 - ₱3,500</span>
                                        <span>•</span>
                                        <span>Deadline: 2 weeks</span>
                                    </div>
                                    <div className="mt-6 space-y-3">
                                        {[
                                            { name: 'Jerald B.', price: '₱2,800', rating: 4.9, days: 10 },
                                            { name: 'Decery B.', price: '₱2,500', rating: 4.7, days: 12 },
                                            { name: 'Ana R.', price: '₱3,200', rating: 5.0, days: 8 },
                                        ].map((bid, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-medium text-amber-700">
                                                        {bid.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{bid.name}</p>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                            {bid.rating}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-amber-600">{bid.price}</p>
                                                    <p className="text-xs text-gray-500">{bid.days} days</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Why Choose SupportLocal?</h2>
                            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                                We're not just another marketplace. We're building a community that connects you directly with talented local
                                artisans.
                            </p>
                        </div>

                        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`group relative rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl ${
                                        feature.highlight
                                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                                            : 'border border-gray-100 bg-white'
                                    }`}
                                >
                                    <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.highlight ? 'bg-white/20' : 'bg-amber-100'}`}>
                                        <feature.icon className={`h-6 w-6 ${feature.highlight ? 'text-white' : 'text-amber-600'}`} />
                                    </div>
                                    <h3 className={`text-lg font-semibold ${feature.highlight ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                                    <p className={`mt-2 text-sm ${feature.highlight ? 'text-amber-100' : 'text-gray-600'}`}>{feature.description}</p>
                                    {feature.highlight && (
                                        <div className="absolute -top-3 -right-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-600 shadow-lg">
                                            UNIQUE
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How It Works</h2>
                            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">Get your custom creation in just three simple steps</p>
                        </div>

                        <div className="mt-16 grid gap-8 md:grid-cols-3">
                            {howItWorks.map((item, index) => (
                                <div key={index} className="relative text-center">
                                    {index < howItWorks.length - 1 && (
                                        <div className="absolute top-12 left-1/2 hidden h-0.5 w-full bg-gradient-to-r from-amber-300 to-transparent md:block" />
                                    )}
                                    <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
                                        <item.icon className="h-10 w-10 text-white" />
                                        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-amber-600 shadow">
                                            {item.step}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                                    <p className="mt-2 text-gray-600">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">What Our Community Says</h2>
                            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">Join thousands of happy buyers and artisans</p>
                        </div>

                        <div className="mt-16 grid gap-8 md:grid-cols-3">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex gap-1">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-gray-600">"{testimonial.content}"</p>
                                    <div className="mt-6 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 font-medium text-amber-700">
                                            {testimonial.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{testimonial.name}</p>
                                            <p className="text-sm text-gray-500">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-16 text-center shadow-2xl shadow-amber-500/25 sm:px-16">
                            <div className="absolute top-0 left-0 h-full w-full opacity-10">
                                <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-white" />
                                <div className="absolute right-10 bottom-10 h-48 w-48 rounded-full bg-white" />
                            </div>
                            <div className="relative">
                                <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Support Local Hinoba-an Artisans?</h2>
                                <p className="mx-auto mt-4 max-w-xl text-lg text-amber-100">
                                    Join SupportLocal today and discover unique handcrafted products or start selling your creations to customers who
                                    appreciate local craftsmanship.
                                </p>
                                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Link
                                        href={register.url()}
                                        className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-amber-600 shadow-lg transition-all hover:bg-amber-50"
                                    >
                                        Create Account
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        href={login.url()}
                                        replace
                                        className="inline-flex items-center gap-2 rounded-full border-2 border-white/50 px-8 py-4 text-lg font-semibold text-white transition-all hover:border-white hover:bg-white/10"
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                                    <ShoppingBag className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-lg font-bold text-gray-900">
                                    Support<span className="text-amber-600">Local</span>
                                </span>
                            </div>
                            <div className="flex gap-8 text-sm text-gray-500">
                                <Link href="/about" className="hover:text-amber-600">
                                    About Us
                                </Link>
                                <Link href="/contact" className="hover:text-amber-600">
                                    Contact
                                </Link>
                                <Link href="/terms" className="hover:text-amber-600">
                                    Terms of Service
                                </Link>
                                <Link href="/privacy" className="hover:text-amber-600">
                                    Privacy Policy
                                </Link>
                            </div>
                            <p className="text-sm text-gray-500">© 2026 SupportLocal. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
