<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    // Create a buyer user to ensure predictable behavior
    $user = User::factory()->buyer()->create();
    $this->actingAs($user);

    // The dashboard route now redirects to role-specific dashboards
    $this->get(route('dashboard'))->assertRedirect(route('buyer.dashboard'));

    // Test that the user can actually access their role-specific dashboard
    $this->get(route('buyer.dashboard'))->assertOk();
});
