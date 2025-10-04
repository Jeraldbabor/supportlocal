<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserRolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Administrator user
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('admin123'),
            'role' => User::ROLE_ADMINISTRATOR,
            'email_verified_at' => now(),
        ]);

        // Create Seller/Artisan user
        User::create([
            'name' => 'Jerald Babor',
            'email' => 'jerald@gmail.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_SELLER,
            'email_verified_at' => now(),
        ]);

        // Create Buyer user
        User::create([
            'name' => 'Decery Alihid',
            'email' => 'decery@gmail.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_BUYER,
            'email_verified_at' => now(),
        ]);
    }
}
