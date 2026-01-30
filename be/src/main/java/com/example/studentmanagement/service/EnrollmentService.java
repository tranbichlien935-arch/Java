package com.example.studentmanagement.service;

import com.example.studentmanagement.dto.request.EnrollmentRequest;
import com.example.studentmanagement.dto.response.EnrollmentResponse;
import com.example.studentmanagement.entity.ClassEntity;
import com.example.studentmanagement.entity.Enrollment;
import com.example.studentmanagement.entity.Student;
import com.example.studentmanagement.entity.enums.EnrollmentStatus;
import com.example.studentmanagement.exception.DuplicateResourceException;
import com.example.studentmanagement.exception.ResourceNotFoundException;
import com.example.studentmanagement.repository.ClassRepository;
import com.example.studentmanagement.repository.EnrollmentRepository;
import com.example.studentmanagement.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;

    public List<EnrollmentResponse> getAllEnrollments() {
        return enrollmentRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public EnrollmentResponse getEnrollmentById(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", id));
        return mapToResponse(enrollment);
    }

    public List<EnrollmentResponse> getEnrollmentsByStudentId(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId).stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<EnrollmentResponse> getEnrollmentsByClassId(Long classId) {
        return enrollmentRepository.findByClassEntityId(classId).stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnrollmentResponse createEnrollment(EnrollmentRequest request) {
        // AUTO-CONVERT: Nếu frontend gửi userId, tự động tìm studentId
        final Long studentId;
        Long requestStudentId = request.getStudentId();

        // Nếu studentId không tồn tại trong bảng students, có thể đây là userId
        if (requestStudentId != null && !studentRepository.existsById(requestStudentId)) {
            // Thử tìm student bằng userId
            Student studentByUserId = studentRepository.findByUserId(requestStudentId).orElse(null);
            if (studentByUserId != null) {
                studentId = studentByUserId.getId();
            } else {
                studentId = requestStudentId; // Fallback to original ID
            }
        } else {
            studentId = requestStudentId;
        }

        if (enrollmentRepository.existsByStudentIdAndClassEntityId(studentId, request.getClassId())) {
            throw new DuplicateResourceException("Student is already enrolled in this class");
        }
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        ClassEntity classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getClassId()));

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .classEntity(classEntity)
                .enrollmentDate(LocalDateTime.now())
                .status(request.getStatus() != null ? request.getStatus() : EnrollmentStatus.PENDING)
                .note(request.getNote())
                .build();
        enrollment = enrollmentRepository.save(enrollment);

        classEntity.setCurrentStudents(classEntity.getCurrentStudents() + 1);
        if (classEntity.getCurrentStudents() >= classEntity.getMaxStudents()) {
            classEntity.setIsRegistrationOpen(false);
        }
        classRepository.save(classEntity);
        return mapToResponse(enrollment);
    }

    @Transactional
    public EnrollmentResponse updateEnrollmentStatus(Long id, EnrollmentStatus status) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", id));
        EnrollmentStatus oldStatus = enrollment.getStatus();
        enrollment.setStatus(status);
        enrollment = enrollmentRepository.save(enrollment);

        if (status == EnrollmentStatus.CANCELLED && oldStatus != EnrollmentStatus.CANCELLED) {
            ClassEntity classEntity = enrollment.getClassEntity();
            classEntity.setCurrentStudents(Math.max(0, classEntity.getCurrentStudents() - 1));
            if (classEntity.getCurrentStudents() < classEntity.getMaxStudents()) {
                classEntity.setIsRegistrationOpen(true);
            }
            classRepository.save(classEntity);
        }
        return mapToResponse(enrollment);
    }

    @Transactional
    public void deleteEnrollment(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", id));
        ClassEntity classEntity = enrollment.getClassEntity();
        enrollmentRepository.delete(enrollment);
        classEntity.setCurrentStudents(Math.max(0, classEntity.getCurrentStudents() - 1));
        if (classEntity.getCurrentStudents() < classEntity.getMaxStudents()) {
            classEntity.setIsRegistrationOpen(true);
        }
        classRepository.save(classEntity);
    }

    private EnrollmentResponse mapToResponse(Enrollment enrollment) {
        EnrollmentResponse.EnrollmentResponseBuilder builder = EnrollmentResponse.builder()
                .id(enrollment.getId())
                .enrollmentDate(enrollment.getEnrollmentDate())
                .status(enrollment.getStatus())
                .note(enrollment.getNote());
        if (enrollment.getStudent() != null) {
            builder.studentId(enrollment.getStudent().getId())
                    .studentCode(enrollment.getStudent().getStudentCode())
                    .studentName(enrollment.getStudent().getUser().getFullName());
        }
        if (enrollment.getClassEntity() != null) {
            builder.classId(enrollment.getClassEntity().getId())
                    .classCode(enrollment.getClassEntity().getCode())
                    .className(enrollment.getClassEntity().getName());
            if (enrollment.getClassEntity().getCourse() != null) {
                builder.courseName(enrollment.getClassEntity().getCourse().getName());
            }
        }
        return builder.build();
    }
}
