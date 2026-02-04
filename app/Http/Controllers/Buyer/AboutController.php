<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\PageContent;
use Inertia\Inertia;

class AboutController extends Controller
{
    public function index()
    {
        // Team members data
        $artisans = [
            [
                'id' => 1,
                'name' => 'JERALD B. BABOR',
                'specialty' => 'Full-Stack Web Developer',
                'image' => '/jerald.jfif',
                'description' => 'A skilled full-stack web developer creating innovative digital solutions and web applications, and the only one who developed this website and maintained it.',
                'location' => 'Philippines',
                'experience' => '',
            ],
            [
                'id' => 2,
                'name' => 'JONAS D. PARREÑO, MIT',
                'specialty' => 'Analysis/Capstone Adviser',
                'image' => '/sirjd.jpg',
                'description' => 'An experienced adviser specializing in analysis and capstone project guidance, helping students excel in their academic journey.',
                'location' => 'Philippines',
                'experience' => '',
            ],
            [
                'id' => 3,
                'name' => 'DECERY B. ALIHID',
                'specialty' => 'Documentator',
                'image' => '/decery.jfif',
                'description' => 'A dedicated documentator ensuring clear, comprehensive documentation for projects and processes.',
                'location' => 'Philippines',
                'experience' => '',
            ],
            [
                'id' => 4,
                'name' => 'MICAELA OLIAMINA',
                'specialty' => 'Documentator',
                'image' => '/mekay.jfif',
                'description' => 'A meticulous documentator creating detailed documentation to support project success and knowledge sharing.',
                'location' => 'Philippines',
                'experience' => '',
            ],
        ];

        // Get dynamic page content
        $pageContents = PageContent::getPageContents(PageContent::PAGE_TYPE_ABOUT)
            ->map(function ($content) {
                return [
                    'section' => $content->section,
                    'title' => $content->title,
                    'content' => $content->content,
                    'metadata' => $content->metadata,
                ];
            })
            ->keyBy('section');

        return Inertia::render('buyer/About', [
            'artisans' => $artisans,
            'pageContents' => $pageContents,
        ]);
    }
}
