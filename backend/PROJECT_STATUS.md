# 🛵 SEMO (Smart E-Scooter Fleet Management & Battery Optimization) - Backend Project Status

**Tech Stack:** Java, Spring Boot, Spring Data JPA, Spring Security (JWT), MySQL, WebSocket.

---

## I. Nhóm Hạ Tầng & Bảo Mật (Infrastructure & Security)
**✅ Đã hoàn thành:**
* Xác thực và phân quyền bằng JWT Token.
* Phân chia 2 Role: `ADMIN` và `CUSTOMER`.
* Xử lý lỗi truy cập (403 Forbidden, 401 Unauthorized).
* Chống IDOR tuyệt đối cho các API tài khoản và nghiệp vụ thuê xe (chuẩn `/me`).

**🚀 Chưa làm:**
* (Hiện tại hạ tầng bảo mật đã hoàn chỉnh).

---

## II. Nhóm Quản Lý Cơ Bản (CRUD)
**✅ Đã hoàn thành:**
* **User CRUD:** Đăng ký, xem thông tin cá nhân, xem danh sách (Admin).
* **User Profile:** Cập nhật thông tin (Partial Update - `UserUpdateRequestDTO`).
* **Scooter CRUD:** Admin thêm xe mới, cập nhật trạng thái/pin/tọa độ, xem danh sách (có phân trang).
* **Feedback CRUD:** Khách hàng đánh giá (1-5 sao) và bình luận chuyến đi đã hoàn thành (Unique constraint).

**🚀 Chưa làm:**
* (Các chức năng CRUD cốt lõi đã đầy đủ).

---

## III. Nhóm Nghiệp Vụ & Tài Chính (Core Business & Finance)
**✅ Đã hoàn thành:**
* **Ví điện tử:** Nạp tiền (Deposit), quản lý số dư (`balance`).
* **Luồng Thuê Xe (Rental Core):** Bắt đầu chuyến (`IN_USE`), kết thúc chuyến (`AVAILABLE`).
* **Tính toán cước:** Tự động trừ cọc (50.000 VNĐ), hoàn cọc, tính cước thời gian thực (1.000 VNĐ/phút).
* **Lịch sử giao dịch:** Ghi vết tự động minh bạch (`DEPOSIT`, `RENTAL_DEPOSIT`, `RENTAL_REFUND`, `RENTAL_PAYMENT`).
* **Tài khoản nâng cao:** Khách hàng tự đổi mật khẩu, Admin cấp lại mật khẩu.
* **Quản lý Nợ (Debt Management):** Ghi nhận số dư âm, chặn khách hàng đang nợ thuê chuyến mới.

**🚀 Chưa làm:**
* [ ] **Cấu hình hệ thống (System Config):** Tạo bảng cấu hình để lưu các tham số động như Giá cọc, Giá thuê thay vì fix cứng trong code.

---

## IV. Nhóm Quản Trị & Thống Kê & Phân Tích Dữ Liệu (Admin & Analytics)
**✅ Đã hoàn thành:**
* **Admin Dashboard:** Thống kê tổng doanh thu, tổng số chuyến đi, số xe đang chạy, tỷ lệ xe theo trạng thái.
* **Quản lý lịch sử:** Admin xem toàn bộ lịch sử thuê xe (hỗ trợ bộ lọc filter).
* **Kiểm duyệt User:** Khóa (Ban) và Mở khóa (Unban) tài khoản vi phạm.

**🚀 Chưa làm:**
* [ ] **Phân tích dữ liệu lớn (K-Means Clustering):** 🚨 *Tính năng đột phá:* Thu thập dữ liệu lịch sử các chuyến đi (tọa độ trả xe), chạy thuật toán K-Means phân cụm để tự động "chấm" không gian và đề xuất các vị trí tối ưu xây dựng trạm sạc mới.
* [ ] **Khôi phục xe (Maintenance):** API chuyển trạng thái xe từ `MAINTENANCE` về `AVAILABLE` sau khi bảo trì xong.

---

## V. Nhóm Giám Sát Sức Khỏe Pin & Giả Lập IoT (Smart Battery & IoT Simulation)
**✅ Đã hoàn thành:**
* (Chưa bắt đầu)

**🚀 Chưa làm:**
* [ ] **Nâng cấp Entity Scooter (Smart Battery):** Bổ sung các chỉ số chuyên sâu: Chu kỳ sạc (`cycleCount`), Mức độ chai pin (`soh` - State of Health), và Nhiệt độ pin (`temperature`).
* [ ] **Giả lập IoT (Digital Twin):** Xây dựng Scheduled Tasks (CRON jobs) giả lập dữ liệu tĩnh thành luồng dữ liệu động: Xe tự động di chuyển tọa độ GPS, tiêu hao năng lượng và thay đổi nhiệt độ theo thời gian thực.
* [ ] **Auto-Maintenance Thông Minh:** 🚨 *Tính năng đột phá:* Tự động loại biên (chuyển sang `MAINTENANCE`) đối với các xe có nhiệt độ Pin vượt ngưỡng an toàn, sụt pin nhanh bất thường, hoặc dung lượng pin < 15%.
* [ ] **Xếp lịch sạc tự động:** Tự động hóa xếp lịch sạc pin dựa trên mức năng lượng còn lại của từng xe.

---

## VI. Nhóm Tương Tác Thời Gian Thực & Bản Đồ (Real-time GIS)
**✅ Đã hoàn thành:**
* (Chưa bắt đầu)

**🚀 Chưa làm:**
* [ ] **WebSocket Tracking:** Tích hợp giao thức WebSocket để bắn tọa độ xe liên tục lên Admin Dashboard, giúp xe hiển thị di chuyển mượt mà trên bản đồ mà không cần tải lại trang.
* [ ] **Geofencing (Hàng rào địa lý):** Thuật toán cảnh báo thời gian thực nếu hệ thống phát hiện tọa độ xe di chuyển vượt quá ranh giới khu vực quy định (ví dụ: ra khỏi khuôn viên trường Đại học Bách Khoa Hà Nội).