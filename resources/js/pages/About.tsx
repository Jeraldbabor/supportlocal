import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Users, Heart, Award, MapPin } from 'lucide-react';

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
            description: 'Sarah has been creating beautiful ceramic pieces for over 15 years, specializing in functional pottery with artistic flair.',
            location: 'Portland, OR',
            experience: '15+ years'
        },
        {
            id: 2,
            name: 'Mike Rodriguez',
            specialty: 'Woodworking',
            image: '/api/placeholder/200/200',
            description: 'Mike crafts sustainable wooden furniture and accessories using traditional techniques and locally sourced materials.',
            location: 'Austin, TX',
            experience: '12+ years'
        },
        {
            id: 3,
            name: 'Emma Thompson',
            specialty: 'Textile Arts',
            image: '/api/placeholder/200/200',
            description: 'Emma creates cozy knitted items and woven textiles using natural fibers and traditional patterns passed down through generations.',
            location: 'Burlington, VT',
            experience: '10+ years'
        },
        {
            id: 4,
            name: 'David Kim',
            specialty: 'Leather Crafting',
            image: '/api/placeholder/200/200',
            description: 'David specializes in premium leather goods, from journals to bags, using traditional techniques and high-quality materials.',
            location: 'Seattle, WA',
            experience: '8+ years'
        }
    ];

    const featuredArtisans = artisans.length > 0 ? artisans : defaultArtisans;

    return (
        <MainLayout title="About Us">
            {/* Mission Statement */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        Our Mission
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed mb-8">
                        At ArtisanLocal, we believe in the power of handmade craftsmanship and the importance of supporting local artisans. 
                        Our platform connects skilled craftspeople with customers who appreciate the beauty, quality, and story behind each handmade piece.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Every purchase you make helps preserve traditional crafting techniques, supports local economies, 
                        and brings unique, meaningful items into your life.
                    </p>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Our Values
                        </h2>
                        <p className="text-xl text-gray-600">
                            What drives us every day
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Craftsmanship</h3>
                            <p className="text-gray-600">
                                We celebrate the skill, dedication, and artistry that goes into every handmade piece.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Community</h3>
                            <p className="text-gray-600">
                                Building connections between artisans and customers to strengthen local communities.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Quality</h3>
                            <p className="text-gray-600">
                                We curate only the finest handcrafted items that meet our high standards for excellence.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Local</h3>
                            <p className="text-gray-600">
                                Supporting local artisans helps preserve traditional crafts and strengthens regional economies.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Artisans */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Meet Our Artisans
                        </h2>
                        <p className="text-xl text-gray-600">
                            The talented craftspeople who make our marketplace special
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredArtisans.map((artisan) => (
                            <div key={artisan.id} className="text-center">
                                <img
                                    src={artisan.image}
                                    alt={artisan.name}
                                    className="w-48 h-48 rounded-full mx-auto mb-4 object-cover"
                                />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {artisan.name}
                                </h3>
                                <p className="text-primary font-medium mb-2">
                                    {artisan.specialty}
                                </p>
                                <div className="text-sm text-gray-600 mb-3">
                                    <p className="flex items-center justify-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {artisan.location}
                                    </p>
                                    <p>{artisan.experience}</p>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    {artisan.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 bg-primary">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Our Story
                        </h2>
                        <div className="text-lg leading-relaxed space-y-4">
                            <p>
                                ArtisanLocal was born from a simple observation: in our increasingly digital world, 
                                there's something magical about items created by human hands with care, skill, and passion.
                            </p>
                            <p>
                                Founded in 2023, we started as a small team passionate about supporting local artisans 
                                and preserving traditional crafts. We noticed that many talented craftspeople struggled 
                                to reach customers beyond their immediate communities.
                            </p>
                            <p>
                                Today, we're proud to be a bridge between skilled artisans and customers who value 
                                authentic, handmade products. Every item in our marketplace tells a story – 
                                of tradition, creativity, and the human touch that makes each piece unique.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Join Us Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        Join Our Community
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Whether you're an artisan looking to share your craft or a customer seeking unique, 
                        handmade items, we'd love to have you as part of our community.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200">
                            Become an Artisan
                        </button>
                        <button className="border-2 border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors duration-200">
                            Shop with Us
                        </button>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}