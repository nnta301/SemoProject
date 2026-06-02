# 🛵 SEMO (Scooter Rental System) - Backend Project Status

**Tech Stack:** Java, Spring Boot, Spring Data JPA, Spring Security (JWT), MySQL.

## ✅ Các Module Đã Hoàn Thành

### 1. 🔐 Auth & Security
- Xác thực và phân quyền bằng JWT Token.
- Phân chia 2 Role: `ADMIN` và `CUSTOMER`.
- Chặn truy cập (403 Forbidden, 401 Unauthorized) đối với các API yêu cầu đăng nhập.

### 2. 👤 User Module 
- Quản lý thông tin cá nhân của người dùng.
- Tích hợp ví điện tử (`balance`).
- API Nạp tiền vào ví (Deposit) để có số dư thuê xe.

### 3. 🛴 Scooter Module (Quản lý Xe)
- **Admin:** CRUD xe mới, cập nhật tọa độ và tình trạng pin.
- **Validation:** Chuẩn hóa và kiểm tra trạng thái xe hợp lệ (`AVAILABLE`, `IN_USE`, `MAINTENANCE`).
- API lấy danh sách xe (có hỗ trợ phân trang).

### 4. 🗺️ Rental Module (Luồng Thuê Xe Cốt Lõi)
- **Bắt đầu (Start):** Yêu cầu xe phải `AVAILABLE` và ví khách hàng phải có tối thiểu 50.000 VNĐ. Tự động đổi trạng thái xe sang `IN_USE` và trừ tiền cọc.
- **Kết thúc (End):** Tính tiền dựa trên thời gian chạy thực tế (1000 VNĐ/phút). Tự động hoàn cọc/trừ phí, đổi trạng thái xe về `AVAILABLE`. Chặn IDOR (không cho phép kết thúc chuyến của người khác).
- **Lịch sử:** Khách hàng xem lịch sử của mình, Admin xem toàn bộ lịch sử (hỗ trợ lọc theo `status`).

### 5. ⭐ Feedback & Rating Module (Đánh giá)
- Cho phép khách hàng đánh giá (1-5 sao) và để lại bình luận.
- **Business Logic:** Chỉ áp dụng cho chuyến đi đã `COMPLETED`. Mỗi chuyến đi chỉ được đánh giá 1 lần duy nhất (Database `UNIQUE` constraint).
- **Chống IDOR:** Chỉ chủ nhân của chuyến xe mới được phép đánh giá.

### 6. 📊 Admin Dashboard (Thống kê)
- API dành riêng cho Admin để xem tổng quan hệ thống.
- Tính toán: Tổng doanh thu, Tổng số chuyến đi hoàn thành, Số chuyến đang chạy, Thống kê số lượng xe theo trạng thái.

## 7. 💳 Lịch sử giao dịch (Transaction History)
- Tự động ghi vết dòng tiền cực kỳ minh bạch.
- Hỗ trợ các loại giao dịch: `DEPOSIT` (Nạp tiền), `RENTAL_DEPOSIT` (Trừ cọc), `RENTAL_REFUND` (Hoàn cọc), `RENTAL_PAYMENT` (Trừ cước).
---

## 🚀 Nhiệm Vụ Tiếp Theo (Đang chờ xử lý)
- [ ] Tính năng Quản lý người dùng cho Admin (Ban/Unban User).