export function getGeofenceWarning(scooter) {
    if (scooter?.geoFence?.outOfZone) {
        return 'Xe đang ở ngoài vùng geofence cho phép.'
    }

    return ''
}

export function getAutoDecommissionReason(scooter) {
    if (scooter?.health?.batteryOverheat) {
        return 'Pin quá nóng. Xe đã bị khóa để đảm bảo an toàn.'
    }

    if (scooter?.health?.rapidBatteryDrop) {
        return 'Pin sụt nhanh bất thường. Xe đã bị khóa để kiểm tra.'
    }

    if (scooter?.status === 'decommissioned') {
        return 'Xe đang ở trạng thái decommissioned.'
    }

    return ''
}