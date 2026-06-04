import React, { useState } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
    useMapEvents,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import useFacilities from '../hooks/useFacilities';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const CANADA_CENTER: [number, number] = [56.1304, -106.3468];
const CANADA_ZOOM = 4;

/* Click handler */
function ClickHandler({ onClick }: any) {
    useMapEvents({
        click(e) {
            onClick(e.latlng);
        },
    });
    return null;
}

function FacilityMap() {
    const { facilities, loading, error } = useFacilities();

    const [selectedPosition, setSelectedPosition] = useState<any>(null);
    const [radius, setRadius] = useState(7);
    const [filteredFacilities, setFilteredFacilities] = useState<any[]>([]);
    const [radiusMode, setRadiusMode] = useState(false);

    /* Call backend */
    const fetchWithinRadius = async (lat: number, lng: number, radiusKm: number) => {
        try {
            const res = await fetch(
                `/api/facilities/within-radius?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`,
            );

            const data = await res.json();
            setFilteredFacilities(data);
        } catch (err) {
            console.error(err);
            setFilteredFacilities([]);
        }
    };

    const handleMapClick = (latlng: any) => {
        setSelectedPosition(latlng);
        setRadiusMode(true);
        fetchWithinRadius(latlng.lat, latlng.lng, radius);
    };

    const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newRadius = Number(e.target.value);
        setRadius(newRadius);

        if (selectedPosition) {
            fetchWithinRadius(selectedPosition.lat, selectedPosition.lng, newRadius);
        }
    };

    if (loading) return <div style={styles.status}>Loading...</div>;
    if (error) return <div style={styles.status}>Error: {error}</div>;

    return (
        <div>
            <MapContainer center={CANADA_CENTER} zoom={CANADA_ZOOM} style={styles.map}>
                <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ClickHandler onClick={handleMapClick} />

                {/* FULL MAP */}
                {!radiusMode && (
                    <MarkerClusterGroup chunkedLoading>
                        {facilities.map((f) => (
                            <Marker key={f.uniqueId} position={[f.latitude, f.longitude]}>
                                <Popup>
                                    <strong>{f.facilityName}</strong>
                                    <br />
                                    {f.fullAddress}
                                    <br />
                                    <em>{f.facilityType}</em>
                                </Popup>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>
                )}

                {/* FILTERED MAP */}
                {radiusMode &&
                    filteredFacilities.map((f) => (
                        <Marker key={f.uniqueId} position={[f.latitude, f.longitude]}>
                            <Popup>
                                <strong>{f.facilityName}</strong>
                                <br />
                                {f.fullAddress}
                                <br />
                                <em>{f.facilityType}</em>
                            </Popup>
                        </Marker>
                    ))}

                {/* CIRCLE */}
                {selectedPosition && (
                    <>
                        <Marker position={selectedPosition} />
                        <Circle center={selectedPosition} radius={radius * 1000} />
                    </>
                )}
            </MapContainer>

            {/* CONTROLS */}
            {radiusMode && (
                <div style={{ padding: '16px' }}>
                    <label>Radius: {radius} km</label>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={radius}
                        onChange={handleRadiusChange}
                    />
                </div>
            )}

            {/* BUTTONS */}
            <div style={{ padding: '16px', display: 'flex', gap: '10px' }}>
                <button
                    onClick={() => {
                        setRadiusMode(false);
                        setSelectedPosition(null);
                        setFilteredFacilities([]);
                    }}
                >
                    Reset View
                </button>

                <button onClick={() => setRadiusMode(!radiusMode)}>
                    {radiusMode ? 'Show Full Map' : 'Enable Radius Mode'}
                </button>
            </div>

            {/* RESULT */}
            <div style={{ padding: '16px' }}>
                {radiusMode ? (
                    <>
                        <h3>Facilities in Selected Area</h3>
                        <p><strong>Total: {filteredFacilities.length}</strong></p>
                    </>
                ) : (
                    <p>Click on map to analyze an area</p>
                )}
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    map: {
        height: '70vh',
        width: '100%',
    },
    status: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    },
};

export default FacilityMap;