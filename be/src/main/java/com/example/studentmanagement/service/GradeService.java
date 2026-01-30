package com.example.studentmanagement.service;

import com.example.studentmanagement.dto.request.GradeRequest;
import com.example.studentmanagement.dto.response.GradeResponse;
import com.example.studentmanagement.entity.Enrollment;
import com.example.studentmanagement.entity.Grade;
import com.example.studentmanagement.entity.User;
import com.example.studentmanagement.exception.ResourceNotFoundException;
import com.example.studentmanagement.repository.EnrollmentRepository;
import com.example.studentmanagement.repository.GradeRepository;
import com.example.studentmanagement.repository.UserRepository;
import com.example.studentmanagement.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final GradeRepository gradeRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<GradeResponse> getGradesByStudentId(Long studentId) {
        return gradeRepository.findByStudentId(studentId).stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GradeResponse> getGradesByClassId(Long classId) {
        return gradeRepository.findByClassId(classId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public GradeResponse createOrUpdateGrade(GradeRequest request) {
        Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", request.getEnrollmentId()));

        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        User gradedBy = userRepository.findById(userDetails.getId()).orElse(null);

        Grade grade = gradeRepository.findByEnrollmentId(request.getEnrollmentId()).orElse(null);

        if (grade == null) {
            grade = Grade.builder()
                    .enrollment(enrollment)
                    .attendanceScore(request.getAttendanceScore())
                    .midtermScore(request.getMidtermScore())
                    .finalScore(request.getFinalScore())
                    .comment(request.getComment())
                    .gradedBy(gradedBy)
                    .gradedAt(LocalDateTime.now())
                    .build();
        } else {
            if (request.getAttendanceScore() != null)
                grade.setAttendanceScore(request.getAttendanceScore());
            if (request.getMidtermScore() != null)
                grade.setMidtermScore(request.getMidtermScore());
            if (request.getFinalScore() != null)
                grade.setFinalScore(request.getFinalScore());
            if (request.getComment() != null)
                grade.setComment(request.getComment());
            grade.setGradedBy(gradedBy);
        }
        grade.calculateTotalScore();
        grade = gradeRepository.save(grade);
        return mapToResponse(grade);
    }

    private GradeResponse mapToResponse(Grade grade) {
        Enrollment e = grade.getEnrollment();
        return GradeResponse.builder()
                .id(grade.getId())
                .attendanceScore(grade.getAttendanceScore())
                .midtermScore(grade.getMidtermScore())
                .finalScore(grade.getFinalScore())
                .totalScore(grade.getTotalScore())
                .comment(grade.getComment())
                .gradedAt(grade.getGradedAt())
                .enrollmentId(e.getId())
                .studentId(e.getStudent() != null ? e.getStudent().getId() : null)
                .studentCode(e.getStudent() != null ? e.getStudent().getStudentCode() : null)
                .studentName(e.getStudent() != null ? e.getStudent().getUser().getFullName() : null)
                .classId(e.getClassEntity() != null ? e.getClassEntity().getId() : null)
                .className(e.getClassEntity() != null ? e.getClassEntity().getName() : null)
                .gradedByName(grade.getGradedBy() != null ? grade.getGradedBy().getFullName() : null)
                .build();
    }
}
