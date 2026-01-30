package com.example.studentmanagement.dto.response;

import com.example.studentmanagement.entity.enums.ClassStatus;
import com.example.studentmanagement.entity.enums.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentResponse {
    private Long id;
    private LocalDateTime enrollmentDate;
    private EnrollmentStatus status;
    private String note;
    private Long studentId;
    private String studentCode;
    private String studentName;
    private Long classId;
    private String classCode;
    private String className;
    private String courseName;

    // Class details
    private String teacherName;
    private ClassStatus classStatus;
    private String schedule;
    private LocalDate startDate;
    private LocalDate endDate;
    private String room;
}
