<?php

namespace Database\Seeders;

use App\Models\ProductCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Pottery & Ceramics',
                'description' => 'Handcrafted pottery, ceramic bowls, vases, and decorative pieces made by local artisans',
                'icon' => 'craft',
                'color' => '#8B5CF6',
                'children' => [
                    'Clay Pots & Planters',
                    'Ceramic Bowls & Plates',
                    'Decorative Vases',
                    'Handmade Tiles',
                    'Ceramic Figurines',
                ]
            ],
            [
                'name' => 'Woodworking & Carpentry',
                'description' => 'Beautiful wooden furniture, carvings, and functional items crafted by local woodworkers',
                'icon' => 'hammer',
                'color' => '#92400E',
                'children' => [
                    'Wood Furniture',
                    'Wood Carvings',
                    'Kitchen Utensils',
                    'Decorative Boxes',
                    'Walking Sticks & Canes',
                ]
            ],
            [
                'name' => 'Textiles & Weaving',
                'description' => 'Traditional textiles, woven fabrics, and handmade clothing by local weavers',
                'icon' => 'fabric',
                'color' => '#DC2626',
                'children' => [
                    'Handwoven Fabrics',
                    'Traditional Clothing',
                    'Bags & Purses',
                    'Table Runners',
                    'Wall Hangings',
                ]
            ],
            [
                'name' => 'Metalwork & Jewelry',
                'description' => 'Handcrafted metal items, jewelry, and decorative pieces by local metalworkers',
                'icon' => 'gem',
                'color' => '#F59E0B',
                'children' => [
                    'Handmade Jewelry',
                    'Metal Sculptures',
                    'Kitchen Tools',
                    'Decorative Hardware',
                    'Traditional Weapons',
                ]
            ],
            [
                'name' => 'Basketry & Bamboo Crafts',
                'description' => 'Traditional baskets, bamboo furniture, and woven items by local craftsmen',
                'icon' => 'basket',
                'color' => '#059669',
                'children' => [
                    'Wicker Baskets',
                    'Bamboo Furniture',
                    'Storage Containers',
                    'Decorative Weaving',
                    'Fishing Traps',
                ]
            ],
            [
                'name' => 'Leather & Hide Work',
                'description' => 'Handcrafted leather goods, bags, and accessories by local leather artisans',
                'icon' => 'bag',
                'color' => '#7C2D12',
                'children' => [
                    'Leather Bags',
                    'Belts & Accessories',
                    'Shoes & Sandals',
                    'Wallets & Pouches',
                    'Traditional Crafts',
                ]
            ],
            [
                'name' => 'Stone & Marble Crafts',
                'description' => 'Hand-carved stone sculptures, marble items, and decorative pieces',
                'icon' => 'mountain',
                'color' => '#6B7280',
                'children' => [
                    'Stone Sculptures',
                    'Marble Decor',
                    'Garden Ornaments',
                    'Religious Carvings',
                    'Architectural Elements',
                ]
            ],
            [
                'name' => 'Glass & Crystal Work',
                'description' => 'Handblown glass, crystal crafts, and decorative glass items by local glassworkers',
                'icon' => 'crystal',
                'color' => '#0EA5E9',
                'children' => [
                    'Blown Glass Art',
                    'Glass Ornaments',
                    'Window Panels',
                    'Drinking Glasses',
                    'Decorative Bottles',
                ]
            ],
            [
                'name' => 'Paper & Book Arts',
                'description' => 'Handmade paper, bookbinding, and paper crafts by local artisans',
                'icon' => 'book',
                'color' => '#7C3AED',
                'children' => [
                    'Handmade Paper',
                    'Bound Journals',
                    'Paper Art',
                    'Greeting Cards',
                    'Origami Crafts',
                ]
            ],
            [
                'name' => 'Traditional Instruments',
                'description' => 'Handcrafted musical instruments made by local instrument makers',
                'icon' => 'music',
                'color' => '#EC4899',
                'children' => [
                    'String Instruments',
                    'Wind Instruments',
                    'Percussion Instruments',
                    'Traditional Drums',
                    'Folk Instruments',
                ]
            ],
        ];

        foreach ($categories as $categoryData) {
            $children = $categoryData['children'];
            unset($categoryData['children']);

            $parent = ProductCategory::create($categoryData);

            foreach ($children as $index => $childName) {
                ProductCategory::create([
                    'name' => $childName,
                    'description' => "Subcategory of {$parent->name}",
                    'parent_id' => $parent->id,
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ]);
            }
        }
    }
}
