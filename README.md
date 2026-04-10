# DrinkSalesSystem
---
## Giới thiệu
**DrinkSalesSystem** là hệ thống quản lý bán nước uống được xây dựng theo hướng **Web Service (RESTful API)**, kết hợp giữa **backend Node.js/Express** và **frontend Vue.js**.  
Hệ thống được thiết kế để:
- Quản lý thông tin người dùng
- Quản lý sản phẩm, danh mục, thương hiệu và phương thức thanh toán
- Quản lý giỏ hàng, đơn hàng và upload hình ảnh

---
## Mục đích dự án
DrinkSalesSystem được xây dựng nhằm:
- Tạo một hệ thống bán hàng có cấu trúc rõ ràng, dễ mở rộng
- Tách riêng backend và frontend theo mô hình RESTful
- Hỗ trợ đầy đủ các nghiệp vụ cơ bản của đồ án cuối kỳ
- Có thể mở rộng thêm các chức năng thương mại điện tử trong tương lai

### Định hướng phát triển
- Thanh toán online
- Chat giữa người dùng theo thời gian thực
- Đánh giá / review sản phẩm
- Thông báo realtime khi có đơn hàng hoặc tin nhắn mới

---
## Công nghệ sử dụng

### Backend
- **Node.js**
  - Nền tảng chính để xây dựng backend
  - Xử lý nghiệp vụ, xác thực và phân quyền

- **Express.js**
  - Xây dựng RESTful API
  - Xử lý request/response theo mô hình route-based

- **MongoDB**
  - CSDL NoSQL dùng để lưu trữ dữ liệu hệ thống

- **Mongoose**
  - ORM/ODM giúp thao tác MongoDB thuận tiện hơn
  - Hỗ trợ schema, model và validation ở mức dữ liệu

- **JWT**
  - Xác thực người dùng bằng token
  - Hỗ trợ phân quyền theo vai trò

- **bcryptjs**
  - Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu

- **Multer**
  - Upload file và ảnh cho sản phẩm, bài viết hoặc dữ liệu liên quan

- **Socket.IO**
  - Hỗ trợ realtime chat và các sự kiện thời gian thực

- **express-validator**
  - Kiểm tra và xác thực dữ liệu đầu vào

- **dotenv**
  - Quản lý biến môi trường

- **cors, helmet, compression, morgan, express-rate-limit**
  - Middleware hỗ trợ bảo mật, tối ưu hiệu năng và logging

### Frontend
- **Vue.js 3**
  - Xây dựng giao diện người dùng
  - Gọi API để hiển thị và thao tác dữ liệu

- **Vite**
  - Dev server và build tool cho frontend

- **Vue Router**
  - Điều hướng trang theo module

- **Axios**
  - Gửi request đến backend RESTful API

### Công cụ phát triển
- **npm**
  - Quản lý package và script chạy dự án

- **nodemon**
  - Tự động restart backend khi code thay đổi

- **MongoDB Compass**
  - Công cụ giao diện để xem và quản lý dữ liệu MongoDB

---
## Tính năng chính

- CRUD cho nhiều module
- Authentication bằng JWT
- Authorization theo role `admin`, `staff`, `customer`
- Upload ảnh/file
- Transaction khi tạo đơn hàng
- Socket realtime cho các sự kiện đơn hàng
- Quản lý brand, payment method, product image
- Báo cáo doanh thu và sản phẩm bán chạy

---
## Cấu trúc chính

Backend được tổ chức theo style folder gọn, dễ đọc:

- `app.js`
- `bin/www`
- `routes/`
- `controllers/`
- `schemas/`
- `utils/`
- `scripts/`
- `views/`
- `public/`
- `uploads/`

Frontend nằm trong thư mục:

- `Frontend/`

---
## Cách chạy dự án

### Backend
```bash
npm install
cp .env.example .env
npm run seed
npm start
```

`npm run seed` sẽ tạo dữ liệu mẫu cho:
- roles
- categories
- brands
- payment methods
- products
- product images
- admin account nếu bạn khai báo `ADMIN_EMAIL` và `ADMIN_PASSWORD`

### Frontend
```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```

Mặc định:
- Backend chạy tại `http://localhost:3000`
- Frontend chạy tại `http://localhost:5173`
- Frontend gọi API qua `/api/v1`

### Docker
```bash
docker compose up --build
```

Sau khi chạy:
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000`
- MongoDB: `mongodb://127.0.0.1:27018`

Mặc định Docker Compose sẽ:
- khởi động MongoDB
- chạy backend Node.js
- tự seed dữ liệu mẫu
- build frontend Vue.js và serve bằng Nginx

Thông tin đăng nhập demo trong Docker:
- Email: `admin@gmail.com`
- Mật khẩu: `Admin@123`

Nếu muốn xóa toàn bộ dữ liệu Docker và chạy lại từ đầu:
```bash
docker compose down -v
```

---
## API routes

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/roles`
- `/api/v1/brands`
- `/api/v1/categories`
- `/api/v1/products`
- `/api/v1/product-images`
- `/api/v1/payment-methods`
- `/api/v1/reports`
- `/api/v1/carts`
- `/api/v1/upload`
- `/api/v1/orders`

---
## WebSocket events

### Server emit
- `socket:connected`
- `order:created`
- `order:updated`

---
## Ghi chú
- Backend hiện dùng **Node.js + Express + MongoDB**, không dùng MVC truyền thống.
- Frontend dùng **Vue.js** để đọc dữ liệu từ API, không truy cập MongoDB trực tiếp.
- Dữ liệu mẫu ban đầu được tạo bằng script seed để dễ demo và kiểm tra chức năng.
