<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule database backups daily at 2 AM
Schedule::command('db:backup --retention=7')
    ->dailyAt('02:00')
    ->timezone('Asia/Manila')
    ->onFailure(function () {
        \Log::error('Scheduled database backup failed');
    })
    ->onSuccess(function () {
        \Log::info('Scheduled database backup completed successfully');
    });
