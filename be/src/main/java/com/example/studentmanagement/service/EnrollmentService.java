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

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getAllEnrollments() {
        return enrollmentRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EnrollmentResponse getEnrollmentById(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", id));
        return mapToResponse(enrollment);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getEnrollmentsByStudentId(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId).stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getEnrollmentsByClassId(Long classId) {
        return enrollmentRepository.findByClassEntityId(classId).stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnrollmentResponse createEnrollment(EnrollmentRequest request) {
        // AUTO-CONVERT: Ưu tiên tìm student bằng userId trước
        final Long studentId;
        Long requestStudentId = request.getStudentId();

        // Luôn thử tìm student bằng userId trước
        Student studentByUserId = studentRepository.findByUserId(requestStudentId).orElse(null);

        if (studentByUserId != null) {
            // Tìm thấy student bằng userId
            studentId = studentByUserId.getId();
            System.out.println("Auto-converted userId " + requestStudentId + " to studentId " + studentId);
        } else if (studentRepository.existsById(requestStudentId)) {
            // requestStudentId là studentId thực
            studentId = requestStudentId;
            System.out.println("Using studentId directly: " + studentId);
        } else {
            // Không tìm thấy student
            throw new ResourceNotFoundException("Student", "userId or studentId", requestStudentId);
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
            Student student = enrollment.getStudent();
            builder.studentId(student.getId())
                    .studentCode(student.getStudentCode());
            if (student.getUser() != null) {
                builder.studentName(student.getUser().getFullName());
            }
        }
        if (enrollment.getClassEntity() != null) {
            ClassEntity classEntity = enrollment.getClassEntity();
            builder.classId(classEntity.getId())
                    .classCode(classEntity.getCode())
                    .className(classEntity.getName())
                    .classStatus(classEntity.getStatus())
                    .schedule(classEntity.getSchedule())
                    .startDate(classEntity.getStartDate())
                    .endDate(classEntity.getEndDate())
                    .room(classEntity.getRoom());

            if (classEntity.getCourse() != null) {
                builder.courseName(classEntity.getCourse().getName());
            }

            if (classEntity.getTeacher() != null && classEntity.getTeacher().getUser() != null) {
                builder.teacherName(classEntity.getTeacher().getUser().getFullName());
            }
        }
        return builder.build();
    }
}
