<?php

namespace Database\Seeders;

use App\Models\PageContent;
use Illuminate\Database\Seeder;

class PageContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // About Page Content
        PageContent::updateOrCreate(
            [
                'page_type' => PageContent::PAGE_TYPE_ABOUT,
                'section' => PageContent::SECTION_MISSION,
            ],
            [
                'title' => 'Our Mission',
                'content' => '<p class="mb-8 text-xl leading-relaxed text-gray-600">
                    At Support Local, we believe in the power of handmade craftsmanship and the importance of supporting local artisans. Our
                    platform connects skilled craftspeople with customers who appreciate the beauty, quality, and story behind each handmade
                    piece.
                </p>
                <p class="text-lg leading-relaxed text-gray-600">
                    Every purchase you make helps preserve traditional crafting techniques, supports local economies, and brings unique,
                    meaningful items into your life.
                </p>',
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        PageContent::updateOrCreate(
            [
                'page_type' => PageContent::PAGE_TYPE_ABOUT,
                'section' => PageContent::SECTION_VALUES,
            ],
            [
                'title' => 'Our Values',
                'content' => '<div class="mb-12 text-center">
                    <p class="text-xl text-gray-600">What drives us every day</p>
                </div>

                <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div class="text-center">
                        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h3 class="mb-3 text-xl font-semibold">Craftsmanship</h3>
                        <p class="text-gray-600">We celebrate the skill, dedication, and artistry that goes into every handmade piece.</p>
                    </div>
                    <div class="text-center">
                        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 class="mb-3 text-xl font-semibold">Community</h3>
                        <p class="text-gray-600">Building connections between artisans and customers to strengthen local communities.</p>
                    </div>
                    <div class="text-center">
                        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                        <h3 class="mb-3 text-xl font-semibold">Quality</h3>
                        <p class="text-gray-600">We curate only the finest handcrafted items that meet our high standards for excellence.</p>
                    </div>
                    <div class="text-center">
                        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 class="mb-3 text-xl font-semibold">Local</h3>
                        <p class="text-gray-600">
                            Supporting local artisans helps preserve traditional crafts and strengthens regional economies.
                        </p>
                    </div>
                </div>',
                'sort_order' => 2,
                'is_active' => true,
            ]
        );

        PageContent::updateOrCreate(
            [
                'page_type' => PageContent::PAGE_TYPE_ABOUT,
                'section' => PageContent::SECTION_STORY,
            ],
            [
                'title' => 'Our Story',
                'content' => '<div class="space-y-4 text-lg leading-relaxed">
                    <p>
                        Support Local was born from a simple observation: in our increasingly digital world, there\'s something magical about
                        items created by human hands with care, skill, and passion.
                    </p>
                    <p>
                        Founded in 2023, we started as a small team passionate about supporting local artisans and preserving traditional
                        crafts. We noticed that many talented craftspeople struggled to reach customers beyond their immediate communities.
                    </p>
                    <p>
                        Today, we\'re proud to be a bridge between skilled artisans and customers who value authentic, handmade products. Every
                        item in our marketplace tells a story – of tradition, creativity, and the human touch that makes each piece unique.
                    </p>
                </div>',
                'sort_order' => 3,
                'is_active' => true,
            ]
        );

        PageContent::updateOrCreate(
            [
                'page_type' => PageContent::PAGE_TYPE_ABOUT,
                'section' => PageContent::SECTION_JOIN_US,
            ],
            [
                'title' => 'Join Our Community',
                'content' => '<p class="mb-8 text-xl text-gray-600">
                    Whether you\'re an artisan looking to share your craft or a customer seeking unique, handmade items, we\'d love to have you as
                    part of our community.
                </p>',
                'sort_order' => 4,
                'is_active' => true,
            ]
        );

        // Contact Page Content
        PageContent::updateOrCreate(
            [
                'page_type' => PageContent::PAGE_TYPE_CONTACT,
                'section' => PageContent::SECTION_CONTACT_INFO,
            ],
            [
                'title' => 'Get in Touch',
                'content' => '<p class="mb-8 text-lg text-gray-600">
                    We\'d love to hear from you! Whether you have questions about our artisans, need help with an order, or want to join our
                    marketplace, we\'re here to help.
                </p>',
                'metadata' => [
                    'email' => [
                        'primary' => 'artisanhub15@gmail.com',
                        'secondary' => 'support@supportlocal.com',
                    ],
                    'phone' => [
                        'primary' => '(+63 ) 9218511649',
                        'secondary' => 'Toll-free: (800) 123-4567',
                    ],
                    'address' => [
                        'line1' => 'Municipality of Hinoba-an',
                        'line2' => 'Province of Negros Occidental',
                        'line3' => '6125 Philippines',
                    ],
                    'business_hours' => [
                        'monday_friday' => 'Monday - Friday: 9:00 AM - 6:00 PM',
                        'saturday' => 'Saturday: 10:00 AM - 4:00 PM',
                        'sunday' => 'Sunday: Closed',
                    ],
                ],
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        PageContent::updateOrCreate(
            [
                'page_type' => PageContent::PAGE_TYPE_CONTACT,
                'section' => PageContent::SECTION_FAQ,
            ],
            [
                'title' => 'Frequently Asked Questions',
                'content' => '<div class="space-y-4">
                    <div>
                        <h4 class="mb-2 font-semibold text-gray-900">How can I become an artisan on your platform?</h4>
                        <p class="text-gray-600">
                            We welcome applications from skilled artisans. Please use the contact form to express your interest, and we\'ll
                            send you our artisan application process.
                        </p>
                    </div>
                    <div>
                        <h4 class="mb-2 font-semibold text-gray-900">What is your return policy?</h4>
                        <p class="text-gray-600">
                            We offer a 30-day return policy for most items. Since our products are handmade, please contact us if you have
                            any concerns about your purchase.
                        </p>
                    </div>
                    <div>
                        <h4 class="mb-2 font-semibold text-gray-900">Do you ship internationally?</h4>
                        <p class="text-gray-600">
                            Currently, we ship within the Philippines. We\'re working on expanding our shipping options to
                            serve more customers worldwide.
                        </p>
                    </div>
                    <div>
                        <h4 class="mb-2 font-semibold text-gray-900">How do I track my order?</h4>
                        <p class="text-gray-600">
                            Once your order is shipped, you\'ll receive a tracking number via email. You can also check your order status in your account dashboard.
                        </p>
                    </div>
                    <div>
                        <h4 class="mb-2 font-semibold text-gray-900">What payment methods do you accept?</h4>
                        <p class="text-gray-600">
                            We accept various payment methods including credit cards, debit cards, GCash, and other local payment options.
                        </p>
                    </div>
                </div>',
                'sort_order' => 2,
                'is_active' => true,
            ]
        );
    }
}
