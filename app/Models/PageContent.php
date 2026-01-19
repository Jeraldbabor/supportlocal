<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PageContent extends Model
{
    use HasFactory;

    /**
     * Page type constants
     */
    const PAGE_TYPE_ABOUT = 'about';

    const PAGE_TYPE_CONTACT = 'contact';

    /**
     * Section constants for About page
     */
    const SECTION_MISSION = 'mission';

    const SECTION_VALUES = 'values';

    const SECTION_STORY = 'story';

    const SECTION_JOIN_US = 'join_us';

    /**
     * Section constants for Contact page
     */
    const SECTION_CONTACT_INFO = 'contact_info';

    const SECTION_FAQ = 'faq';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'page_type',
        'section',
        'title',
        'content',
        'metadata',
        'sort_order',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get page content by type and section
     */
    public static function getContent(string $pageType, string $section): ?self
    {
        return self::where('page_type', $pageType)
            ->where('section', $section)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->first();
    }

    /**
     * Get all active content for a page type
     */
    public static function getPageContents(string $pageType): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('page_type', $pageType)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }
}
