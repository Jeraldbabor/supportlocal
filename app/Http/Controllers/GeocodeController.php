<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GeocodeController extends Controller
{
    public function geocode(Request $request)
    {
        $address = $request->query('address');

        if (!$address) {
            return response()->json(['error' => 'Address parameter is required'], 400);
        }

        try {
            // Make request to Nominatim API
            $response = Http::withHeaders([
                'User-Agent' => 'SupportLocal/1.0 (Laravel Application)',
            ])->get('https://nominatim.openstreetmap.org/search', [
                'format' => 'json',
                'q' => $address,
                'limit' => 1,
            ]);

            $data = $response->json();

            // Check if we got results
            if (!empty($data) && isset($data[0])) {
                return response()->json([
                    'lat' => $data[0]['lat'],
                    'lon' => $data[0]['lon'],
                    'display_name' => $data[0]['display_name'] ?? null,
                ]);
            }

            return response()->json([
                'error' => 'Location not found',
                'lat' => null,
                'lon' => null,
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to geocode address',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
