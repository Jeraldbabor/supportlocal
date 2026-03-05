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
        User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('Rald@11'),
                'role' => User::ROLE_ADMINISTRATOR,
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'jeraldbabor60@gmail.com'],
            [
                'name' => 'Jerald Babor',
                'password' => Hash::make('password'),
                'role' => User::ROLE_SELLER,
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'decsang23@gmail.com'],
            [
                'name' => 'Decery Alihid',
                'password' => Hash::make('password'),
                'role' => User::ROLE_BUYER,
                'email_verified_at' => now(),
            ]
        );
    }
}
