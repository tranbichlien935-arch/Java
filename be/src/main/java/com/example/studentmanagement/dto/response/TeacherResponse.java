package com.example.studentmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherResponse {
    private Long id;
    private String employeeCode;
    private String department;
    private String specialization;
    private LocalDate hireDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;

    // Danh sách lớp học được gán cho giáo viên
    private List<ClassResponse> classes;
}
