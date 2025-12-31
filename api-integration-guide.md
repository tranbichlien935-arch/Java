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

### Bảng Mapping Frontend Service → Backend API

| Frontend Service Method | HTTP Method | Backend Endpoint | Request Body | Response |
|------------------------|-------------|------------------|--------------|----------|
| **Students** |
| `studentService.getAllStudents()` | GET | `/api/students` | - | `Student[]` |
| `studentService.getStudentById(id)` | GET | `/api/students/{id}` | - | `Student` |
| `studentService.createStudent(data)` | POST | `/api/students` | `StudentDTO` | `Student` |
| `studentService.updateStudent(id, data)` | PUT | `/api/students/{id}` | `StudentDTO` | `Student` |
| `studentService.deleteStudent(id)` | DELETE | `/api/students/{id}` | - | `void` |
| `studentService.searchStudents(query)` | GET | `/api/students/search?q={query}` | - | `Student[]` |
| **Courses** |
| `courseService.getAllCourses()` | GET | `/api/courses` | - | `Course[]` |
| `courseService.getCourseById(id)` | GET | `/api/courses/{id}` | - | `Course` |
| `courseService.createCourse(data)` | POST | `/api/courses` | `CourseDTO` | `Course` |
| `courseService.updateCourse(id, data)` | PUT | `/api/courses/{id}` | `CourseDTO` | `Course` |
| `courseService.deleteCourse(id)` | DELETE | `/api/courses/{id}` | - | `void` |
| **Enrollments** |
| `enrollmentService.getAllEnrollments()` | GET | `/api/enrollments` | - | `Enrollment[]` |
| `enrollmentService.createEnrollment(data)` | POST | `/api/enrollments` | `EnrollmentDTO` | `Enrollment` |
| `enrollmentService.deleteEnrollment(id)` | DELETE | `/api/enrollments/{id}` | - | `void` |

### Data Models

#### Student DTO

```javascript
// Frontend Request
const studentData = {
  firstName: "Nguyễn Văn",
  lastName: "An",
  email: "nguyenvanan@example.com",
  phone: "0123456789",
  dateOfBirth: "2000-01-15" // Format: YYYY-MM-DD
};
```

```java
// Backend Entity
public class Student {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    // ... getters/setters
}
```

#### Course DTO

```javascript
// Frontend Request
const courseData = {
  name: "Lập Trình Java",
  code: "IT001",
  credits: 3,
  description: "Khóa học lập trình Java cơ bản"
};
```

#### Enrollment DTO

```javascript
// Frontend Request
const enrollmentData = {
  studentId: 1,
  courseId: 2,
  enrollmentDate: "2025-01-15"
};
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

## 🔐 Xác Thực & Bảo Mật

### 1. JWT Authentication (Backend)

Thêm vào `application.properties`:

```properties
# JWT Configuration
app.jwt.secret=your-256-bit-secret-key-here-make-it-long-and-random
app.jwt.expiration=86400000
# 86400000 = 24 hours in milliseconds
```

### 2. Authentication Service (Frontend)

Tạo file `src/services/authService.js`:

```javascript
import api from './api';

const AUTH_ENDPOINT = '/auth';

export const authService = {
  login: async (credentials) => {
    const response = await api.post(`${AUTH_ENDPOINT}/login`, credentials);
    const { token, user } = response.data;
    
    // Lưu token vào localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  register: async (userData) => {
    const response = await api.post(`${AUTH_ENDPOINT}/register`, userData);
    return response.data;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

export default authService;
```

### 3. Protected Route Component

```javascript
import { Navigate, Outlet } from 'react-router-dom';
import authService from '@/services/authService';

const ProtectedRoute = () => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
```

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
