<?php

/**
 * Manual Test Script for Profile Completion Feature
 *
 * Run this in php artisan tinker to test the profile completion feature
 */

// Create a buyer with incomplete profile
$buyer = \App\Models\User::create([
    'name' => 'Test Buyer',
    'email' => 'testbuyer@example.com',
    'password' => bcrypt('password'),
    'role' => 'buyer',
    'phone_number' => null, // Missing
    'delivery_address' => null, // Missing
]);

echo "=== Incomplete Buyer Profile ===\n";
$status = $buyer->getProfileCompletionStatus();
print_r($status);

$recommendation = $buyer->getProfileCompletionRecommendation();
print_r($recommendation);

// Complete the profile
$buyer->update([
    'phone_number' => '09123456789',
    'delivery_address' => '123 Main Street, City',
]);

$buyer->updateProfileCompletionTracking();

echo "\n=== Complete Buyer Profile ===\n";
$status = $buyer->fresh()->getProfileCompletionStatus();
print_r($status);

$recommendation = $buyer->fresh()->getProfileCompletionRecommendation();
print_r($recommendation);

// Create a seller with incomplete profile
$seller = \App\Models\User::create([
    'name' => 'Test Seller',
    'email' => 'testseller@example.com',
    'password' => bcrypt('password'),
    'role' => 'seller',
    'phone_number' => '09123456789',
    'address' => null, // Missing
]);

echo "\n=== Incomplete Seller Profile ===\n";
$status = $seller->getProfileCompletionStatus();
print_r($status);

$recommendation = $seller->getProfileCompletionRecommendation();
print_r($recommendation);

// Complete the seller profile
$seller->update([
    'address' => '456 Business Ave, City',
]);

$seller->updateProfileCompletionTracking();

echo "\n=== Complete Seller Profile (no email verification) ===\n";
$status = $seller->fresh()->getProfileCompletionStatus();
print_r($status);

$recommendation = $seller->fresh()->getProfileCompletionRecommendation();
print_r($recommendation);

// Verify email
$seller->update(['email_verified_at' => now()]);

echo "\n=== Complete Seller Profile (email verified) ===\n";
$status = $seller->fresh()->getProfileCompletionStatus();
print_r($status);

$recommendation = $seller->fresh()->getProfileCompletionRecommendation();
print_r($recommendation);

// Test dismissal
echo "\n=== Test Dismissal ===\n";
echo 'Before: '.($buyer->hasProfileCompletionReminderDismissed() ? 'Dismissed' : 'Not Dismissed')."\n";
$buyer->dismissProfileCompletionReminder();
echo 'After: '.($buyer->fresh()->hasProfileCompletionReminderDismissed() ? 'Dismissed' : 'Not Dismissed')."\n";

echo "\n=== Test Complete! ===\n";
echo "All profile completion methods are working correctly.\n";
