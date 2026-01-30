package com.example.studentmanagement.service;

import com.example.studentmanagement.dto.request.AttendanceRequest;
import com.example.studentmanagement.dto.response.AttendanceResponse;
import com.example.studentmanagement.entity.Attendance;
import com.example.studentmanagement.entity.ClassEntity;
import com.example.studentmanagement.entity.Student;
import com.example.studentmanagement.entity.User;

import com.example.studentmanagement.exception.ResourceNotFoundException;
import com.example.studentmanagement.repository.AttendanceRepository;
import com.example.studentmanagement.repository.ClassRepository;
import com.example.studentmanagement.repository.StudentRepository;
import com.example.studentmanagement.repository.UserRepository;
import com.example.studentmanagement.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final ClassRepository classRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public List<AttendanceResponse> getAttendanceByClassId(Long classId) {
        return attendanceRepository.findByClassEntityId(classId).stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AttendanceResponse> getAttendanceByStudentId(Long studentId) {
        return attendanceRepository.findByStudentId(studentId).stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AttendanceResponse> getAttendanceByClassAndDate(Long classId, LocalDate date) {
        return attendanceRepository.findByClassEntityIdAndSessionDate(classId, date).stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceResponse markAttendance(AttendanceRequest request) {
        Attendance attendance = attendanceRepository.findByClassEntityIdAndStudentIdAndSessionDate(
                request.getClassId(), request.getStudentId(), request.getSessionDate()).orElse(null);

        if (attendance != null) {
            attendance.setStatus(request.getStatus());
            attendance.setNote(request.getNote());
            attendance.setSessionNumber(request.getSessionNumber());
            attendance.setMarkedAt(LocalDateTime.now());
        } else {
            ClassEntity classEntity = classRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class", "id", request.getClassId()));
            Student student = studentRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));

            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                    .getPrincipal();
            User markedBy = userRepository.findById(userDetails.getId()).orElse(null);

            attendance = Attendance.builder()
                    .classEntity(classEntity)
                    .student(student)
                    .sessionDate(request.getSessionDate())
                    .sessionNumber(request.getSessionNumber())
                    .status(request.getStatus())
                    .note(request.getNote())
                    .markedBy(markedBy)
                    .markedAt(LocalDateTime.now())
                    .build();
        }

        attendance = attendanceRepository.save(attendance);
        return mapToResponse(attendance);
    }

    @Transactional
    public AttendanceResponse updateAttendance(Long id, AttendanceRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", id));
        if (request.getStatus() != null)
            attendance.setStatus(request.getStatus());
        if (request.getNote() != null)
            attendance.setNote(request.getNote());
        attendance = attendanceRepository.save(attendance);
        return mapToResponse(attendance);
    }

    @Transactional
    public void deleteAttendance(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", id));
        attendanceRepository.delete(attendance);
    }

    private AttendanceResponse mapToResponse(Attendance attendance) {
        AttendanceResponse.AttendanceResponseBuilder builder = AttendanceResponse.builder()
                .id(attendance.getId())
                .sessionDate(attendance.getSessionDate())
                .sessionNumber(attendance.getSessionNumber())
                .status(attendance.getStatus())
                .note(attendance.getNote())
                .markedAt(attendance.getMarkedAt());
        if (attendance.getStudent() != null) {
            builder.studentId(attendance.getStudent().getId())
                    .studentCode(attendance.getStudent().getStudentCode())
                    .studentName(attendance.getStudent().getUser().getFullName());
        }
        if (attendance.getClassEntity() != null) {
            builder.classId(attendance.getClassEntity().getId())
                    .className(attendance.getClassEntity().getName());
        }
        if (attendance.getMarkedBy() != null) {
            builder.markedByName(attendance.getMarkedBy().getFullName());
        }
        return builder.build();
    }
}
