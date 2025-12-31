# 📚 Hệ Thống Quản Lý Sinh Viên - Hướng Dẫn Đầy Đủ

## 📋 Mục Lục

- [Tổng Quan](#tổng-quan)
- [Tính Năng](#tính-năng)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cài Đặt & Thiết Lập](#cài-đặt--thiết-lập)
- [Cấu Hình Cơ Sở Dữ Liệu](#cấu-hình-cơ-sở-dữ-liệu)
- [Chạy Ứng Dụng](#chạy-ứng-dụng)
- [Tài Liệu API](#tài-liệu-api)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Xử Lý Lỗi Thường Gặp](#xử-lý-lỗi-thường-gặp)
- [Tích Hợp Frontend](#tích-hợp-frontend)
- [Đóng Góp](#đóng-góp)

---

## 🎯 Tổng Quan

**Hệ Thống Quản Lý Sinh Viên** là một ứng dụng Spring Boot toàn diện được thiết kế để quản lý thông tin sinh viên, khóa học, đăng ký học và phân công lớp học. Hệ thống cung cấp RESTful API để thực hiện các thao tác CRUD và quản lý mối quan hệ giữa sinh viên, khóa học và lớp học.

### Điểm Nổi Bật

- **Kiến Trúc Hiện Đại**: Xây dựng với Spring Boot 3.x và Spring Data JPA
- **RESTful API**: Các endpoint API rõ ràng và trực quan
- **Tích Hợp Cơ Sở Dữ Liệu**: MySQL database với JPA/Hibernate ORM
- **Xử Lý Lỗi**: Xử lý ngoại lệ và validation toàn diện
- **Sẵn Sàng Production**: Bao gồm logging, validation và error responses phù hợp

---

## ✨ Tính Năng

### Chức Năng Cốt Lõi

- ✅ **Quản Lý Sinh Viên**: Tạo, đọc, cập nhật và xóa hồ sơ sinh viên
- ✅ **Quản Lý Khóa Học**: Quản lý thông tin và phân công khóa học
- ✅ **Hệ Thống Đăng Ký**: Theo dõi đăng ký khóa học của sinh viên
- ✅ **Quản Lý Lớp Học**: Tổ chức sinh viên vào các lớp học
- ✅ **Kiểm Tra Dữ Liệu**: Validation đầu vào sử dụng Jakarta Bean Validation
- ✅ **Xử Lý Lỗi**: Custom exceptions và global error handling
- ✅ **JSON Serialization**: Xử lý đúng các tham chiếu vòng tròn

### Tính Năng Nâng Cao

- 🔍 **Tìm Kiếm & Lọc**: Tìm sinh viên theo nhiều tiêu chí
- 📊 **Quan Hệ**: Quan hệ nhiều-nhiều và một-nhiều
- 🛡️ **Validation**: Kiểm tra email, các trường bắt buộc
- 📝 **Logging**: Ghi log ứng dụng toàn diện
- 🔄 **Hỗ Trợ HATEOAS**: Hypermedia links cho API discoverability (tùy chọn)

---

## 🔐 Xác Thực & Phân Quyền (Authentication & Authorization)

### Tổng Quan Hệ Thống User

Hệ thống hỗ trợ **3 loại người dùng** với các quyền hạn khác nhau:

| Loại User | Mô Tả | Quyền Hạn |
|-----------|-------|-----------|
| **ADMIN** | Quản trị viên hệ thống | Toàn quyền: CRUD tất cả entities, quản lý users |
| **TEACHER** (Giáo Viên) | Giảng viên các khóa học | Quản lý khóa học, xem danh sách sinh viên, chấm điểm |
| **STUDENT** (Học Viên) | Sinh viên đăng ký học | Xem khóa học, đăng ký môn học, xem điểm |

### Database Schema

#### Bảng `users` - Người dùng

| Cột | Kiểu dữ liệu | Mô tả |
|-----|--------------|-------|
| id | BIGINT (PK) | ID tự tăng |
| username | VARCHAR(50) | Tên đăng nhập (unique) |
| email | VARCHAR(100) | Email (unique) |
| password | VARCHAR(255) | Mật khẩu đã mã hóa |
| full_name | VARCHAR(100) | Họ tên đầy đủ |
| phone | VARCHAR(20) | Số điện thoại |
| avatar_url | VARCHAR(500) | URL ảnh đại diện |
| is_active | BOOLEAN | Trạng thái hoạt động (default: true) |
| created_at | TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | Ngày cập nhật |

---

#### Bảng `roles` - Vai trò

| Cột | Kiểu dữ liệu | Mô tả |
|-----|--------------|-------|
| id | BIGINT (PK) | ID tự tăng |
| name | VARCHAR(50) | ROLE_ADMIN, ROLE_TEACHER, ROLE_STUDENT |
| description | VARCHAR(255) | Mô tả vai trò |

---

#### Bảng `user_roles` - Quan hệ User-Role (Many-to-Many)

| Cột | Kiểu dữ liệu | Mô tả |
|-----|--------------|-------|
| user_id | BIGINT (FK) | → users.id |
| role_id | BIGINT (FK) | → roles.id |

---

#### Bảng `teachers` - Thông tin Giáo viên

| Cột | Kiểu dữ liệu | Mô tả |
|-----|--------------|-------|
| id | BIGINT (PK) | ID tự tăng |
| user_id | BIGINT (FK, unique) | → users.id |
| employee_code | VARCHAR(20) | Mã nhân viên (unique) |
| department | VARCHAR(100) | Khoa/Bộ môn |
| specialization | VARCHAR(200) | Chuyên môn |
| hire_date | DATE | Ngày vào làm |

---

#### Bảng `students` - Thông tin Học viên

| Cột | Kiểu dữ liệu | Mô tả |
|-----|--------------|-------|
| id | BIGINT (PK) | ID tự tăng |
| user_id | BIGINT (FK, unique) | → users.id |
| student_code | VARCHAR(20) | Mã học viên (unique) |
| date_of_birth | DATE | Ngày sinh |
| gender | ENUM | 'MALE', 'FEMALE', 'OTHER' |
| address | VARCHAR(500) | Địa chỉ |
| enrollment_date | DATE | Ngày đăng ký học |

---

#### Bảng `courses` - Khóa học

| Cột | Kiểu dữ liệu | Mô tả |
|-----|--------------|-------|
| id | BIGINT (PK) | ID tự tăng |
| code | VARCHAR(20) | Mã khóa học (unique) |
| name | VARCHAR(200) | Tên khóa học |
| description | TEXT | Mô tả chi tiết |
| price | DECIMAL(12,2) | Giá tiền (VND) |
| duration | INT | Thời lượng (số buổi học) |
| level | ENUM | 'BEGINNER', 'INTERMEDIATE', 'ADVANCED' |
| thumbnail_url | VARCHAR(500) | Ảnh thumbnail |
| is_active | BOOLEAN | Trạng thái (default: true) |
| created_at | TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | Ngày cập nhật |

---

#### Bảng `classes` - Lớp học

| Cột | Kiểu dữ liệu | Mô tả |
|-----|--------------|-------|
| id | BIGINT (PK) | ID tự tăng |
| code | VARCHAR(20) | Mã lớp học (unique) |
| name | VARCHAR(200) | Tên lớp (VD: "Java Spring - Lớp 1") |
| course_id | BIGINT (FK) | → courses.id |
| teacher_id | BIGINT (FK) | → teachers.id (Giáo viên phụ trách) |
| max_students | INT | Sỉ số tối đa (default: 30) |
| current_students | INT | Số học viên hiện tại (default: 0) |
| room | VARCHAR(50) | Phòng học |
| schedule | VARCHAR(200) | Lịch học (VD: "T2, T4, T6 - 19:00-21:00") |
| start_date | DATE | Ngày bắt đầu |
| end_date | DATE | Ngày kết thúc |
| status | ENUM | 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED' |
| is_registration_open | BOOLEAN | Cho phép đăng ký (default: true) |
| created_at | TIMESTAMP | Ngày tạo |

**Rules:**
- `current_students <= max_students`
- Khi học viên đăng ký → tự động tăng `current_students`
- Khi `current_students >= max_students` → `is_registration_open = false`

---

#### Bảng `enrollments` - Đăng ký học

| Cột | Kiểu dữ liệu | Mô tả |
|-----|--------------|-------|
| id | BIGINT (PK) | ID tự tăng |
| student_id | BIGINT (FK) | → students.id |
| class_id | BIGINT (FK) | → classes.id |
| enrollment_date | TIMESTAMP | Ngày đăng ký |
| status | ENUM | 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED' |
| note | VARCHAR(500) | Ghi chú |

**Constraints:**
- UNIQUE(student_id, class_id) - Mỗi học viên chỉ đăng ký 1 lần/lớp

---

#### Bảng `attendance` - Điểm danh

| Cột | Kiểu dữ liệu | Mô tả |
|-----|--------------|-------|
| id | BIGINT (PK) | ID tự tăng |
| class_id | BIGINT (FK) | → classes.id |
| student_id | BIGINT (FK) | → students.id |
| session_date | DATE | Ngày buổi học |
| session_number | INT | Buổi học thứ mấy |
| status | ENUM | 'PRESENT', 'ABSENT', 'EXCUSED' (Có mặt/Vắng/Có phép) |
| note | VARCHAR(255) | Ghi chú |
| marked_by | BIGINT (FK) | → users.id (Teacher đã điểm danh) |
| marked_at | TIMESTAMP | Thời gian điểm danh |

**Constraints:**
- UNIQUE(class_id, student_id, session_date) - Mỗi học viên chỉ điểm danh 1 lần/buổi

---

#### Bảng `grades` - Điểm số

| Cột | Kiểu dữ liệu | Mô tả |
|-----|--------------|-------|
| id | BIGINT (PK) | ID tự tăng |
| enrollment_id | BIGINT (FK) | → enrollments.id |
| attendance_score | DECIMAL(4,2) | Điểm chuyên cần (0-10) |
| midterm_score | DECIMAL(4,2) | Điểm giữa kỳ (0-10) |
| final_score | DECIMAL(4,2) | Điểm cuối kỳ (0-10) |
| total_score | DECIMAL(4,2) | Điểm tổng kết |
| comment | TEXT | Nhận xét của giáo viên |
| graded_by | BIGINT (FK) | → users.id (Teacher chấm điểm) |
| graded_at | TIMESTAMP | Thời gian chấm điểm |
| updated_at | TIMESTAMP | Cập nhật lần cuối |

**Rules:**
- Tất cả điểm trong khoảng 0-10
- `total_score` có thể tính tự động: `(attendance_score * 0.1) + (midterm_score * 0.3) + (final_score * 0.6)`

---

#### Bảng `payments` - Thanh toán học phí

| Cột | Kiểu dữ liệu | Mô tả |
|-----|--------------|-------|
| id | BIGINT (PK) | ID tự tăng |
| enrollment_id | BIGINT (FK) | → enrollments.id |
| amount | DECIMAL(12,2) | Số tiền (VND) |
| payment_date | TIMESTAMP | Ngày thanh toán |
| payment_method | ENUM | 'CASH', 'BANK_TRANSFER', 'CREDIT_CARD' |
| status | ENUM | 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED' |
| transaction_id | VARCHAR(100) | Mã giao dịch |
| note | VARCHAR(500) | Ghi chú |
| created_by | BIGINT (FK) | → users.id |

---

### Sơ Đồ Quan Hệ (ERD Summary)

```
users ──────┬──── user_roles ──── roles
            │
            ├──── teachers ─────── classes ─────┬──── enrollments ──── grades
            │         │                         │         │
            │         └─────────────────────────┘         │
            │                                             │
            └──── students ───────────────────────────────┴──── attendance
                                                          │
                                                          └──── payments
```

**Quan hệ chính:**
- `users` 1:1 `teachers` hoặc `students`
- `courses` 1:N `classes`
- `teachers` 1:N `classes`
- `students` N:M `classes` (qua `enrollments`)
- `enrollments` 1:1 `grades`
- `enrollments` 1:N `payments`
- `classes` + `students` → `attendance`

---

### Tính Năng Authentication

#### 1. Đăng nhập (Login)
- **Endpoint**: `POST /api/auth/login`
- **Input**: username, password
- **Output**: JWT Token + thông tin user + danh sách roles
- **Mô tả**: Xác thực người dùng và trả về token

#### 2. Đăng ký (Register)
- **Endpoint**: `POST /api/auth/register`
- **Input**: username, email, password, fullName, phone, roles[]
- **Output**: Thông báo đăng ký thành công
- **Mô tả**: Tạo tài khoản mới, mặc định role là STUDENT

#### 3. Đăng xuất (Logout)
- **Endpoint**: `POST /api/auth/logout`
- **Input**: JWT Token (header)
- **Output**: Thông báo đăng xuất thành công
- **Mô tả**: Hủy phiên đăng nhập

#### 4. Lấy thông tin User hiện tại
- **Endpoint**: `GET /api/auth/me`
- **Input**: JWT Token (header)
- **Output**: Thông tin user + roles
- **Mô tả**: Trả về thông tin của user đang đăng nhập

### Phân Quyền API Endpoints

| URL Pattern | Roles được phép | Mô tả |
|-------------|-----------------|-------|
| `/api/auth/**` | Public | Không cần đăng nhập |
| `/api/admin/**` | ADMIN | Chỉ quản trị viên |
| `/api/teacher/**` | ADMIN, TEACHER | Admin và giáo viên |
| `/api/student/**` | ADMIN, TEACHER, STUDENT | Tất cả user đăng nhập |
| `/api/**` (còn lại) | Authenticated | Cần đăng nhập |

### Công Nghệ Sử Dụng

- **Spring Security**: Framework bảo mật
- **JWT (JSON Web Token)**: Xác thực stateless
- **BCrypt**: Mã hóa mật khẩu

---

## �🛠️ Công Nghệ Sử Dụng

### Framework Backend

- **Spring Boot** 3.x - Framework ứng dụng
- **Spring Data JPA** - Lớp persistence dữ liệu
- **Hibernate** - Triển khai ORM
- **Spring Web** - RESTful web services

### Cơ Sở Dữ Liệu

- **MySQL** 8.x - Cơ sở dữ liệu quan hệ
- **H2 Database** - Cơ sở dữ liệu in-memory cho testing (tùy chọn)

### Công Cụ Build

- **Maven** - Quản lý dependency và build automation
- **Java** 17+ - Ngôn ngữ lập trình

### Thư Viện Bổ Sung

- **Lombok** - Giảm boilerplate code
- **Jakarta Validation** - Bean validation
- **Jackson** - Xử lý JSON

---

## 📦 Yêu Cầu Hệ Thống

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

- ☑️ **Java Development Kit (JDK)** 17 trở lên
- ☑️ **Maven** 3.6+ hoặc sử dụng Maven wrapper đi kèm
- ☑️ **MySQL** 8.0+ database server
- ☑️ **IDE** (Khuyến nghị IntelliJ IDEA, Eclipse, hoặc VS Code)
- ☑️ **Git** (để quản lý phiên bản)

### Kiểm Tra Cài Đặt

```bash
# Kiểm tra phiên bản Java
java -version

# Kiểm tra phiên bản Maven
mvn -version

# Kiểm tra phiên bản MySQL
mysql --version
```

---

## 🚀 Cài Đặt & Thiết Lập

### Bước 1: Clone Repository

```bash
git clone <repository-url>
cd du_an_cuoi_khoa
```

### Bước 2: Cấu Hình Cơ Sở Dữ Liệu

Tạo cơ sở dữ liệu MySQL cho ứng dụng:

```sql
CREATE DATABASE student_management;
CREATE USER 'student_user'@'localhost' IDENTIFIED BY 'mat_khau_cua_ban';
GRANT ALL PRIVILEGES ON student_management.* TO 'student_user'@'localhost';
FLUSH PRIVILEGES;
```

### Bước 3: Cập Nhật Application Properties

Chỉnh sửa file `src/main/resources/application.properties`:

```properties
# Cấu Hình Database
spring.datasource.url=jdbc:mysql://localhost:3306/student_management
spring.datasource.username=student_user
spring.datasource.password=mat_khau_cua_ban
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Cấu Hình JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# Cấu Hình Server
server.port=8080

# Cấu Hình Logging
logging.level.org.springframework=INFO
logging.level.com.yourpackage=DEBUG
```

### Bước 4: Build Dự Án

```bash
# Sử dụng Maven
mvn clean install

# Hoặc sử dụng Maven Wrapper
./mvnw clean install
```

---

## 💾 Cấu Hình Cơ Sở Dữ Liệu

### Tổng Quan Schema

Ứng dụng sử dụng các entity chính sau:

- **Student**: Thông tin sinh viên (id, tên, email, số điện thoại, v.v.)
- **Course**: Chi tiết khóa học (id, tên, tín chỉ, mô tả)
- **Enrollment**: Quan hệ Sinh viên-Khóa học (ngày đăng ký, điểm)
- **Classroom**: Thông tin lớp học (id, tên, sức chứa)

### Tự Động Tạo Schema

Ứng dụng được cấu hình với `spring.jpa.hibernate.ddl-auto=update`, tự động tạo/cập nhật bảng dựa trên định nghĩa entity.

### Tạo Schema Thủ Công

Nếu bạn muốn kiểm soát thủ công, đặt `spring.jpa.hibernate.ddl-auto=none` và chạy:

```sql
-- Xem các script migration trong src/main/resources/db/migration/
```

---

## ▶️ Chạy Ứng Dụng

### Sử Dụng Maven

```bash
mvn spring-boot:run
```

### Sử Dụng Maven Wrapper

```bash
./mvnw spring-boot:run
```

### Sử Dụng File JAR

```bash
# Build JAR
mvn clean package

# Chạy JAR
java -jar target/student-management-0.0.1-SNAPSHOT.jar
```

### Kiểm Tra Ứng Dụng Đang Chạy

Mở trình duyệt và truy cập:

```
http://localhost:8080
```

Hoặc test API:

```bash
curl http://localhost:8080/api/students
```

---

## 📡 Tài Liệu API

### Endpoints Sinh Viên

#### Lấy Tất Cả Sinh Viên

```http
GET /api/students
```

**Response:**
```json
[
  {
    "id": 1,
    "firstName": "Nguyễn Văn",
    "lastName": "An",
    "email": "nguyenvanan@example.com",
    "phone": "0123456789",
    "dateOfBirth": "2000-01-15"
  }
]
```

#### Lấy Sinh Viên Theo ID

```http
GET /api/students/{id}
```

#### Tạo Sinh Viên Mới

```http
POST /api/students
Content-Type: application/json

{
  "firstName": "Trần Thị",
  "lastName": "Bình",
  "email": "tranthibinh@example.com",
  "phone": "0987654321",
  "dateOfBirth": "2001-05-20"
}
```

#### Cập Nhật Sinh Viên

```http
PUT /api/students/{id}
Content-Type: application/json

{
  "firstName": "Trần Thị",
  "lastName": "Bình Cập Nhật",
  "email": "tranthibinh.updated@example.com"
}
```

#### Xóa Sinh Viên

```http
DELETE /api/students/{id}
```

### Endpoints Khóa Học

```http
GET    /api/courses          # Lấy tất cả khóa học
GET    /api/courses/{id}     # Lấy khóa học theo ID
POST   /api/courses          # Tạo khóa học mới
PUT    /api/courses/{id}     # Cập nhật khóa học
DELETE /api/courses/{id}     # Xóa khóa học
```

### Endpoints Đăng Ký

```http
GET    /api/enrollments           # Lấy tất cả đăng ký
POST   /api/enrollments           # Đăng ký sinh viên vào khóa học
DELETE /api/enrollments/{id}      # Xóa đăng ký
```

---

## 📁 Cấu Trúc Dự Án

```
du_an_cuoi_khoa/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── studentmanagement/
│   │   │               ├── controller/
│   │   │               │   ├── StudentController.java
│   │   │               │   ├── CourseController.java
│   │   │               │   └── EnrollmentController.java
│   │   │               ├── model/
│   │   │               │   ├── Student.java
│   │   │               │   ├── Course.java
│   │   │               │   ├── Enrollment.java
│   │   │               │   └── Classroom.java
│   │   │               ├── repository/
│   │   │               │   ├── StudentRepository.java
│   │   │               │   ├── CourseRepository.java
│   │   │               │   └── EnrollmentRepository.java
│   │   │               ├── service/
│   │   │               │   ├── StudentService.java
│   │   │               │   ├── CourseService.java
│   │   │               │   └── EnrollmentService.java
│   │   │               ├── exception/
│   │   │               │   ├── StudentNotFoundException.java
│   │   │               │   ├── DuplicateEmailException.java
│   │   │               │   ├── ErrorResponse.java
│   │   │               │   └── GlobalExceptionHandler.java
│   │   │               └── StudentManagementApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── data.sql (dữ liệu mẫu tùy chọn)
│   └── test/
│       └── java/
│           └── com/
│               └── example/
│                   └── studentmanagement/
│                       └── StudentManagementApplicationTests.java
├── pom.xml
├── guide.md
└── README.md
```

---

## 🔧 Xử Lý Lỗi Thường Gặp

### Lỗi 1: Kết Nối Database Thất Bại

**Lỗi:**
```
com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure
```

**Giải Pháp:**
- Kiểm tra MySQL server đang chạy
- Kiểm tra thông tin đăng nhập trong `application.properties`
- Đảm bảo database tồn tại: `CREATE DATABASE student_management;`

### Lỗi 2: Port Đã Được Sử Dụng

**Lỗi:**
```
Web server failed to start. Port 8080 was already in use.
```

**Giải Pháp:**
- Thay đổi port trong `application.properties`: `server.port=8081`
- Hoặc dừng process đang sử dụng port 8080

### Lỗi 3: Lỗi JSON Serialization

**Lỗi:**
```
Could not write JSON: Infinite recursion (StackOverflowError)
```

**Giải Pháp:**
- Thêm `@JsonIgnoreProperties` vào các quan hệ entity
- Đã được triển khai trong dự án

### Lỗi 4: Lỗi Validation

**Lỗi:**
```
MethodArgumentNotValidException: Validation failed
```

**Giải Pháp:**
- Đảm bảo tất cả các trường bắt buộc được cung cấp
- Kiểm tra định dạng email hợp lệ
- Xác minh kiểu dữ liệu khớp với định nghĩa entity

---

## 🔗 Tích Hợp Frontend

### Cấu Hình CORS

Để frontend có thể gọi API từ backend, cần cấu hình CORS. Tạo file `src/main/java/com/example/studentmanagement/config/CorsConfig.java`:

```java
package com.example.studentmanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        
        // Cho phép origins từ frontend
        corsConfiguration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173"
        ));
        
        // Cho phép các HTTP methods
        corsConfiguration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // Cho phép các headers
        corsConfiguration.setAllowedHeaders(Arrays.asList("*"));
        corsConfiguration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", corsConfiguration);
        
        return new CorsFilter(source);
    }
}
```

### Health Check Endpoint

Thêm endpoint để kiểm tra kết nối từ frontend:

```java
@RestController
@RequestMapping("/api")
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(health);
    }
}
```

### Tài Liệu Chi Tiết

📚 Xem hướng dẫn đầy đủ về tích hợp API tại: **[API Integration Guide](./api-integration-guide.md)**

---

## 🤝 Đóng Góp

### Quy Trình Phát Triển

1. **Fork** repository
2. **Tạo** nhánh tính năng: `git checkout -b feature/tinh-nang-tuyet-voi`
3. **Commit** thay đổi: `git commit -m 'Thêm tính năng tuyệt vời'`
4. **Push** lên nhánh: `git push origin feature/tinh-nang-tuyet-voi`
5. **Mở** Pull Request

### Tiêu Chuẩn Code

- Tuân theo quy ước đặt tên Java
- Viết commit messages có ý nghĩa
- Thêm comments cho logic phức tạp
- Bao gồm unit tests cho tính năng mới
- Cập nhật tài liệu khi cần thiết

---

## 📞 Hỗ Trợ & Liên Hệ

Để đặt câu hỏi, báo lỗi hoặc đề xuất:

- 📧 **Email**: support@example.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 **Tài Liệu**: [Wiki](https://github.com/your-repo/wiki)

---

## 📄 Giấy Phép

Dự án này được cấp phép theo MIT License - xem file LICENSE để biết chi tiết.

---

## 🎓 Tài Nguyên Bổ Sung

### Tài Liệu Học Tập

- [Tài Liệu Spring Boot](https://spring.io/projects/spring-boot)
- [Hướng Dẫn Spring Data JPA](https://spring.io/guides/gs/accessing-data-jpa/)
- [Tài Liệu MySQL](https://dev.mysql.com/doc/)
- [RESTful API Best Practices](https://restfulapi.net/)

### Dự Án Liên Quan

- [Spring Boot Examples](https://github.com/spring-projects/spring-boot/tree/main/spring-boot-samples)
- [JPA Best Practices](https://vladmihalcea.com/tutorials/hibernate/)

---

**Được tạo với ❤️ sử dụng Spring Boot**

*Cập nhật lần cuối: 31 tháng 12, 2025*