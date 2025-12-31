# 🔗 Hướng Dẫn Tích Hợp API - Backend & Frontend

## 📋 Mục Lục

- [Tổng Quan Kiến Trúc](#tổng-quan-kiến-trúc)
- [Cấu Hình CORS Backend](#cấu-hình-cors-backend)
- [Cấu Hình Frontend](#cấu-hình-frontend)
- [API Endpoints Mapping](#api-endpoints-mapping)
- [Xử Lý Request/Response](#xử-lý-requestresponse)
- [Xác Thực & Bảo Mật](#xác-thực--bảo-mật)
- [Xử Lý Lỗi Đồng Bộ](#xử-lý-lỗi-đồng-bộ)
- [Testing API Integration](#testing-api-integration)
- [Checklist Triển Khai](#checklist-triển-khai)

---

## 🏗️ Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │          React Frontend (Vite - Port 3000)                  │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │ │
│  │  │  Components │  │   Services  │  │     Axios Client    │  │ │
│  │  │  (UI/UX)    │─▶│  (API Call) │─▶│  (HTTP Requests)    │  │ │
│  │  └─────────────┘  └─────────────┘  └──────────┬──────────┘  │ │
│  └───────────────────────────────────────────────┼─────────────┘ │
└──────────────────────────────────────────────────┼───────────────┘
                                                   │
                                          HTTP/HTTPS Requests
                                          (REST API - JSON)
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER (Backend)                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │       Spring Boot Backend (Port 8080)                       │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │ │
│  │  │ Controllers │◀─│  Services   │◀─│   Repositories      │  │ │
│  │  │ (REST API)  │  │ (Business)  │  │   (Database)        │  │ │
│  │  └─────────────┘  └─────────────┘  └──────────┬──────────┘  │ │
│  └───────────────────────────────────────────────┼─────────────┘ │
│                                                  │               │
│  ┌───────────────────────────────────────────────▼─────────────┐ │
│  │                    MySQL Database                           │ │
│  │        (student_management - Port 3306)                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Ports Mặc Định

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 3000 | http://localhost:3000 |
| Backend (Spring Boot) | 8080 | http://localhost:8080 |
| MySQL Database | 3306 | localhost:3306 |

---

## 🔧 Cấu Hình CORS Backend

### 1. Tạo CORS Configuration Class

Tạo file `src/main/java/com/example/studentmanagement/config/CorsConfig.java`:

```java
package com.example.studentmanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        
        // Cho phép origins từ frontend
        corsConfiguration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",      // Vite dev server
            "http://localhost:5173",      // Vite default port
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173"
        ));
        
        // Cho phép các HTTP methods
        corsConfiguration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // Cho phép các headers
        corsConfiguration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With"
        ));
        
        // Cho phép credentials (cookies, authorization headers)
        corsConfiguration.setAllowCredentials(true);
        
        // Expose headers cho frontend có thể đọc
        corsConfiguration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Disposition"
        ));
        
        // Cache preflight request trong 1 giờ
        corsConfiguration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", corsConfiguration);
        
        return new CorsFilter(source);
    }
}
```

### 2. Hoặc Sử Dụng @CrossOrigin Annotation

Thêm trực tiếp vào Controller:

```java
package com.example.studentmanagement.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class StudentController {
    
    // ... các endpoints
}
```

### 3. Cấu Hình trong application.properties

```properties
# CORS Configuration (nếu dùng với WebMvcConfigurer)
cors.allowed-origins=http://localhost:3000,http://localhost:5173
cors.allowed-methods=GET,POST,PUT,DELETE,PATCH,OPTIONS
cors.allowed-headers=*
cors.allow-credentials=true
cors.max-age=3600
```

### 4. WebMvcConfigurer (Cách thay thế)

```java
package com.example.studentmanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

---

## 🖥️ Cấu Hình Frontend

### 1. Biến Môi Trường (`.env`)

```env
# Development
VITE_API_BASE_URL=http://localhost:8080/api

# Production (thay đổi khi deploy)
# VITE_API_BASE_URL=https://api.yourdomain.com/api

# App Configuration
VITE_APP_NAME=Student Management System
VITE_APP_VERSION=1.0.0
```

### 2. API Service Configuration (`src/services/api.js`)

```javascript
import axios from 'axios';

// Lấy base URL từ environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Gửi cookies nếu có
});

// Request Interceptor - Thêm token và logging
api.interceptors.request.use(
  (config) => {
    // Thêm Authorization token nếu có
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request trong development
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Xử lý response và errors
api.interceptors.response.use(
  (response) => {
    // Log response trong development
    if (import.meta.env.DEV) {
      console.log(`📥 Response from ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    // Xử lý các loại lỗi
    if (error.response) {
      // Server trả về response với status code lỗi
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('Bad Request:', data.message || 'Dữ liệu không hợp lệ');
          break;
        case 401:
          console.error('Unauthorized:', 'Phiên đăng nhập hết hạn');
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden:', 'Không có quyền truy cập');
          break;
        case 404:
          console.error('Not Found:', data.message || 'Không tìm thấy tài nguyên');
          break;
        case 409:
          console.error('Conflict:', data.message || 'Dữ liệu bị trùng lặp');
          break;
        case 500:
          console.error('Server Error:', 'Lỗi máy chủ, vui lòng thử lại sau');
          break;
        default:
          console.error(`Error ${status}:`, data.message || 'Có lỗi xảy ra');
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('Network Error:', 'Không thể kết nối đến server');
    } else {
      // Lỗi khi setup request
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### 3. Vite Proxy Configuration (`vite.config.js`)

Dùng proxy để tránh CORS trong development:

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
      '@services': path.resolve(__dirname, './src/services'),
      '@pages': path.resolve(__dirname, './src/pages'),
    },
  },
  server: {
    port: 3000,
    // Proxy API requests đến backend
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Rewrite path nếu cần
        // rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`🔄 Proxying: ${req.method} ${req.url} -> ${options.target}${req.url}`);
          });
        },
      },
    },
  },
})
```

> **Lưu ý**: Khi sử dụng proxy, API base URL trong `.env` nên để trống hoặc chỉ là `/api`:
> ```env
> VITE_API_BASE_URL=/api
> ```

---

## 📡 API Endpoints Mapping

### 🔐 Authentication APIs

| Method | Endpoint | Mô tả | Request | Response |
|--------|----------|-------|---------|----------|
| POST | `/api/auth/login` | Đăng nhập | `{username, password}` | `{accessToken, user}` |
| POST | `/api/auth/register` | Đăng ký | `{username, email, password, fullName, phone, roles[]}` | `{message}` |
| POST | `/api/auth/logout` | Đăng xuất | - | `{message}` |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại | - | `{id, username, email, fullName, roles[]}` |
| PUT | `/api/auth/profile` | Cập nhật thông tin cá nhân | `{fullName, phone, avatarUrl}` | `{user}` |
| PUT | `/api/auth/change-password` | Đổi mật khẩu | `{oldPassword, newPassword}` | `{message}` |

---

### 👑 Admin APIs (`/api/admin/*`)

#### Quản lý Users

| Method | Endpoint | Mô tả | Request | Response |
|--------|----------|-------|---------|----------|
| GET | `/api/admin/users` | Danh sách users (có phân trang, lọc) | `?page=0&size=10&role=STUDENT` | `Page<User>` |
| GET | `/api/admin/users/{id}` | Chi tiết user | - | `User` |
| POST | `/api/admin/users` | Tạo user mới | `{username, email, password, fullName, roles[]}` | `User` |
| PUT | `/api/admin/users/{id}` | Cập nhật user | `{fullName, phone, isActive}` | `User` |
| PATCH | `/api/admin/users/{id}/status` | Active/Deactive user | `{isActive: boolean}` | `User` |
| POST | `/api/admin/users/{id}/reset-password` | Reset mật khẩu | - | `{newPassword}` |

#### Quản lý Courses (Khóa học)

| Method | Endpoint | Mô tả | Request | Response |
|--------|----------|-------|---------|----------|
| GET | `/api/admin/courses` | Danh sách khóa học | `?page=0&size=10&isActive=true` | `Page<Course>` |
| GET | `/api/admin/courses/{id}` | Chi tiết khóa học | - | `Course` |
| POST | `/api/admin/courses` | Tạo khóa học mới | `{code, name, description, price, duration, level}` | `Course` |
| PUT | `/api/admin/courses/{id}` | Cập nhật khóa học | `{name, description, price, ...}` | `Course` |
| PATCH | `/api/admin/courses/{id}/status` | Active/Deactive khóa học | `{isActive: boolean}` | `Course` |

#### Quản lý Classes (Lớp học)

| Method | Endpoint | Mô tả | Request | Response |
|--------|----------|-------|---------|----------|
| GET | `/api/admin/classes` | Danh sách lớp học | `?courseId=1&status=OPEN` | `Page<Class>` |
| GET | `/api/admin/classes/{id}` | Chi tiết lớp học | - | `Class` |
| POST | `/api/admin/classes` | Tạo lớp học mới | `{courseId, teacherId, maxStudents, room, schedule, startDate}` | `Class` |
| PUT | `/api/admin/classes/{id}` | Cập nhật lớp học | `{teacherId, room, schedule, ...}` | `Class` |
| PATCH | `/api/admin/classes/{id}/registration` | Đóng/Mở đăng ký | `{isRegistrationOpen: boolean}` | `Class` |
| GET | `/api/admin/classes/{id}/students` | Danh sách học viên trong lớp | - | `Student[]` |

#### Thống kê & Báo cáo

| Method | Endpoint | Mô tả | Request | Response |
|--------|----------|-------|---------|----------|
| GET | `/api/admin/dashboard/stats` | Thống kê tổng quan | - | `{totalStudents, totalTeachers, totalCourses, totalClasses}` |
| GET | `/api/admin/reports/revenue` | Doanh thu theo thời gian | `?from=2025-01-01&to=2025-12-31` | `{monthly: [], total}` |
| GET | `/api/admin/reports/enrollments` | Thống kê đăng ký | `?from=&to=` | `EnrollmentStats[]` |
| GET | `/api/admin/reports/full-classes` | Lớp đã đầy sỉ số | - | `Class[]` |

---

### 👨‍🏫 Teacher APIs (`/api/teacher/*`)

| Method | Endpoint | Mô tả | Request | Response |
|--------|----------|-------|---------|----------|
| GET | `/api/teacher/dashboard` | Dashboard giáo viên | - | `{todayClasses, weekSchedule, totalStudents}` |
| GET | `/api/teacher/classes` | Danh sách lớp đang dạy | - | `Class[]` |
| GET | `/api/teacher/classes/{id}` | Chi tiết lớp đang dạy | - | `Class + students[]` |
| GET | `/api/teacher/classes/{id}/students` | Danh sách học viên của lớp | - | `Student[]` |

#### Điểm danh (Attendance)

| Method | Endpoint | Mô tả | Request | Response |
|--------|----------|-------|---------|----------|
| GET | `/api/teacher/classes/{classId}/attendance` | Lịch sử điểm danh | `?date=2025-01-15` | `Attendance[]` |
| POST | `/api/teacher/classes/{classId}/attendance` | Tạo điểm danh buổi mới | `{sessionDate, sessionNumber, attendances: [{studentId, status, note}]}` | `Attendance[]` |
| PUT | `/api/teacher/attendance/{id}` | Sửa điểm danh | `{status, note}` | `Attendance` |

#### Chấm điểm (Grades)

| Method | Endpoint | Mô tả | Request | Response |
|--------|----------|-------|---------|----------|
| GET | `/api/teacher/classes/{classId}/grades` | Bảng điểm lớp | - | `Grade[]` |
| POST | `/api/teacher/grades` | Nhập điểm cho học viên | `{enrollmentId, attendanceScore, midtermScore, finalScore, comment}` | `Grade` |
| PUT | `/api/teacher/grades/{id}` | Sửa điểm | `{attendanceScore, midtermScore, finalScore, comment}` | `Grade` |

---

### 👨‍🎓 Student APIs (`/api/student/*`)

| Method | Endpoint | Mô tả | Request | Response |
|--------|----------|-------|---------|----------|
| GET | `/api/student/dashboard` | Dashboard học viên | - | `{enrolledClasses, upcomingSchedule}` |

#### Khóa học & Đăng ký

| Method | Endpoint | Mô tả | Request | Response |
|--------|----------|-------|---------|----------|
| GET | `/api/courses` | Danh sách khóa học (Public) | `?level=BEGINNER&priceMin=&priceMax=` | `Course[]` |
| GET | `/api/courses/{id}` | Chi tiết khóa học | - | `Course + classes[]` |
| GET | `/api/courses/{courseId}/classes` | Danh sách lớp đang mở | `?isRegistrationOpen=true` | `Class[]` |
| POST | `/api/student/enroll` | Đăng ký vào lớp | `{classId}` | `Enrollment` |
| DELETE | `/api/student/enrollments/{id}` | Hủy đăng ký | - | `{message}` |

#### Thời khóa biểu & Kết quả

| Method | Endpoint | Mô tả | Request | Response |
|--------|----------|-------|---------|----------|
| GET | `/api/student/schedule` | Thời khóa biểu cá nhân | `?week=current` | `Schedule[]` |
| GET | `/api/student/enrollments` | Danh sách lớp đã đăng ký | - | `Enrollment[]` |
| GET | `/api/student/grades` | Kết quả học tập | - | `Grade[]` |
| GET | `/api/student/attendance` | Lịch sử điểm danh | `?classId=1` | `Attendance[]` |
| GET | `/api/student/payments` | Lịch sử thanh toán | - | `Payment[]` |

---

### 📝 Data Models (Request/Response)

#### Course

```json
{
  "id": 1,
  "code": "JAVA001",
  "name": "Lập Trình Java Spring Boot",
  "description": "Khóa học lập trình Java từ cơ bản đến nâng cao",
  "price": 5000000,
  "duration": 30,
  "level": "INTERMEDIATE",
  "thumbnailUrl": "/images/java.jpg",
  "isActive": true
}
```

#### Class

```json
{
  "id": 1,
  "code": "JAVA001-L1",
  "name": "Java Spring Boot - Lớp 1",
  "courseId": 1,
  "teacherId": 5,
  "teacherName": "Nguyễn Văn A",
  "maxStudents": 30,
  "currentStudents": 25,
  "room": "P.301",
  "schedule": "T2, T4, T6 - 19:00-21:00",
  "startDate": "2025-02-01",
  "endDate": "2025-04-30",
  "status": "OPEN",
  "isRegistrationOpen": true
}
```

#### Enrollment

```json
{
  "id": 1,
  "studentId": 10,
  "classId": 1,
  "className": "Java Spring Boot - Lớp 1",
  "enrollmentDate": "2025-01-15T10:30:00",
  "status": "CONFIRMED"
}
```

#### Attendance

```json
{
  "id": 1,
  "classId": 1,
  "studentId": 10,
  "sessionDate": "2025-02-03",
  "sessionNumber": 1,
  "status": "PRESENT",
  "note": ""
}
```

#### Grade

```json
{
  "id": 1,
  "enrollmentId": 1,
  "studentName": "Trần Văn B",
  "className": "Java Spring Boot - Lớp 1",
  "attendanceScore": 9.0,
  "midtermScore": 8.5,
  "finalScore": 8.0,
  "totalScore": 8.25,
  "comment": "Học tập tích cực, cần cải thiện phần backend",
  "gradedAt": "2025-04-25T14:00:00"
}
```

---

## 🔄 Xử Lý Request/Response

### 1. Custom Hook để Fetch Data

Tạo file `src/hooks/useApi.js`:

```javascript
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook để fetch data từ API
 * @param {Function} apiFunction - Hàm gọi API
 * @param {Array} dependencies - Dependencies để trigger refetch
 * @param {boolean} immediate - Có fetch ngay lập tức không
 */
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
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
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

  const refetch = () => execute();

  return { data, loading, error, execute, refetch };
};

export default useApi;
```

### 2. Sử Dụng Hook trong Component

```javascript
import { useApi } from '@/hooks/useApi';
import studentService from '@/services/studentService';
import { toast } from 'react-toastify';

const StudentList = () => {
  const { 
    data: students, 
    loading, 
    error, 
    refetch 
  } = useApi(studentService.getAllStudents, [], true);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      try {
        await studentService.deleteStudent(id);
        toast.success('Xóa thành công!');
        refetch(); // Refresh danh sách
      } catch (err) {
        toast.error(err.response?.data?.message || 'Không thể xóa');
      }
    }
  };

  if (loading) return <div className="flex justify-center p-8">Đang tải...</div>;
  if (error) return <div className="text-danger p-8">Lỗi: {error}</div>;

  return (
    <div className="p-6">
      {students?.map(student => (
        <div key={student.id} className="card mb-4">
          <h3>{student.firstName} {student.lastName}</h3>
          <p>{student.email}</p>
          <button 
            className="btn btn-danger"
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

### 3. Form Submission với Validation

```javascript
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import studentService from '@/services/studentService';

const StudentForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await studentService.createStudent(data);
      toast.success('Thêm sinh viên thành công!');
      reset();
      onSuccess?.();
    } catch (error) {
      // Xử lý validation errors từ backend
      if (error.response?.status === 400) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          Object.keys(validationErrors).forEach(field => {
            toast.error(`${field}: ${validationErrors[field]}`);
          });
        } else {
          toast.error(error.response.data.message || 'Dữ liệu không hợp lệ');
        }
      } else if (error.response?.status === 409) {
        toast.error('Email đã tồn tại trong hệ thống');
      } else {
        toast.error('Có lỗi xảy ra, vui lòng thử lại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card">
      <div className="mb-4">
        <label className="block mb-2 font-medium">Họ</label>
        <input
          {...register('firstName', { required: 'Họ là bắt buộc' })}
          className={`form-input ${errors.firstName ? 'form-input-error' : ''}`}
        />
        {errors.firstName && (
          <span className="text-danger text-sm">{errors.firstName.message}</span>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">Email</label>
        <input
          type="email"
          {...register('email', {
            required: 'Email là bắt buộc',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email không hợp lệ'
            }
          })}
          className={`form-input ${errors.email ? 'form-input-error' : ''}`}
        />
        {errors.email && (
          <span className="text-danger text-sm">{errors.email.message}</span>
        )}
      </div>
      
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Thêm Sinh Viên'}
      </button>
    </form>
  );
};
```

---

## 🔐 Xác Thực & Bảo Mật (Authentication & Authorization)

### Tổng Quan Hệ Thống User

Hệ thống hỗ trợ **3 loại người dùng** với quyền hạn khác nhau:

| Loại User | Mô Tả | Quyền Hạn Frontend |
|-----------|-------|-------------------|
| **ADMIN** | Quản trị viên | Truy cập mọi trang, quản lý users, courses, students |
| **TEACHER** | Giáo viên | Quản lý khóa học của mình, xem/chấm điểm sinh viên |
| **STUDENT** | Học viên | Xem thông tin cá nhân, đăng ký khóa học, xem điểm |

### Tính Năng Authentication Frontend

#### 1. Đăng nhập (Login)
- **Gọi API**: `POST /api/auth/login`
- **Input**: username, password
- **Xử lý**: Lưu JWT token vào localStorage, redirect theo role
- **Redirect**: Admin → `/admin/dashboard`, Teacher → `/teacher/dashboard`, Student → `/student/dashboard`

#### 2. Đăng ký (Register)
- **Gọi API**: `POST /api/auth/register`
- **Input**: username, email, password, fullName, phone, role
- **Xử lý**: Tạo tài khoản mới, mặc định role là STUDENT
- **Redirect**: Chuyển đến trang đăng nhập

#### 3. Đăng xuất (Logout)
- **Gọi API**: `POST /api/auth/logout`
- **Xử lý**: Xóa token khỏi localStorage, redirect về `/login`

#### 4. Lấy thông tin User hiện tại
- **Gọi API**: `GET /api/auth/me`
- **Xử lý**: Lấy thông tin user đang đăng nhập để hiển thị

### Các Components Cần Xây Dựng

| Component | Mô tả |
|-----------|-------|
| `AuthContext` | React Context quản lý state user, login, logout |
| `ProtectedRoute` | Component bảo vệ routes, kiểm tra đăng nhập và roles |
| `LoginPage` | Trang đăng nhập với form username/password |
| `RegisterPage` | Trang đăng ký với form thông tin user và chọn role |
| `Navbar` | Thanh navigation hiển thị menu theo role user |

### Phân Quyền Routes Frontend

| Route Pattern | Roles được phép | Mô tả |
|---------------|-----------------|-------|
| `/login`, `/register` | Public | Không cần đăng nhập |
| `/admin/*` | ADMIN | Trang quản trị |
| `/teacher/*` | ADMIN, TEACHER | Trang giáo viên |
| `/student/*` | ADMIN, TEACHER, STUDENT | Trang học viên |
| `/profile` | Authenticated | Trang cá nhân |

### API Endpoints Authentication

| Method | Endpoint | Input | Output |
|--------|----------|-------|--------|
| POST | `/api/auth/login` | `{username, password}` | `{accessToken, id, username, email, roles}` |
| POST | `/api/auth/register` | `{username, email, password, fullName, phone, roles[]}` | `{message}` |
| POST | `/api/auth/logout` | - | `{message}` |
| GET | `/api/auth/me` | - | `{id, username, email, fullName, roles[]}` |

### Lưu Trữ Token

- **accessToken**: Lưu trong `localStorage`, gửi trong header `Authorization: Bearer <token>`
- **User info**: Lưu trong `localStorage` để hiển thị thông tin user

---



## ⚠️ Xử Lý Lỗi Đồng Bộ

### 1. Error Response Format (Backend)

Tạo standard error response:

```java
// ErrorResponse.java
public class ErrorResponse {
    private int status;
    private String message;
    private String timestamp;
    private Map<String, String> errors; // For validation errors
    
    // Constructors, getters, setters
}
```

```java
// GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(StudentNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleStudentNotFound(StudentNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            LocalDateTime.now().toString(),
            null
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Validation failed",
            LocalDateTime.now().toString(),
            errors
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateEmail(DuplicateEmailException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.CONFLICT.value(),
            ex.getMessage(),
            LocalDateTime.now().toString(),
            null
        );
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }
}
```

### 2. Error Handling Component (Frontend)

```javascript
// src/components/common/ErrorBoundary.jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="card text-center">
            <h2 className="text-2xl font-bold text-danger mb-4">
              Đã xảy ra lỗi
            </h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'Có lỗi không xác định'}
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## 🧪 Testing API Integration

### 1. Test với cURL

```bash
# Test GET all students
curl -X GET http://localhost:8080/api/students

# Test POST create student
curl -X POST http://localhost:8080/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Nguyễn Văn",
    "lastName": "Test",
    "email": "test@example.com",
    "phone": "0123456789",
    "dateOfBirth": "2000-01-01"
  }'

# Test PUT update student
curl -X PUT http://localhost:8080/api/students/1 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Nguyễn Văn",
    "lastName": "Updated",
    "email": "updated@example.com"
  }'

# Test DELETE student
curl -X DELETE http://localhost:8080/api/students/1
```

### 2. Test CORS

```bash
# Test CORS preflight
curl -X OPTIONS http://localhost:8080/api/students \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

### 3. Health Check Endpoint (Backend)

Thêm endpoint để kiểm tra kết nối:

```java
@RestController
@RequestMapping("/api")
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now().toString());
        health.put("service", "Student Management API");
        return ResponseEntity.ok(health);
    }
}
```

### 4. Connection Test (Frontend)

```javascript
// src/services/healthService.js
import api from './api';

export const checkApiConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ API Connection OK:', response.data);
    return true;
  } catch (error) {
    console.error('❌ API Connection Failed:', error.message);
    return false;
  }
};
```

---

## ✅ Checklist Triển Khai

### Backend Checklist

- [ ] Cấu hình CORS đã được thêm
- [ ] Tất cả endpoints trả về JSON format chuẩn
- [ ] Error handling đã được implement
- [ ] Validation cho tất cả input
- [ ] API documentation (Swagger/OpenAPI - tùy chọn)
- [ ] Health check endpoint hoạt động
- [ ] Test tất cả endpoints với cURL/Postman

### Frontend Checklist

- [ ] Biến môi trường `.env` được cấu hình
- [ ] API service với axios đã setup
- [ ] Request/Response interceptors hoạt động
- [ ] Error handling cho tất cả API calls
- [ ] Loading states khi fetch data
- [ ] Form validation đồng bộ với backend
- [ ] Toast notifications cho user feedback
- [ ] Test kết nối API trong development

### Quy Trình Chạy Đồng Bộ

```bash
# Terminal 1 - Start Backend
cd backend
mvn spring-boot:run
# Chờ thông báo: Started StudentManagementApplication

# Terminal 2 - Start Frontend
cd frontend
npm run dev
# Truy cập: http://localhost:3000

# Terminal 3 - Test connection
curl http://localhost:8080/api/health
```

---

## 🔗 Tài Liệu Liên Quan

- [Backend Guide](./be-guide.md) - Hướng dẫn Spring Boot Backend
- [Frontend Guide](./fe-guide.md) - Hướng dẫn React Frontend
- [Spring CORS Documentation](https://spring.io/guides/gs/rest-service-cors/)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [Vite Proxy Configuration](https://vitejs.dev/config/server-options.html#server-proxy)

---

**Được tạo với ❤️ để kết nối Backend & Frontend**

*Cập nhật lần cuối: 31 tháng 12, 2025*
