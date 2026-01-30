package com.example.studentmanagement.service;

import com.example.studentmanagement.dto.request.ClassRequest;
import com.example.studentmanagement.dto.response.ClassResponse;
import com.example.studentmanagement.entity.ClassEntity;
import com.example.studentmanagement.entity.Course;
import com.example.studentmanagement.entity.Student;
import com.example.studentmanagement.entity.Teacher;
import com.example.studentmanagement.entity.User;
import com.example.studentmanagement.entity.enums.ClassStatus;
import com.example.studentmanagement.exception.DuplicateResourceException;
import com.example.studentmanagement.exception.ResourceNotFoundException;
import com.example.studentmanagement.repository.ClassRepository;
import com.example.studentmanagement.repository.CourseRepository;
import com.example.studentmanagement.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassRepository classRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;

    @Transactional(readOnly = true)
    public List<ClassResponse> getAllClasses() {
        return classRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClassResponse> getAvailableClasses() {
        return classRepository.findAvailableClasses().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClassResponse getClassById(Long id) {
        ClassEntity classEntity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", id));
        return mapToResponse(classEntity);
    }

    @Transactional(readOnly = true)
    public ClassResponse getClassByCode(String code) {
        ClassEntity classEntity = classRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "code", code));
        return mapToResponse(classEntity);
    }

    @Transactional
    public ClassResponse createClass(ClassRequest request) {
        if (classRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Class", "code", request.getCode());
        }
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", request.getCourseId()));

        // AUTO-CONVERT: Nếu teacherId không tồn tại, có thể đây là userId
        final Teacher teacher;
        if (request.getTeacherId() != null) {
            final Long teacherId = request.getTeacherId();
            if (!teacherRepository.existsById(teacherId)) {
                // Thử tìm teacher bằng userId
                teacher = teacherRepository.findByUserId(teacherId)
                        .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));
            } else {
                teacher = teacherRepository.findById(teacherId)
                        .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));
            }
        } else {
            teacher = null;
        }

        ClassEntity classEntity = ClassEntity.builder()
                .code(request.getCode())
                .name(request.getName())
                .course(course)
                .teacher(teacher)
                .maxStudents(request.getMaxStudents() != null ? request.getMaxStudents() : 30)
                .currentStudents(0)
                .room(request.getRoom())
                .schedule(request.getSchedule())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() != null ? request.getStatus() : ClassStatus.OPEN)
                .isRegistrationOpen(request.getIsRegistrationOpen() != null ? request.getIsRegistrationOpen() : true)
                .build();
        classEntity = classRepository.save(classEntity);
        return mapToResponse(classEntity);
    }

    @Transactional
    public ClassResponse updateClass(Long id, ClassRequest request) {
        ClassEntity classEntity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", id));
        if (request.getName() != null)
            classEntity.setName(request.getName());
        if (request.getTeacherId() != null) {
            // AUTO-CONVERT: Nếu teacherId không tồn tại, có thể đây là userId
            final Long teacherId = request.getTeacherId();
            final Teacher teacher;
            if (!teacherRepository.existsById(teacherId)) {
                // Thử tìm teacher bằng userId
                teacher = teacherRepository.findByUserId(teacherId)
                        .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));
            } else {
                teacher = teacherRepository.findById(teacherId)
                        .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));
            }
            classEntity.setTeacher(teacher);
        }
        if (request.getMaxStudents() != null)
            classEntity.setMaxStudents(request.getMaxStudents());
        if (request.getRoom() != null)
            classEntity.setRoom(request.getRoom());
        if (request.getSchedule() != null)
            classEntity.setSchedule(request.getSchedule());
        if (request.getStartDate() != null)
            classEntity.setStartDate(request.getStartDate());
        if (request.getEndDate() != null)
            classEntity.setEndDate(request.getEndDate());
        if (request.getStatus() != null)
            classEntity.setStatus(request.getStatus());
        if (request.getIsRegistrationOpen() != null)
            classEntity.setIsRegistrationOpen(request.getIsRegistrationOpen());
        classEntity = classRepository.save(classEntity);
        return mapToResponse(classEntity);
    }

    @Transactional
    public void deleteClass(Long id) {
        ClassEntity classEntity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", id));
        classRepository.delete(classEntity);
    }

    @Transactional(readOnly = true)
    public List<ClassResponse> getClassesByCourseId(Long courseId) {
        return classRepository.findByCourseId(courseId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClassResponse> getClassesByTeacherId(Long teacherId) {
        return classRepository.findByTeacherId(teacherId).stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClassResponse> getClassesByStatus(ClassStatus status) {
        return classRepository.findByStatus(status).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<?> getStudentsInClass(Long classId) {
        // Lấy class để verify nó tồn tại
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));

        // Lấy students thông qua enrollments
        return classEntity.getEnrollments().stream()
                .filter(enrollment -> enrollment.getStudent() != null)
                .map(enrollment -> {
                    Student student = enrollment.getStudent();
                    User user = student.getUser();
                    // Tạo simple student response
                    return java.util.Map.of(
                            "id", student.getId(),
                            "firstName", user.getFullName().split(" ")[0],
                            "lastName", user.getFullName().substring(user.getFullName().indexOf(" ") + 1),
                            "email", user.getEmail(),
                            "studentCode", student.getStudentCode());
                })
                .collect(Collectors.toList());
    }

    private ClassResponse mapToResponse(ClassEntity classEntity) {
        ClassResponse.ClassResponseBuilder builder = ClassResponse.builder()
                .id(classEntity.getId())
                .code(classEntity.getCode())
                .name(classEntity.getName())
                .maxStudents(classEntity.getMaxStudents())
                .currentStudents(classEntity.getCurrentStudents())
                .room(classEntity.getRoom())
                .schedule(classEntity.getSchedule())
                .startDate(classEntity.getStartDate())
                .endDate(classEntity.getEndDate())
                .status(classEntity.getStatus())
                .isRegistrationOpen(classEntity.getIsRegistrationOpen())
                .createdAt(classEntity.getCreatedAt());
        if (classEntity.getCourse() != null) {
            builder.courseId(classEntity.getCourse().getId())
                    .courseName(classEntity.getCourse().getName())
                    .courseCode(classEntity.getCourse().getCode());
        }
        if (classEntity.getTeacher() != null) {
            builder.teacherId(classEntity.getTeacher().getId())
                    .teacherName(classEntity.getTeacher().getUser().getFullName())
                    .teacherEmployeeCode(classEntity.getTeacher().getEmployeeCode());
        }
        return builder.build();
    }
}
