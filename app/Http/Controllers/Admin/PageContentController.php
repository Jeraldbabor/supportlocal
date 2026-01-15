<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageContent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageContentController extends Controller
{
    /**
     * Display the page content management page
     */
    public function index(Request $request): Response
    {
        $pageType = $request->get('page', 'about'); // Default to 'about'

        $contents = PageContent::where('page_type', $pageType)
            ->orderBy('sort_order')
            ->orderBy('section')
            ->get()
            ->map(function ($content) {
                return [
                    'id' => $content->id,
                    'page_type' => $content->page_type,
                    'section' => $content->section,
                    'title' => $content->title,
                    'content' => $content->content,
                    'metadata' => $content->metadata,
                    'sort_order' => $content->sort_order,
                    'is_active' => $content->is_active,
                    'created_at' => $content->created_at,
                    'updated_at' => $content->updated_at,
                ];
            });

        return Inertia::render('admin/page-content/index', [
            'contents' => $contents,
            'currentPage' => $pageType,
            'sections' => $this->getSectionsForPage($pageType),
        ]);
    }

    /**
     * Show the form for creating/editing page content
     */
    public function edit(Request $request, $id = null): Response
    {
        $content = null;
        if ($id) {
            $content = PageContent::findOrFail($id);
        }

        $pageType = $request->get('page', $content?->page_type ?? 'about');
        $section = $request->get('section', $content?->section ?? '');

        return Inertia::render('admin/page-content/edit', [
            'content' => $content ? [
                'id' => $content->id,
                'page_type' => $content->page_type,
                'section' => $content->section,
                'title' => $content->title,
                'content' => $content->content,
                'metadata' => $content->metadata,
                'sort_order' => $content->sort_order,
                'is_active' => $content->is_active,
            ] : null,
            'pageType' => $pageType,
            'section' => $section,
            'sections' => $this->getSectionsForPage($pageType),
        ]);
    }

    /**
     * Store or update page content
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'nullable|exists:page_contents,id',
            'page_type' => 'required|string|in:about,contact',
            'section' => 'required|string',
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'metadata' => 'nullable|array',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        if ($request->has('id') && $request->id) {
            $content = PageContent::findOrFail($request->id);
            $content->update($validated);
            $message = 'Page content updated successfully.';
        } else {
            $content = PageContent::create($validated);
            $message = 'Page content created successfully.';
        }

        return redirect()
            ->route('admin.page-content.index', ['page' => $validated['page_type']])
            ->with('message', $message);
    }

    /**
     * Delete page content
     */
    public function destroy(int $id)
    {
        $content = PageContent::findOrFail($id);
        $pageType = $content->page_type;
        $content->delete();

        return redirect()
            ->route('admin.page-content.index', ['page' => $pageType])
            ->with('message', 'Page content deleted successfully.');
    }

    /**
     * Get available sections for a page type
     */
    private function getSectionsForPage(string $pageType): array
    {
        if ($pageType === 'about') {
            return [
                PageContent::SECTION_MISSION => 'Mission Statement',
                PageContent::SECTION_VALUES => 'Values Section',
                PageContent::SECTION_STORY => 'Our Story',
                PageContent::SECTION_JOIN_US => 'Join Us Section',
            ];
        } elseif ($pageType === 'contact') {
            return [
                PageContent::SECTION_CONTACT_INFO => 'Contact Information',
                PageContent::SECTION_FAQ => 'FAQ Section',
            ];
        }

        return [];
    }
}
