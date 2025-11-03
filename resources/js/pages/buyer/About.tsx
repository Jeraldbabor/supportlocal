import { Award, Heart, MapPin, Users } from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import BuyerLayout from '../../layouts/BuyerLayout';

interface Artisan {
    id: number;
    name: string;
    specialty: string;
    image: string;
    description: string;
    location: string;
    experience: string;
}

interface AboutProps {
    artisans?: Artisan[];
}

export default function About({ artisans = [] }: AboutProps) {
    // Sample artisans if none provided
    const defaultArtisans: Artisan[] = [
        {
            id: 1,
            name: 'Sarah Chen',
            specialty: 'Ceramic Pottery',
            image: '/api/placeholder/200/200',
            description:
                'Sarah has been creating beautiful ceramic pieces for over 15 years, specializing in functional pottery with artistic flair.',
            location: 'Portland, OR',
            experience: '15+ years',
        },
        {
            id: 2,
            name: 'Mike Rodriguez',
            specialty: 'Woodworking',
            image: '/api/placeholder/200/200',
            description: 'Mike crafts sustainable wooden furniture and accessories using traditional techniques and locally sourced materials.',
            location: 'Austin, TX',
            experience: '12+ years',
        },
        {
            id: 3,
            name: 'Emma Thompson',
            specialty: 'Textile Arts',
            image: '/api/placeholder/200/200',
            description:
                'Emma creates cozy knitted items and woven textiles using natural fibers and traditional patterns passed down through generations.',
            location: 'Burlington, VT',
            experience: '10+ years',
        },
        {
            id: 4,
            name: 'David Kim',
            specialty: 'Leather Crafting',
            image: '/api/placeholder/200/200',
            description:
                'David specializes in premium leather goods, from journals to bags, using traditional techniques and high-quality materials.',
            location: 'Seattle, WA',
            experience: '8+ years',
        },
    ];

    const featuredArtisans = artisans.length > 0 ? artisans : defaultArtisans;

    return (
        <BuyerLayout title="About Us">
            <Head title="About Us" />
            
            {/* Mission Statement */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">Our Mission</h2>
                    <p className="mb-8 text-xl leading-relaxed text-gray-600">
                        At Support Local, we believe in the power of handmade craftsmanship and the importance of supporting local artisans. Our
                        platform connects skilled craftspeople with customers who appreciate the beauty, quality, and story behind each handmade
                        piece.
                    </p>
                    <p className="text-lg leading-relaxed text-gray-600">
                        Every purchase you make helps preserve traditional crafting techniques, supports local economies, and brings unique,
                        meaningful items into your life.
                    </p>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-gray-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Our Values</h2>
                        <p className="text-xl text-gray-600">What drives us every day</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Heart className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold">Craftsmanship</h3>
                            <p className="text-gray-600">We celebrate the skill, dedication, and artistry that goes into every handmade piece.</p>
                        </div>
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold">Community</h3>
                            <p className="text-gray-600">Building connections between artisans and customers to strengthen local communities.</p>
                        </div>
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Award className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold">Quality</h3>
                            <p className="text-gray-600">We curate only the finest handcrafted items that meet our high standards for excellence.</p>
                        </div>
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <MapPin className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold">Local</h3>
                            <p className="text-gray-600">
                                Supporting local artisans helps preserve traditional crafts and strengthens regional economies.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Artisans */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Meet Our Artisans</h2>
                        <p className="text-xl text-gray-600">The talented craftspeople who make our marketplace special</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {featuredArtisans.map((artisan) => (
                            <div key={artisan.id} className="text-center">
                                <img src={artisan.image} alt={artisan.name} className="mx-auto mb-4 h-48 w-48 rounded-full object-cover" />
                                <h3 className="mb-2 text-xl font-semibold text-gray-900">{artisan.name}</h3>
                                <p className="mb-2 font-medium text-primary">{artisan.specialty}</p>
                                <div className="mb-3 text-sm text-gray-600">
                                    <p className="flex items-center justify-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {artisan.location}
                                    </p>
                                    <p>{artisan.experience}</p>
                                </div>
                                <p className="text-sm text-gray-600">{artisan.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="bg-primary py-16">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-white">
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl">Our Story</h2>
                        <div className="space-y-4 text-lg leading-relaxed">
                            <p>
                                Support Local was born from a simple observation: in our increasingly digital world, there's something magical about
                                items created by human hands with care, skill, and passion.
                            </p>
                            <p>
                                Founded in 2023, we started as a small team passionate about supporting local artisans and preserving traditional
                                crafts. We noticed that many talented craftspeople struggled to reach customers beyond their immediate communities.
                            </p>
                            <p>
                                Today, we're proud to be a bridge between skilled artisans and customers who value authentic, handmade products. Every
                                item in our marketplace tells a story – of tradition, creativity, and the human touch that makes each piece unique.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Join Us Section */}
            <section className="bg-gray-50 py-16">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">Join Our Community</h2>
                    <p className="mb-8 text-xl text-gray-600">
                        Whether you're an artisan looking to share your craft or a customer seeking unique, handmade items, we'd love to have you as
                        part of our community.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link
                            href="/seller/apply"
                            className="rounded-lg bg-primary px-8 py-3 font-semibold text-white transition-colors duration-200 hover:bg-primary/90 text-center"
                        >
                            Become a Seller
                        </Link>
                        <Link
                            href="/buyer/products"
                            className="rounded-lg border-2 border-primary px-8 py-3 font-semibold text-primary transition-colors duration-200 hover:bg-primary hover:text-white text-center"
                        >
                            Shop with Us
                        </Link>
                    </div>
                </div>
            </section>
        </BuyerLayout>
    );
}
