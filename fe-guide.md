# 🎨 Hệ Thống Quản Lý Sinh Viên - Hướng Dẫn Frontend

## 📋 Mục Lục

- [Tổng Quan](#tổng-quan)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Khởi Tạo Dự Án](#khởi-tạo-dự-án)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Cài Đặt Dependencies](#cài-đặt-dependencies)
- [Cấu Hình Dự Án](#cấu-hình-dự-án)
- [Xây Dựng Components](#xây-dựng-components)
- [Quản Lý State](#quản-lý-state)
- [Tích Hợp API](#tích-hợp-api)
- [Tích Hợp Backend](#tích-hợp-backend)
- [Routing](#routing)
- [Styling](#styling)
- [Chạy Ứng Dụng](#chạy-ứng-dụng)
- [Build Production](#build-production)
- [Best Practices](#best-practices)
- [Xử Lý Lỗi Thường Gặp](#xử-lý-lỗi-thường-gặp)

---

## 🎯 Tổng Quan

**Frontend Hệ Thống Quản Lý Sinh Viên** là một ứng dụng web hiện đại được xây dựng với React, Vite và JavaScript. Ứng dụng cung cấp giao diện người dùng thân thiện để quản lý sinh viên, khóa học và đăng ký học.

### Điểm Nổi Bật

- ⚡ **Vite**: Build tool cực nhanh với HMR (Hot Module Replacement)
- ⚛️ **React 18**: Thư viện UI hiện đại với Hooks
- 🎨 **Tailwind CSS**: Utility-first CSS framework cho styling nhanh chóng
- 🔄 **React Router**: Điều hướng SPA mượt mà
- 📡 **Axios**: HTTP client để gọi API
- 🎭 **React Hook Form**: Quản lý form dễ dàng
- 🎉 **React Toastify**: Thông báo đẹp mắt

---

## � Danh Sách Các Trang (Pages)

### 1. Nhóm Trang Dùng Chung (Public/Common)

Những trang này dành cho tất cả người dùng hoặc là điểm vào hệ thống.

#### 🔐 Trang Login (Đăng Nhập)

| Mục | Chi tiết |
|-----|----------|
| **Route** | `/login` |
| **Quyền truy cập** | Public (ai cũng truy cập được) |
| **Mục đích** | Xác thực người dùng bằng Username/Password |

**Tính năng:**
- Form đăng nhập với validation (username required, password min 6 ký tự)
- Hiển thị lỗi khi sai thông tin đăng nhập
- Remember me (tùy chọn lưu phiên đăng nhập)
- Link chuyển đến trang Đăng ký

**Rules:**
- Sau khi đăng nhập thành công → Redirect theo role:
  - `ROLE_ADMIN` → `/admin/dashboard`
  - `ROLE_TEACHER` → `/teacher/dashboard`
  - `ROLE_STUDENT` → `/student/dashboard`
- Nếu đã đăng nhập mà vào `/login` → Redirect về Dashboard tương ứng
- Lưu accessToken vào localStorage sau khi login

---

#### 👤 Trang Profile (Thông Tin Cá Nhân)

| Mục | Chi tiết |
|-----|----------|
| **Route** | `/profile` |
| **Quyền truy cập** | Authenticated (tất cả user đã đăng nhập) |
| **Mục đích** | Xem và cập nhật thông tin cá nhân |

**Tính năng:**
- Hiển thị thông tin user hiện tại (họ tên, email, phone, avatar)
- Form chỉnh sửa thông tin cá nhân
- Chức năng đổi mật khẩu (yêu cầu nhập mật khẩu cũ)
- Upload/thay đổi avatar

**Rules:**
- User chỉ được sửa thông tin của chính mình
- Không được sửa username và email (chỉ xem)
- Đổi mật khẩu phải nhập đúng mật khẩu cũ
- Mật khẩu mới tối thiểu 6 ký tự

---

### 2. Nhóm Trang Dành Cho ADMIN (Quản Trị Viên)

Đây là nơi Admin quản lý toàn bộ hệ thống với quyền CRUD đầy đủ.

#### 📊 Dashboard Admin

| Mục | Chi tiết |
|-----|----------|
| **Route** | `/admin/dashboard` |
| **Quyền truy cập** | ADMIN only |
| **Mục đích** | Tổng quan nhanh về hệ thống |

**Tính năng:**
- Thống kê tổng số: Học viên, Giáo viên, Khóa học, Lớp học
- Biểu đồ doanh thu tháng này (line chart hoặc bar chart)
- Danh sách học viên mới đăng ký gần đây (5-10 người)
- Danh sách lớp học sắp đầy sỉ số
- Quick actions: Thêm khóa học mới, thêm user, xem báo cáo

**Rules:**
- Dữ liệu phải được cập nhật realtime hoặc refresh khi vào trang
- Các số liệu có thể click để xem chi tiết

---

#### 📚 Quản Lý Khóa Học (Courses)

| Mục | Chi tiết |
|-----|----------|
| **Route** | `/admin/courses` |
| **Quyền truy cập** | ADMIN only |
| **Mục đích** | CRUD khóa học trong hệ thống |

**Tính năng:**
- Danh sách tất cả khóa học (table với phân trang)
- Tìm kiếm theo tên, mã khóa học
- Lọc theo trạng thái (Active/Inactive), trình độ
- Thêm khóa học mới (tên, mô tả, giá tiền, thời lượng, trình độ)
- Sửa thông tin khóa học
- Xóa khóa học (soft delete - đổi trạng thái thành Inactive)

**Rules:**
- Không được xóa khóa học đang có lớp học Active
- Giá tiền phải là số dương
- Tên khóa học unique trong hệ thống

---

#### 🏫 Quản Lý Lớp Học (Classes)

| Mục | Chi tiết |
|-----|----------|
| **Route** | `/admin/classes` |
| **Quyền truy cập** | ADMIN only |
| **Mục đích** | Tạo lớp học từ khóa học, gán giáo viên |

**Tính năng:**
- Danh sách tất cả lớp học (table với phân trang)
- Tạo lớp mới: Chọn khóa học → Gán giáo viên → Đặt sỉ số tối đa (`max_students`)
- Thiết lập lịch học (ngày, giờ bắt đầu, giờ kết thúc)
- Xem danh sách học viên trong lớp
- Đóng/Mở đăng ký lớp học

**Rules:**
- Mỗi lớp phải gán 1 giáo viên (required)
- `max_students` phải là số nguyên dương (mặc định: 30)
- Không được xóa lớp đã có học viên đăng ký
- Giáo viên không được dạy 2 lớp trùng lịch

---

#### 👥 Quản Lý Người Dùng (Users)

| Mục | Chi tiết |
|-----|----------|
| **Route** | `/admin/users` |
| **Quyền truy cập** | ADMIN only |
| **Mục đích** | Quản lý tài khoản Giáo viên và Học viên |

**Tính năng:**
- Danh sách tất cả users (table với phân trang)
- Lọc theo Role (Teacher/Student), trạng thái (Active/Inactive)
- Tìm kiếm theo tên, email, username
- Thêm user mới (với role Teacher hoặc Student)
- Sửa thông tin user
- Active/Deactivate tài khoản
- Reset mật khẩu user

**Rules:**
- Admin không thể xóa chính mình
- User bị Deactive không thể đăng nhập
- Reset mật khẩu → gửi password mới về email (hoặc hiện popup)

---

#### 📈 Thống Kê & Báo Cáo

| Mục | Chi tiết |
|-----|----------|
| **Route** | `/admin/reports` |
| **Quyền truy cập** | ADMIN only |
| **Mục đích** | Xem thống kê và báo cáo chi tiết |

**Tính năng:**
- Biểu đồ doanh thu theo tháng/quý/năm
- Danh sách học viên mới đăng ký (có lọc theo khoảng thời gian)
- Danh sách các lớp đã đầy sỉ số
- Thống kê số lượng đăng ký theo từng khóa học
- Export báo cáo ra Excel/PDF (tùy chọn)

**Rules:**
- Có thể filter theo khoảng thời gian (từ ngày - đến ngày)
- Dữ liệu phải chính xác với database

---

### 3. Nhóm Trang Dành Cho GIÁO VIÊN (Teacher)

Tập trung vào nghiệp vụ giảng dạy và quản lý lớp.

#### 📊 Dashboard Giáo Viên

| Mục | Chi tiết |
|-----|----------|
| **Route** | `/teacher/dashboard` |
| **Quyền truy cập** | ADMIN, TEACHER |
| **Mục đích** | Xem tổng quan lịch dạy |

**Tính năng:**
- Lịch dạy trong ngày/tuần (calendar view hoặc list view)
- Số lớp đang phụ trách
- Thông báo: Lớp sắp bắt đầu, bài tập cần chấm
- Quick access: Điểm danh hôm nay, Nhập điểm

**Rules:**
- Chỉ hiển thị các lớp mà giáo viên đó được gán
- Lịch tự động highlight lớp học hôm nay

---

#### 📖 Quản Lý Lớp Dạy

| Mục | Chi tiết |
|-----|----------|
| **Route** | `/teacher/classes` |
| **Quyền truy cập** | ADMIN, TEACHER |
| **Mục đích** | Xem danh sách lớp mình đang phụ trách |

**Tính năng:**
- Danh sách các lớp đang dạy (card hoặc table view)
- Xem chi tiết từng lớp: Thông tin khóa học, sỉ số hiện tại, lịch học
- Xem danh sách học viên trong lớp
- Truy cập nhanh đến Điểm danh hoặc Nhập điểm của lớp

**Rules:**
- Teacher chỉ thấy các lớp được gán cho mình
- Không được sửa thông tin lớp (chỉ Admin có quyền)

---

#### ✅ Điểm Danh (Attendance)

| Mục | Chi tiết |
|-----|----------|
| **Route** | `/teacher/attendance` |
| **Quyền truy cập** | ADMIN, TEACHER |
| **Mục đích** | Điểm danh học viên theo buổi học |

**Tính năng:**
- Chọn lớp → Chọn ngày/buổi học
- Hiển thị danh sách học viên của lớp đó
- Checkbox để đánh dấu: Có mặt / Vắng / Có phép
- Ghi chú cho từng học viên (nếu cần)
- Nút Lưu để submit attendance

**Rules:**
- Mỗi buổi học chỉ điểm danh 1 lần (có thể sửa lại)
- Teacher chỉ điểm danh được lớp của mình
- Lưu lại lịch sử điểm danh

---

#### 📝 Nhập Điểm (Grading)

| Mục | Chi tiết |
|-----|----------|
| **Route** | `/teacher/grading` |
| **Quyền truy cập** | ADMIN, TEACHER |
| **Mục đích** | Nhập điểm và nhận xét cho học viên |

**Tính năng:**
- Chọn lớp → Hiển thị danh sách học viên
- Nhập điểm số (0-10 hoặc theo thang điểm tùy chỉnh)
- Nhập nhận xét/comment cho từng học viên
- Các loại điểm: Điểm giữa kỳ, Điểm cuối kỳ, Điểm chuyên cần, Điểm tổng kết
- Nút Lưu để submit grades

**Rules:**
- Teacher chỉ nhập điểm được lớp của mình
- Điểm phải trong khoảng hợp lệ (0-10)
- Có thể sửa điểm sau khi đã nhập
- Điểm tổng kết có thể tính tự động theo công thức

---

### 4. Nhóm Trang Dành Cho HỌC VIÊN (Student)

Giao diện thân thiện, dễ dùng cho học viên.

#### 🔍 Tìm Kiếm Khóa Học

| Mục | Chi tiết |
|-----|----------|
| **Route** | `/student/courses` hoặc `/courses` |
| **Quyền truy cập** | Authenticated users |
| **Mục đích** | Tìm và duyệt các khóa học đang mở |

**Tính năng:**
- Danh sách các khóa học đang mở đăng ký (card view)
- Bộ lọc: Theo trình độ (Cơ bản, Nâng cao), theo khoảng giá
- Tìm kiếm theo tên khóa học
- Sắp xếp: Mới nhất, Giá thấp-cao, Phổ biến nhất
- Click vào khóa học để xem chi tiết

**Rules:**
- Chỉ hiển thị khóa học có trạng thái Active
- Hiển thị badge "Sắp hết chỗ" nếu lớp gần đầy sỉ số

---

#### 📋 Chi Tiết & Đăng Ký Khóa Học

| Mục | Chi tiết |
|-----|----------|
| **Route** | `/student/courses/:id` hoặc `/courses/:id` |
| **Quyền truy cập** | Authenticated users |
| **Mục đích** | Xem chi tiết và đăng ký học |

**Tính năng:**
- Thông tin đầy đủ khóa học: Mô tả, thời lượng, giá, trình độ
- Danh sách các lớp đang mở của khóa học này
- Hiển thị sỉ số còn trống của mỗi lớp (`current_students / max_students`)
- Nút "Đăng Ký" cho từng lớp
- Hiển thị tên giáo viên và lịch học của lớp

**Rules:**
- **Kiểm tra sỉ số**: Nếu `current_students >= max_students` → Disable nút đăng ký, hiện "Lớp đã đầy"
- Học viên không được đăng ký trùng lớp đã có
- Sau khi đăng ký thành công → Hiện thông báo và redirect về Thời khóa biểu

---

#### 📅 Thời Khóa Biểu Cá Nhân

| Mục | Chi tiết |
|-----|----------|
| **Route** | `/student/schedule` |
| **Quyền truy cập** | ADMIN, TEACHER, STUDENT |
| **Mục đích** | Xem lịch học của các lớp đã đăng ký |

**Tính năng:**
- Hiển thị calendar view (tuần/tháng) với các buổi học
- List view: Danh sách tất cả lớp đã đăng ký
- Thông tin mỗi lớp: Tên khóa, giáo viên, phòng học, giờ học
- Filter theo tuần hiện tại / tuần tới
- Highlight các buổi học hôm nay

**Rules:**
- Chỉ hiển thị lịch của các lớp mà student đã đăng ký thành công
- Có thể hủy đăng ký lớp (nếu lớp chưa bắt đầu)

---

#### 📊 Kết Quả Học Tập

| Mục | Chi tiết |
|-----|----------|
| **Route** | `/student/grades` |
| **Quyền truy cập** | ADMIN, TEACHER, STUDENT |
| **Mục đích** | Xem điểm số và nhận xét |

**Tính năng:**
- Danh sách các lớp đã/đang học
- Xem điểm từng lớp: Điểm chuyên cần, giữa kỳ, cuối kỳ, tổng kết
- Xem nhận xét từ giáo viên
- Xem lịch sử điểm danh (số buổi vắng)
- Xem lịch sử đóng học phí (đã đóng/chưa đóng)

**Rules:**
- Student chỉ xem được điểm của chính mình
- Điểm chỉ hiển thị khi giáo viên đã nhập

---

### 📋 Tổng Hợp Routes

| Route | Trang | Roles |
|-------|-------|-------|
| `/login` | Đăng nhập | Public |
| `/register` | Đăng ký | Public |
| `/profile` | Thông tin cá nhân | All authenticated |
| `/admin/dashboard` | Dashboard Admin | ADMIN |
| `/admin/courses` | Quản lý khóa học | ADMIN |
| `/admin/classes` | Quản lý lớp học | ADMIN |
| `/admin/users` | Quản lý người dùng | ADMIN |
| `/admin/reports` | Thống kê báo cáo | ADMIN |
| `/teacher/dashboard` | Dashboard Giáo viên | ADMIN, TEACHER |
| `/teacher/classes` | Lớp đang dạy | ADMIN, TEACHER |
| `/teacher/attendance` | Điểm danh | ADMIN, TEACHER |
| `/teacher/grading` | Nhập điểm | ADMIN, TEACHER |
| `/student/courses` | Tìm khóa học | All authenticated |
| `/student/courses/:id` | Chi tiết & Đăng ký | All authenticated |
| `/student/schedule` | Thời khóa biểu | All authenticated |
| `/student/grades` | Kết quả học tập | All authenticated |

---

## �🛠️ Công Nghệ Sử Dụng

### Core Technologies

- **React** 18.x - Thư viện UI
- **Vite** 5.x - Build tool & dev server
- **JavaScript** (ES6+) - Ngôn ngữ lập trình
- **React Router DOM** 6.x - Routing
- **Axios** - HTTP client

### UI & Styling

- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **React Toastify** - Notifications

### Form & Validation

- **React Hook Form** - Form management
- **Yup** hoặc **Zod** - Schema validation (tùy chọn)

### State Management

- **React Context API** - Global state (đơn giản)
- **Zustand** hoặc **Redux Toolkit** - State management (phức tạp)

---

## 📦 Yêu Cầu Hệ Thống

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

- ☑️ **Node.js** 18.x trở lên
- ☑️ **npm** 9.x+ hoặc **yarn** 1.22+
- ☑️ **Git** (để quản lý phiên bản)
- ☑️ **VS Code** (khuyến nghị) với các extensions:
  - ESLint
  - Prettier
  - ES7+ React/Redux/React-Native snippets

### Kiểm Tra Cài Đặt

```bash
# Kiểm tra Node.js
node --version

# Kiểm tra npm
npm --version

# Kiểm tra yarn (nếu dùng)
yarn --version
```

---

## 🚀 Khởi Tạo Dự Án

### Tạo Dự Án Mới Với Vite

```bash
# Tạo project mới
npm create vite@latest student-management-frontend -- --template react

# Di chuyển vào thư mục project
cd student-management-frontend

# Cài đặt dependencies
npm install
```

### Hoặc Khởi Tạo Trong Thư Mục Hiện Tại

```bash
# Khởi tạo trong thư mục hiện tại
npm create vite@latest ./ -- --template react

# Cài đặt dependencies
npm install
```

---

## 📁 Cấu Trúc Dự Án

```
student-management-frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── styles/
│   │       └── global.css
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── ErrorMessage.jsx
│   │   ├── students/
│   │   │   ├── StudentList.jsx
│   │   │   ├── StudentForm.jsx
│   │   │   ├── StudentCard.jsx
│   │   │   └── StudentDetail.jsx
│   │   ├── courses/
│   │   │   ├── CourseList.jsx
│   │   │   ├── CourseForm.jsx
│   │   │   └── CourseCard.jsx
│   │   └── enrollments/
│   │       ├── EnrollmentList.jsx
│   │       └── EnrollmentForm.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Students.jsx
│   │   ├── Courses.jsx
│   │   ├── Enrollments.jsx
│   │   └── NotFound.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── studentService.js
│   │   ├── courseService.js
│   │   └── enrollmentService.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/
│   │   ├── useStudents.js
│   │   ├── useCourses.js
│   │   └── useForm.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 📥 Cài Đặt Dependencies

### Dependencies Chính

```bash
# React Router
npm install react-router-dom

# Axios cho HTTP requests
npm install axios

# React Hook Form
npm install react-hook-form

# React Icons
npm install react-icons

# React Toastify cho notifications
npm install react-toastify

# Date formatting (tùy chọn)
npm install date-fns

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Dev Dependencies (Tùy Chọn)

```bash
# ESLint & Prettier
npm install -D eslint prettier eslint-config-prettier eslint-plugin-react
```

### Package.json Mẫu

```json
{
  "name": "student-management-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.7",
    "react-hook-form": "^7.50.1",
    "react-icons": "^5.0.1",
    "react-toastify": "^10.0.4",
    "date-fns": "^3.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.4"
  }
}
```

---

## ⚙️ Cấu Hình Dự Án

### 1. Cấu Hình Vite (`vite.config.js`)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

### 2. Cấu Hình Tailwind CSS (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#06b6d4',
      },
    },
  },
  plugins: [],
}
```

### 3. Biến Môi Trường (`.env`)

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:8080/api

# App Config
VITE_APP_NAME=Student Management System
VITE_APP_VERSION=1.0.0
```

### 4. File `.env.example`

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api

# App Configuration
VITE_APP_NAME=Student Management System
VITE_APP_VERSION=1.0.0
```

---

## 🎨 Styling với Tailwind CSS

### Setup Tailwind trong `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles nếu cần */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-md font-medium transition-all duration-150 inline-flex items-center gap-2;
  }
  
  .btn-primary {
    @apply bg-primary text-white hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-md;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
  }
  
  .btn-danger {
    @apply bg-danger text-white hover:bg-red-600;
  }
  
  .btn-success {
    @apply bg-success text-white hover:bg-green-600;
  }
  
  .card {
    @apply bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow;
  }
  
  .form-input {
    @apply w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent;
  }
  
  .form-input-error {
    @apply border-danger focus:ring-danger;
  }
}
```

### Ví Dụ Sử Dụng Tailwind Classes

#### Button Examples

```jsx
// Primary button
<button className="btn btn-primary">
  <FaPlus /> Thêm Mới
</button>

// Secondary button
<button className="btn btn-secondary">
  Hủy
</button>

// Danger button
<button className="btn btn-danger">
  <FaTrash /> Xóa
</button>
```

#### Card Examples

```jsx
<div className="card">
  <h3 className="text-2xl font-bold mb-4">Tiêu đề</h3>
  <p className="text-gray-600">Nội dung card...</p>
</div>
```

#### Form Examples

```jsx
<div className="mb-4">
  <label className="block mb-2 font-medium text-gray-700">
    Email <span className="text-danger">*</span>
  </label>
  <input
    type="email"
    className="form-input"
    placeholder="email@example.com"
  />
  <span className="block mt-1 text-sm text-danger">
    Email không hợp lệ
  </span>
</div>
```

#### Table Examples

```jsx
<div className="overflow-x-auto">
  <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
          ID
        </th>
        <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
          Tên
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3 border-b border-gray-200">1</td>
        <td className="px-4 py-3 border-b border-gray-200">Nguyễn Văn A</td>
      </tr>
    </tbody>
  </table>
</div>
```

#### Layout Examples

```jsx
// Container
<div className="max-w-7xl mx-auto px-4">
  {/* Nội dung */}
</div>

// Grid Layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>

// Flex Layout
<div className="flex justify-between items-center">
  <h2 className="text-2xl font-bold">Tiêu đề</h2>
  <button className="btn btn-primary">Action</button>
</div>
```

#### Loading Spinner

```jsx
<div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
  <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
  <p className="text-gray-600">Đang tải...</p>
</div>
```

---

## 🧩 Xây Dựng Components

### 1. Setup API Service (`src/services/api.js`)

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Thêm token nếu có
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server trả về error response
      console.error('API Error:', error.response.data);
      
      // Xử lý các mã lỗi cụ thể
      if (error.response.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('Network Error:', error.request);
    } else {
      // Lỗi khác
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Student Service (`src/services/studentService.js`)

```javascript
import api from './api';

const STUDENT_ENDPOINT = '/students';

export const studentService = {
  // Lấy tất cả sinh viên
  getAllStudents: async () => {
    try {
      const response = await api.get(STUDENT_ENDPOINT);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy sinh viên theo ID
  getStudentById: async (id) => {
    try {
      const response = await api.get(`${STUDENT_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo sinh viên mới
  createStudent: async (studentData) => {
    try {
      const response = await api.post(STUDENT_ENDPOINT, studentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật sinh viên
  updateStudent: async (id, studentData) => {
    try {
      const response = await api.put(`${STUDENT_ENDPOINT}/${id}`, studentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa sinh viên
  deleteStudent: async (id) => {
    try {
      const response = await api.delete(`${STUDENT_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tìm kiếm sinh viên
  searchStudents: async (query) => {
    try {
      const response = await api.get(`${STUDENT_ENDPOINT}/search`, {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default studentService;
```

### 3. Course Service (`src/services/courseService.js`)

```javascript
import api from './api';

const COURSE_ENDPOINT = '/courses';

export const courseService = {
  getAllCourses: async () => {
    const response = await api.get(COURSE_ENDPOINT);
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await api.get(`${COURSE_ENDPOINT}/${id}`);
    return response.data;
  },

  createCourse: async (courseData) => {
    const response = await api.post(COURSE_ENDPOINT, courseData);
    return response.data;
  },

  updateCourse: async (id, courseData) => {
    const response = await api.put(`${COURSE_ENDPOINT}/${id}`, courseData);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`${COURSE_ENDPOINT}/${id}`);
    return response.data;
  },
};

export default courseService;
```

### 4. Enrollment Service (`src/services/enrollmentService.js`)

```javascript
import api from './api';

const ENROLLMENT_ENDPOINT = '/enrollments';

export const enrollmentService = {
  getAllEnrollments: async () => {
    const response = await api.get(ENROLLMENT_ENDPOINT);
    return response.data;
  },

  getEnrollmentById: async (id) => {
    const response = await api.get(`${ENROLLMENT_ENDPOINT}/${id}`);
    return response.data;
  },

  createEnrollment: async (enrollmentData) => {
    const response = await api.post(ENROLLMENT_ENDPOINT, enrollmentData);
    return response.data;
  },

  updateEnrollment: async (id, enrollmentData) => {
    const response = await api.put(`${ENROLLMENT_ENDPOINT}/${id}`, enrollmentData);
    return response.data;
  },

  deleteEnrollment: async (id) => {
    const response = await api.delete(`${ENROLLMENT_ENDPOINT}/${id}`);
    return response.data;
  },
};

export default enrollmentService;
```

> **Lưu ý**: Các component UI (StudentList, StudentForm, CourseList, v.v.) nên được xây dựng sử dụng Tailwind CSS classes như đã hướng dẫn ở phần Styling. Tham khảo các ví dụ về buttons, forms, tables và layouts để tạo giao diện.

---

## 🔗 Tích Hợp Backend

### Kiểm Tra Kết Nối API

Trước khi phát triển, hãy kiểm tra kết nối với backend:

```javascript
// src/services/healthService.js
import api from './api';

export const checkApiConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ API Connection OK:', response.data);
    return { connected: true, data: response.data };
  } catch (error) {
    console.error('❌ API Connection Failed:', error.message);
    return { connected: false, error: error.message };
  }
};
```

### Custom Hook để Fetch Data

Tạo file `src/hooks/useApi.js`:

```javascript
import { useState, useEffect, useCallback } from 'react';

export const useApi = (apiFunction, dependencies = [], immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...params) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...params);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return { data, loading, error, execute, refetch: execute };
};
```

### Sử Dụng Hook trong Component

```javascript
import { useApi } from '@/hooks/useApi';
import studentService from '@/services/studentService';
import { toast } from 'react-toastify';

const StudentList = () => {
  const { data: students, loading, error, refetch } = useApi(
    studentService.getAllStudents, 
    [], 
    true
  );

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      try {
        await studentService.deleteStudent(id);
        toast.success('Xóa thành công!');
        refetch();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Không thể xóa');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-danger p-8">Lỗi: {error}</div>;
  }

  return (
    <div className="p-6">
      {students?.map(student => (
        <div key={student.id} className="card mb-4">
          <h3 className="text-xl font-bold">{student.firstName} {student.lastName}</h3>
          <p className="text-gray-600">{student.email}</p>
          <button 
            className="btn btn-danger mt-2"
            onClick={() => handleDelete(student.id)}
          >
            Xóa
          </button>
        </div>
      ))}
    </div>
  );
};
```

### Tài Liệu Chi Tiết

📚 Xem hướng dẫn đầy đủ về tích hợp API tại: **[API Integration Guide](./api-integration-guide.md)**

Bao gồm:
- Cấu hình CORS chi tiết
- API Endpoints mapping
- Xác thực & bảo mật (JWT)
- Error handling đồng bộ BE/FE
- Testing API integration

---

## 🔄 Routing

### Setup React Router (`src/App.jsx`)

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Home from './pages/Home';
import Students from './pages/Students';
import Courses from './pages/Courses';
import Enrollments from './pages/Enrollments';
import NotFound from './pages/NotFound';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/students" element={<Students />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/enrollments" element={<Enrollments />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
```

### Navbar Component (`src/components/common/Navbar.jsx`)

```javascript
import { NavLink } from 'react-router-dom';
import { FaGraduationCap, FaHome, FaUserGraduate, FaBook, FaClipboardList } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <FaGraduationCap className="brand-icon" />
          <span className="brand-text">Quản Lý Sinh Viên</span>
        </div>
        
        <ul className="navbar-menu">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaHome /> Trang Chủ
            </NavLink>
          </li>
          <li>
            <NavLink to="/students" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaUserGraduate /> Sinh Viên
            </NavLink>
          </li>
          <li>
            <NavLink to="/courses" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaBook /> Khóa Học
            </NavLink>
          </li>
          <li>
            <NavLink to="/enrollments" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaClipboardList /> Đăng Ký
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
```

---

## ▶️ Chạy Ứng Dụng

### Development Mode

```bash
# Chạy dev server
npm run dev

# Ứng dụng sẽ chạy tại http://localhost:3000
```

### Các Lệnh Khác

```bash
# Build production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 📦 Build Production

### Build Ứng Dụng

```bash
# Build
npm run build

# Output sẽ ở thư mục dist/
```

### Preview Build

```bash
# Preview production build locally
npm run preview
```

### Deploy

Sau khi build, bạn có thể deploy thư mục `dist/` lên:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop thư mục `dist/`
- **GitHub Pages**: Push thư mục `dist/` lên branch `gh-pages`
- **Firebase Hosting**: `firebase deploy`

---

## ✅ Best Practices

### 1. Component Organization

```javascript
// ✅ GOOD: Tách component nhỏ, tái sử dụng
const StudentCard = ({ student }) => (
  <div className="student-card">
    <h3>{student.firstName} {student.lastName}</h3>
    <p>{student.email}</p>
  </div>
);

// ❌ BAD: Component quá lớn, làm nhiều việc
```

### 2. State Management

```javascript
// ✅ GOOD: Sử dụng useState cho local state
const [students, setStudents] = useState([]);

// ✅ GOOD: Sử dụng useEffect đúng cách
useEffect(() => {
  fetchStudents();
}, []); // Empty dependency array

// ❌ BAD: Không có dependency array
useEffect(() => {
  fetchStudents();
}); // Sẽ chạy mỗi lần render
```

### 3. Error Handling

```javascript
// ✅ GOOD: Xử lý lỗi đầy đủ
try {
  const data = await studentService.getAllStudents();
  setStudents(data);
} catch (error) {
  toast.error('Không thể tải danh sách sinh viên!');
  console.error('Error:', error);
}

// ❌ BAD: Không xử lý lỗi
const data = await studentService.getAllStudents();
setStudents(data);
```

### 4. Code Organization

```javascript
// ✅ GOOD: Import có tổ chức
// React imports
import { useState, useEffect } from 'react';

// Third-party imports
import { toast } from 'react-toastify';
import { FaEdit } from 'react-icons/fa';

// Local imports
import studentService from '../../services/studentService';
import './StudentList.css';
```

### 5. Performance Optimization

```javascript
// ✅ GOOD: Sử dụng useMemo cho computed values
const filteredStudents = useMemo(() => {
  return students.filter(s => s.name.includes(searchTerm));
}, [students, searchTerm]);

// ✅ GOOD: Sử dụng useCallback cho functions
const handleDelete = useCallback((id) => {
  // ...
}, []);
```

---

## 🔧 Xử Lý Lỗi Thường Gặp

### Lỗi 1: CORS Error

**Lỗi:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Giải Pháp:**
1. Cấu hình proxy trong `vite.config.js`:
```javascript
server: {
  proxy: {
    '/api': 'http://localhost:8080'
  }
}
```

2. Hoặc enable CORS trong Spring Boot backend

### Lỗi 2: Module Not Found

**Lỗi:**
```
Cannot find module '@/components/StudentList'
```

**Giải Pháp:**
- Kiểm tra path alias trong `vite.config.js`
- Đảm bảo file tồn tại
- Restart dev server

### Lỗi 3: React Hook Rules

**Lỗi:**
```
React Hook "useState" is called conditionally
```

**Giải Pháp:**
- Hooks phải được gọi ở top level
- Không gọi hooks trong conditions, loops

### Lỗi 4: Network Request Failed

**Lỗi:**
```
Network Error / Request failed with status code 500
```

**Giải Pháp:**
- Kiểm tra backend đang chạy
- Kiểm tra API endpoint đúng
- Xem console log để debug

---

## 📚 Tài Nguyên Học Tập

### Documentation

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)

### Tutorials

- [React Tutorial](https://react.dev/learn)
- [JavaScript ES6+](https://javascript.info/)
- [CSS Tricks](https://css-tricks.com/)

### Tools

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Vite Plugin React](https://github.com/vitejs/vite-plugin-react)

---

## 🎯 Checklist Hoàn Thành

- [ ] Khởi tạo project với Vite
- [ ] Cài đặt dependencies cần thiết
- [ ] Setup API service với Axios
- [ ] Tạo Student CRUD components
- [ ] Tạo Course CRUD components
- [ ] Tạo Enrollment components
- [ ] Setup React Router
- [ ] Implement form validation
- [ ] Add error handling
- [ ] Add loading states
- [ ] Style components
- [ ] Test tất cả features
- [ ] Build production
- [ ] Deploy

---

**Được tạo với ❤️ sử dụng React + Vite**

*Cập nhật lần cuối: 31 tháng 12, 2025*
