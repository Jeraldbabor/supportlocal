<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SecurityController extends Controller
{
    /**
     * Show the admin security settings page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Get active sessions
        $activeSessions = $user->getActiveSessions()->map(function ($session) {
            return [
                'id' => $session->id,
                'ip_address' => $session->ip_address,
                'device_type' => $session->device_type,
                'browser' => $session->browser,
                'platform' => $session->platform,
                'last_activity' => $session->last_activity->diffForHumans(),
                'last_activity_full' => $session->last_activity->format('M j, Y g:i A'),
                'is_current' => $session->is_current,
            ];
        });

        // Get recent admin audit logs
        $auditLogs = AdminAuditLog::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user ? [
                        'name' => $log->user->name,
                        'email' => $log->user->email,
                    ] : null,
                    'action' => $log->action,
                    'action_label' => $log->action_label,
                    'description' => $log->description,
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at->diffForHumans(),
                    'created_at_full' => $log->created_at->format('M j, Y g:i A'),
                ];
            });

        return Inertia::render('admin/Security', [
            'activeSessions' => $activeSessions,
            'auditLogs' => $auditLogs,
        ]);
    }

    /**
     * Change password with strong policy.
     */
    public function changePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => ['required', 'string', 'current_password'],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(12)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
            ],
        ], [
            'password.min' => 'Password must be at least 12 characters.',
            'password.letters' => 'Password must contain at least one letter.',
            'password.mixed' => 'Password must contain both uppercase and lowercase letters.',
            'password.numbers' => 'Password must contain at least one number.',
            'password.symbols' => 'Password must contain at least one special character.',
            'password.uncompromised' => 'This password has appeared in a data breach. Please choose a different password.',
        ]);

        $user = $request->user();

        $user->update([
            'password' => Hash::make($request->input('password')),
        ]);

        AdminAuditLog::log('password_change', 'Changed account password');

        // Optionally revoke other sessions after password change
        if ($request->boolean('revoke_sessions')) {
            $user->revokeOtherSessions();
        }

        return back()->with('status', 'Your password has been changed successfully.');
    }

    /**
     * Revoke a specific session.
     */
    public function revokeSession(Request $request, string $sessionId): RedirectResponse
    {
        $user = $request->user();

        if ($user->revokeSession($sessionId)) {
            AdminAuditLog::log('revoke_session', 'Revoked an active session');
            return back()->with('status', 'Session has been revoked.');
        }

        return back()->with('error', 'Unable to revoke session.');
    }

    /**
     * Revoke all other sessions.
     */
    public function revokeOtherSessions(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'current_password'],
        ]);

        $user = $request->user();
        $count = $user->revokeOtherSessions();

        AdminAuditLog::log('revoke_all_sessions', "Revoked {$count} active sessions");

        return back()->with('status', "Successfully logged out of {$count} other session(s).");
    }

    /**
     * View all admin audit logs with pagination.
     */
    public function auditLogs(Request $request): Response
    {
        $query = AdminAuditLog::query()
            ->with('user:id,name,email')
            ->orderBy('created_at', 'desc');

        // Filter by action
        if ($request->filled('action') && $request->input('action') !== 'all') {
            $query->where('action', $request->input('action'));
        }

        // Filter by date range
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->input('from_date'));
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->input('to_date'));
        }

        $logs = $query->paginate(50)->through(function ($log) {
            return [
                'id' => $log->id,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => $log->user->name,
                    'email' => $log->user->email,
                ] : null,
                'action' => $log->action,
                'action_label' => $log->action_label,
                'model_type' => $log->model_type ? class_basename($log->model_type) : null,
                'model_id' => $log->model_id,
                'description' => $log->description,
                'ip_address' => $log->ip_address,
                'route' => $log->route,
                'method' => $log->method,
                'created_at' => $log->created_at->format('M j, Y g:i A'),
                'created_at_relative' => $log->created_at->diffForHumans(),
            ];
        });

        // Get unique actions for filter dropdown
        $actions = AdminAuditLog::select('action')
            ->distinct()
            ->pluck('action');

        return Inertia::render('admin/AuditLogs', [
            'logs' => $logs,
            'actions' => $actions,
            'filters' => $request->only(['action', 'from_date', 'to_date']),
        ]);
    }

    /**
     * Clear all audit logs.
     */
    public function clearAuditLogs(): RedirectResponse
    {
        $deleted = AdminAuditLog::query()->delete();

        // Log this action (it will be the first entry after clearing)
        AdminAuditLog::log('clear_audit_logs', "Cleared {$deleted} audit log records");

        return back()->with('status', "Audit logs cleared successfully. ({$deleted} records deleted)");
    }

    /**
     * Export audit logs to Excel/CSV.
     */
    public function exportAuditLogs(Request $request)
    {
        $query = AdminAuditLog::query()
            ->with('user:id,name,email')
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('action') && $request->input('action') !== 'all') {
            $query->where('action', $request->input('action'));
        }
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->input('from_date'));
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->input('to_date'));
        }

        $logs = $query->get();

        // Create CSV content
        $csvContent = "ID,User,Email,Action,Description,IP Address,Route,Method,Date\n";

        foreach ($logs as $log) {
            $userName = $log->user ? str_replace(',', ' ', $log->user->name) : 'System';
            $userEmail = $log->user ? $log->user->email : '';
            $description = str_replace([',', "\n", "\r"], [' ', ' ', ' '], $log->description ?? '');
            
            $csvContent .= sprintf(
                "%d,%s,%s,%s,%s,%s,%s,%s,%s\n",
                $log->id,
                $userName,
                $userEmail,
                $log->action,
                $description,
                $log->ip_address,
                $log->route ?? '',
                $log->method ?? '',
                $log->created_at->format('Y-m-d H:i:s')
            );
        }

        AdminAuditLog::log('export_audit_logs', "Exported {$logs->count()} audit log records");

        $filename = 'audit-logs-' . date('Y-m-d-His') . '.csv';

        return response($csvContent)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }
}
