import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'
import {
    Circle,
    MapContainer,
    Marker,
    Polygon,
    Popup,
    TileLayer,
    useMap,
} from 'react-leaflet'
import { geofenceBoundary } from '../mock/mockData'

const userIcon = new L.DivIcon({
    html: '<div class="map-dot map-dot--user"></div>',
    className: 'map-dot-wrapper',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
})

const selectedScooterIcon = new L.DivIcon({
    html: '<div class="map-dot map-dot--scooter map-dot--selected"></div>',
    className: 'map-dot-wrapper',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
})

const scooterIcon = new L.DivIcon({
    html: '<div class="map-dot map-dot--scooter"></div>',
    className: 'map-dot-wrapper',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
})

function isValidCoordinate(lat, lng) {
    return Number.isFinite(lat) && Number.isFinite(lng)
}

function RecenterMap({ center }) {
    const map = useMap()

    useEffect(() => {
        if (center && isValidCoordinate(center.lat, center.lng)) {
            map.setView([center.lat, center.lng], Math.max(map.getZoom(), 15), {
                animate: true,
            })
        }
    }, [center, map])

    return null
}

export default function BookingMap({
                                       userLocation,
                                       scooters,
                                       selectedScooter,
                                       onSelectScooter,
                                   }) {
    const fallbackCenter = [21.0285, 105.8542]

    const mapCenter =
        userLocation && isValidCoordinate(userLocation.lat, userLocation.lng)
            ? [userLocation.lat, userLocation.lng]
            : fallbackCenter

    const geofencePolygon = useMemo(
        () => [
            [geofenceBoundary.north, geofenceBoundary.west],
            [geofenceBoundary.north, geofenceBoundary.east],
            [geofenceBoundary.south, geofenceBoundary.east],
            [geofenceBoundary.south, geofenceBoundary.west],
        ],
        [],
    )

    const safeScooters = Array.isArray(scooters) ? scooters : []

    return (
        <section className="panel map-panel">
            <div className="panel__header">
                <div>
                    <h2 className="panel__title">Bản đồ xe gần bạn</h2>
                    <p className="panel__subtitle">
                        Chọn xe trực tiếp trên bản đồ, theo dõi geofence và vị trí hiện tại.
                    </p>
                </div>
            </div>

            <div className="panel__body">
                <div className="booking-map">
                    <MapContainer
                        center={mapCenter}
                        zoom={15}
                        scrollWheelZoom
                        style={{ width: '100%', height: '100%' }}
                    >
                        <TileLayer
                            attribution="&copy; OpenStreetMap contributors"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {userLocation && isValidCoordinate(userLocation.lat, userLocation.lng) ? (
                            <>
                                <Marker
                                    position={[userLocation.lat, userLocation.lng]}
                                    icon={userIcon}
                                >
                                    <Popup>Vị trí hiện tại của bạn</Popup>
                                </Marker>

                                <Circle
                                    center={[userLocation.lat, userLocation.lng]}
                                    radius={Math.max(20, Number(userLocation.accuracy || 20))}
                                />

                                <RecenterMap center={userLocation} />
                            </>
                        ) : null}

                        <Polygon positions={geofencePolygon} />

                        {safeScooters.map((scooter) => {
                            const lat = Number(scooter.currentLat)
                            const lng = Number(scooter.currentLng)

                            if (!isValidCoordinate(lat, lng)) {
                                return null
                            }

                            const isSelected = selectedScooter?.id === scooter.id

                            return (
                                <Marker
                                    key={scooter.id}
                                    position={[lat, lng]}
                                    icon={isSelected ? selectedScooterIcon : scooterIcon}
                                    eventHandlers={{
                                        click: () => onSelectScooter(scooter),
                                    }}
                                >
                                    <Popup>
                                        <strong>{scooter.name}</strong>
                                        <br />
                                        {scooter.locationLabel}
                                        <br />
                                        Pin: {scooter.batteryLevel}%
                                        <br />
                                        Cách bạn: {scooter.distanceKm ?? 0} km
                                    </Popup>
                                </Marker>
                            )
                        })}
                    </MapContainer>
                </div>
            </div>
        </section>
    )
}