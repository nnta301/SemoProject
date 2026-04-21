import { AlertTriangle, MapPinned, X } from 'lucide-react'
import Button from './Button'

export default function GeofenceWarningModal({ open, scooterName, onClose }) {
    if (!open) {
        return null
    }

    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal">
                <div className="modal__header">
                    <div>
                        <h3>
                            <AlertTriangle size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                            Cảnh báo geofence
                        </h3>
                        <p>
                            {scooterName || 'Xe đang chọn'} đã đi ra khỏi vùng hoạt động cho phép.
                        </p>
                    </div>
                    <button className="btn btn--ghost btn--sm btn--icon" onClick={onClose} aria-label="Đóng">
                        <X size={18} />
                    </button>
                </div>

                <div className="modal__body">
                    <div className="warning-note">
                        <MapPinned size={20} />
                        <div>
                            <strong>Xe đang ngoài vùng an toàn</strong>
                            <p style={{ margin: '4px 0 0' }}>
                                Hãy di chuyển xe trở lại vùng geofence hoặc kết thúc chuyến để tránh khóa dịch vụ.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="modal__footer">
                    <Button onClick={onClose}>Đã hiểu</Button>
                </div>
            </div>
        </div>
    )
}