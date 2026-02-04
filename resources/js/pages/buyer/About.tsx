import { Head, Link } from '@inertiajs/react';
import { Award, Heart, MapPin, Users } from 'lucide-react';
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

interface PageContent {
    section: string;
    title: string | null;
    content: string | null;
    metadata: Record<string, unknown> | null;
}

interface AboutProps {
    artisans?: Artisan[];
    pageContents?: Record<string, PageContent>;
}

export default function About({ artisans = [], pageContents = {} }: AboutProps) {
    // Sample artisans if none provided
    const defaultArtisans: Artisan[] = [
        {
            id: 1,
            name: 'JERALD B. BABOR',
            specialty: 'Full-Stack Web Developer',
            image: '/jerald.jfif',
            description:
                'A skilled full-stack web developer creating innovative digital solutions and web applications, and the only one who developed this website and maintained it.',
            location: 'Philippines',
            experience: '',
        },
        {
            id: 2,
            name: 'JONAS D. PARREÑO, MIT',
            specialty: 'Analysis/Capstone Adviser',
            image: '/sirjd.jpg',
            description:
                'An experienced adviser specializing in analysis and capstone project guidance, helping students excel in their academic journey.',
            location: 'Philippines',
            experience: '',
        },
        {
            id: 3,
            name: 'DECERY B. ALIHID',
            specialty: 'Documentator',
            image: '/decery.jfif',
            description: 'A dedicated documentator ensuring clear, comprehensive documentation for projects and processes.',
            location: 'Philippines',
            experience: '',
        },
        {
            id: 4,
            name: 'MICAELA OLIAMINA',
            specialty: 'Documentator',
            image: '/mekay.jfif',
            description: 'A meticulous documentator creating detailed documentation to support project success and knowledge sharing.',
            location: 'Philippines',
            experience: '',
        },
    ];

    const featuredArtisans = artisans.length > 0 ? artisans : defaultArtisans;

    // Get dynamic content or use defaults
    const missionContent = pageContents.mission;
    const valuesContent = pageContents.values;
    const storyContent = pageContents.story;
    const joinUsContent = pageContents.join_us;

    return (
        <BuyerLayout>
            <Head title="About Us" />

            {/* Mission Statement */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    {missionContent ? (
                        <>
                            {missionContent.title && <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">{missionContent.title}</h2>}
                            {missionContent.content && (
                                <div className="text-lg leading-relaxed text-gray-600" dangerouslySetInnerHTML={{ __html: missionContent.content }} />
                            )}
                        </>
                    ) : (
                        <>
                            <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">Our Mission</h2>
                            <p className="mb-8 text-xl leading-relaxed text-gray-600">
                                At Support Local, we believe in the power of handmade craftsmanship and the importance of supporting local artisans.
                                Our platform connects skilled craftspeople with customers who appreciate the beauty, quality, and story behind each
                                handmade piece.
                            </p>
                            <p className="text-lg leading-relaxed text-gray-600">
                                Every purchase you make helps preserve traditional crafting techniques, supports local economies, and brings unique,
                                meaningful items into your life.
                            </p>
                        </>
                    )}
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-gray-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {valuesContent ? (
                        <>
                            {valuesContent.title && (
                                <div className="mb-12 text-center">
                                    <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">{valuesContent.title}</h2>
                                </div>
                            )}
                            {valuesContent.content && <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: valuesContent.content }} />}
                        </>
                    ) : (
                        <>
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
                                    <p className="text-gray-600">
                                        We celebrate the skill, dedication, and artistry that goes into every handmade piece.
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                        <Users className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold">Community</h3>
                                    <p className="text-gray-600">
                                        Building connections between artisans and customers to strengthen local communities.
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                        <Award className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold">Quality</h3>
                                    <p className="text-gray-600">
                                        We curate only the finest handcrafted items that meet our high standards for excellence.
                                    </p>
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
                        </>
                    )}
                </div>
            </section>

            {/* Meet Our Team */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Meet Our Team</h2>
                        <p className="text-xl text-gray-600">The talented team members who make our marketplace special</p>
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
                                    {artisan.experience && <p>{artisan.experience}</p>}
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
                        {storyContent ? (
                            <>
                                {storyContent.title && <h2 className="mb-6 text-3xl font-bold md:text-4xl">{storyContent.title}</h2>}
                                {storyContent.content && (
                                    <div className="space-y-4 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: storyContent.content }} />
                                )}
                            </>
                        ) : (
                            <>
                                <h2 className="mb-6 text-3xl font-bold md:text-4xl">Our Story</h2>
                                <div className="space-y-4 text-lg leading-relaxed">
                                    <p>
                                        Support Local was born from a simple observation: in our increasingly digital world, there's something magical
                                        about items created by human hands with care, skill, and passion.
                                    </p>
                                    <p>
                                        Founded in 2026, we started as a small team passionate about supporting local artisans and preserving
                                        traditional crafts. We noticed that many talented craftspeople struggled to reach customers beyond their
                                        immediate communities.
                                    </p>
                                    <p>
                                        Today, we're proud to be a bridge between skilled artisans and customers who value authentic, handmade
                                        products. Every item in our marketplace tells a story – of tradition, creativity, and the human touch that
                                        makes each piece unique.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Join Us Section */}
            <section className="bg-gray-50 py-16">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    {joinUsContent ? (
                        <>
                            {joinUsContent.title && <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">{joinUsContent.title}</h2>}
                            {joinUsContent.content && (
                                <div className="mb-8 text-xl text-gray-600" dangerouslySetInnerHTML={{ __html: joinUsContent.content }} />
                            )}
                        </>
                    ) : (
                        <>
                            <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">Join Our Community</h2>
                            <p className="mb-8 text-xl text-gray-600">
                                Whether you're an artisan looking to share your craft or a customer seeking unique, handmade items, we'd love to have
                                you as part of our community.
                            </p>
                        </>
                    )}
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link
                            href="/seller/apply"
                            className="rounded-lg bg-primary px-8 py-3 text-center font-semibold text-white transition-colors duration-200 hover:bg-primary/90"
                        >
                            Become a Seller
                        </Link>
                        <Link
                            href="/buyer/products"
                            className="rounded-lg border-2 border-primary px-8 py-3 text-center font-semibold text-primary transition-colors duration-200 hover:bg-primary hover:text-white"
                        >
                            Shop with Us
                        </Link>
                    </div>
                </div>
            </section>
        </BuyerLayout>
    );
}
