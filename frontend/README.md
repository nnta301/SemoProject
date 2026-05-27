# SEMO Frontend

Ngắn gọn: đây là ứng dụng React + Vite cho giao diện SEMO.

## Chạy nhanh (development)

1. Cài Node (>=16 LTS) nếu chưa có. Ví dụ dùng Homebrew:

```bash
brew update
brew install node
```

Hoặc dùng `nvm` để quản lý phiên bản:

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.6/install.sh | bash
# sau đó: nvm install --lts && nvm use --lts
```

2. Cài dependencies và chạy dev server:

```bash
cd frontend
npm install
npm run dev
```

3. Mở trình duyệt vào: `http://localhost:5173` (mặc định Vite).

## Biến môi trường (Vite)

Tạo file `.env` hoặc `.env.local` trong thư mục `frontend` để ghi đè mặc định. Các biến hỗ trợ:

- `VITE_API_BASE_URL` — URL của backend API (mặc định `http://localhost:8080`).
- `VITE_RENTAL_USER_ID` — (tùy chọn) numeric user id khi tạo rental cho môi trường backend.

Ví dụ `.env`:

```
VITE_API_BASE_URL=http://localhost:8080
VITE_RENTAL_USER_ID=1
```

Sau khi thay đổi `.env`, khởi động lại `npm run dev`.

## API: gọi backend hay dùng mock?

Frontend này hoạt động theo chế độ **hybrid**:

- Các request sử dụng `src/services/apiClient.js` làm axios client với `baseURL` từ `VITE_API_BASE_URL` (mặc định `http://localhost:8080`).
- Một số thao tác có fallback sang dữ liệu giả (mock) nếu backend không phản hồi:
  - `scooterService.getScooters()` — gọi `GET /api/scooters`, nhưng nếu lỗi sẽ fallback về danh sách mock trong `src/mock/mockData.js`.
  - `authService.login()` và `authService.register()` — thử gọi backend; nếu backend trả lỗi hợp lệ hoặc không tồn tại, sẽ fallback dùng dữ liệu mock lưu trong `localStorage`.
- Các endpoint liên quan tới đặt xe / rental **không có fallback** và cần backend hoạt động:
  - `bookingService.reserveScooter()` → `POST /api/rentals/start`
  - `bookingService.endRide()` → `PUT /api/rentals/:id/end`
  - `scooterService.updateScooterStatus()` → `PUT /api/scooters/:id`

Tóm lại: giao diện có thể hiển thị danh sách và cho phép đăng nhập bằng mock nếu backend chưa chạy, nhưng chức năng đặt xe/khóa/mở khóa yêu cầu backend thực tế.

## Cấu trúc quan trọng

- `src/services/apiClient.js` — axios client, config baseURL, và interceptor thêm `Authorization` từ `localStorage`.
- `src/services/authService.js` — login/register với fallback vào `localStorage` mock.
- `src/services/scooterService.js` — lấy danh sách scooter (có fallback), tính toán khoảng cách, cập nhật trạng thái (gọi backend nếu có).
- `src/mock/mockData.js` — dữ liệu mock (users, scooters, geofence).

## Lưu ý khi phát triển

- Nếu backend chạy trên cổng khác, set `VITE_API_BASE_URL` cho đúng và đảm bảo CORS backend bật (ví dụ backend mặc định trên `http://localhost:8080`).
- Để test tính năng đặt xe đầy đủ, khởi backend (thư mục `backend`) trước.
- Session token và mock users được lưu trong `localStorage` — xóa `AUTH_SESSION`/`MOCK_USERS` nếu cần reset.

## Troubleshooting nhanh

- Lỗi `npm: command not found` → Node/npm chưa cài: cài theo hướng dẫn ở trên.
- Backend trả 401/403/500 khi test đặt xe → kiểm tra logs backend và CORS, xác thực token.

## Muốn tôi làm gì tiếp theo?
- Chạy hộ `npm install` + `npm run dev` trên terminal?
- Hoặc tạo một `.env.local` mẫu trong `frontend`? 

