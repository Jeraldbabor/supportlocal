import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { MapPin, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerProps {
    latitude?: number;
    longitude?: number;
    onLocationChange: (lat: number, lng: number) => void;
    address?: string;
    centerOnAddress?: boolean;
}

// Default center (Philippines)
const defaultCenter: [number, number] = [14.5995, 120.9842];

// Component to handle map click events
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Component to recenter map when position changes
function RecenterMap({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position, map.getZoom());
    }, [position, map]);
    return null;
}

export default function LocationPicker({ latitude, longitude, onLocationChange, address, centerOnAddress = false }: LocationPickerProps) {
    const [markerPosition, setMarkerPosition] = useState<[number, number]>(
        latitude && longitude ? [latitude, longitude] : defaultCenter
    );
    const [searchAddress, setSearchAddress] = useState(address || '');
    const [isSearching, setIsSearching] = useState(false);
    const [isPinning, setIsPinning] = useState(false);
    const markerRef = useRef<L.Marker>(null);

    // Update marker position when props change
    useEffect(() => {
        if (latitude && longitude) {
            setMarkerPosition([latitude, longitude]);
        }
    }, [latitude, longitude]);

    // Auto-center map when address changes (for province/city/barangay selection)
    useEffect(() => {
        if (centerOnAddress && address && address.trim() !== '') {
            // Auto-search when the address prop changes
            const searchLocation = async () => {
                try {
                    const response = await fetch(
                        `/api/geocode?address=${encodeURIComponent(address)}`
                    );
                    const data = await response.json();

                    if (data && data.lat && data.lon) {
                        const lat = parseFloat(data.lat);
                        const lng = parseFloat(data.lon);
                        setMarkerPosition([lat, lng]);
                        // Only update coordinates if they haven't been manually set
                        if (!latitude || !longitude) {
                            onLocationChange(lat, lng);
                        }
                    }
                } catch (error) {
                    console.error('Error auto-centering map:', error);
                }
            };
            searchLocation();
        }
    }, [address, centerOnAddress]);

    // Handle location selection
    const handleLocationSelect = (lat: number, lng: number) => {
        setIsPinning(true);
        setMarkerPosition([lat, lng]);
        onLocationChange(lat, lng);
        setTimeout(() => setIsPinning(false), 500);
    };

    // Handle marker drag
    const handleMarkerDrag = () => {
        const marker = markerRef.current;
        if (marker) {
            const position = marker.getLatLng();
            setMarkerPosition([position.lat, position.lng]);
        }
    };

    const handleMarkerDragEnd = () => {
        const marker = markerRef.current;
        if (marker) {
            const position = marker.getLatLng();
            onLocationChange(position.lat, position.lng);
        }
    };

    // Search address using Nominatim (OpenStreetMap free geocoding)
    const handleSearchAddress = async () => {
        if (!searchAddress) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `/api/geocode?address=${encodeURIComponent(searchAddress + ', Philippines')}`
            );
            const data = await response.json();

            if (data && data.lat && data.lon) {
                const lat = parseFloat(data.lat);
                const lng = parseFloat(data.lon);
                setMarkerPosition([lat, lng]);
                onLocationChange(lat, lng);
            } else {
                alert('Location not found. Please try a different address.');
            }
        } catch (error) {
            console.error('Error searching address:', error);
            alert('Error searching address. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    // Get current location
    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setMarkerPosition([lat, lng]);
                    onLocationChange(lat, lng);
                },
                (error) => {
                    console.error('Error getting current location:', error);
                    alert('Unable to get your current location. Please enable location services.');
                },
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    return (
        <div className="space-y-3">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search address on map..."
                        value={searchAddress}
                        onChange={(e) => setSearchAddress(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearchAddress();
                            }
                        }}
                        className="pl-10"
                    />
                </div>
                <Button type="button" onClick={handleSearchAddress} disabled={isSearching} size="default">
                    {isSearching ? 'Searching...' : 'Search'}
                </Button>
                <Button type="button" onClick={handleGetCurrentLocation} variant="outline" size="default">
                    <MapPin className="h-4 w-4" />
                </Button>
            </div>

            {/* Leaflet Map */}
            <div className="overflow-hidden rounded-lg border shadow-sm relative z-0" style={{ cursor: 'crosshair', height: '400px' }}>
                <MapContainer
                    center={markerPosition}
                    zoom={latitude && longitude ? 17 : 12}
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                    zoomControl={true}
                    scrollWheelZoom={true}
                >
                    {/* OpenStreetMap Tile Layer */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Draggable Marker */}
                    <Marker
                        position={markerPosition}
                        draggable={true}
                        eventHandlers={{
                            drag: handleMarkerDrag,
                            dragend: handleMarkerDragEnd,
                        }}
                        ref={markerRef}
                    />

                    {/* Map Click Handler */}
                    <MapClickHandler onLocationSelect={handleLocationSelect} />
                    
                    {/* Recenter Map */}
                    <RecenterMap position={markerPosition} />
                </MapContainer>
            </div>

            {/* Instructions */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                <p className="font-medium">📍 How to pin your exact location:</p>
                <ul className="ml-4 mt-1 list-disc space-y-1">
                    <li><strong>Click anywhere</strong> on the map to drop a pin at that location</li>
                    <li><strong>Drag the red marker</strong> to fine-tune your exact position</li>
                    <li><strong>Search address</strong> above to quickly find a location</li>
                    <li><strong>Use GPS button</strong> <MapPin className="inline h-3 w-3" /> to auto-detect your current location</li>
                    <li><strong>Zoom in</strong> using scroll or +/- buttons for precise pinning</li>
                </ul>
            </div>

            {/* Coordinates Display */}
            {markerPosition && Array.isArray(markerPosition) && markerPosition.length === 2 && (
                <div className={`rounded-lg border p-3 text-sm transition-all ${isPinning ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-semibold text-gray-700">📌 Pin Location:</span>
                            <div className="mt-1 font-mono text-xs text-gray-600">
                                <div><strong>Latitude:</strong> {Number(markerPosition[0]).toFixed(7)}°</div>
                                <div><strong>Longitude:</strong> {Number(markerPosition[1]).toFixed(7)}°</div>
                            </div>
                        </div>
                        {isPinning && (
                            <div className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white">
                                ✓ Location Updated
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
