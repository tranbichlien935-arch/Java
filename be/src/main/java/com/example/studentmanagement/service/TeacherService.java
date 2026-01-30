package com.example.studentmanagement.service;

import com.example.studentmanagement.dto.request.TeacherRequest;
import com.example.studentmanagement.dto.response.ClassResponse;
import com.example.studentmanagement.dto.response.TeacherResponse;
import com.example.studentmanagement.entity.Role;
import com.example.studentmanagement.entity.Teacher;
import com.example.studentmanagement.entity.User;
import com.example.studentmanagement.entity.enums.RoleName;
import com.example.studentmanagement.exception.DuplicateResourceException;
import com.example.studentmanagement.exception.ResourceNotFoundException;
import com.example.studentmanagement.repository.RoleRepository;
import com.example.studentmanagement.repository.TeacherRepository;
import com.example.studentmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.studentmanagement.security.UserDetailsImpl;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<TeacherResponse> getAllTeachers() {
        return teacherRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeacherResponse getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        return mapToResponse(teacher);
    }

    public TeacherResponse getTeacherByEmployeeCode(String employeeCode) {
        Teacher teacher = teacherRepository.findByEmployeeCode(employeeCode)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "employeeCode", employeeCode));
        return mapToResponse(teacher);
    }

    @Transactional(readOnly = true)
    public TeacherResponse getCurrentTeacher() {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        // Find teacher by userId
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for current user"));

        return mapToResponse(teacher);
    }

    @Transactional
    public TeacherResponse createTeacher(TeacherRequest request) {
        if (request.getEmployeeCode() != null && teacherRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new DuplicateResourceException("Teacher", "employeeCode", request.getEmployeeCode());
        }
        if (request.getUsername() != null && userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("User", "username", request.getUsername());
        }
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        Role teacherRole = roleRepository.findByName(RoleName.ROLE_TEACHER)
                .orElseThrow(() -> new ResourceNotFoundException("Role TEACHER not found"));
        Set<Role> roles = new HashSet<>();
        roles.add(teacherRole);

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "123456"))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .isActive(true)
                .roles(roles)
                .build();
        user = userRepository.save(user);

        Teacher teacher = Teacher.builder()
                .user(user)
                .employeeCode(request.getEmployeeCode() != null ? request.getEmployeeCode() : generateEmployeeCode())
                .department(request.getDepartment())
                .specialization(request.getSpecialization())
                .hireDate(request.getHireDate())
                .build();
        teacher = teacherRepository.save(teacher);
        return mapToResponse(teacher);
    }

    @Transactional
    public TeacherResponse updateTeacher(Long id, TeacherRequest request) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        if (request.getDepartment() != null)
            teacher.setDepartment(request.getDepartment());
        if (request.getSpecialization() != null)
            teacher.setSpecialization(request.getSpecialization());
        if (request.getHireDate() != null)
            teacher.setHireDate(request.getHireDate());

        User user = teacher.getUser();
        if (request.getFullName() != null)
            user.setFullName(request.getFullName());
        if (request.getPhone() != null)
            user.setPhone(request.getPhone());
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("User", "email", request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        userRepository.save(user);
        teacher = teacherRepository.save(teacher);
        return mapToResponse(teacher);
    }

    @Transactional
    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        User user = teacher.getUser();
        teacherRepository.delete(teacher);
        userRepository.delete(user);
    }

    public List<TeacherResponse> getTeachersByDepartment(String department) {
        return teacherRepository.findByDepartment(department).stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TeacherResponse> searchTeachers(String name) {
        return teacherRepository.findByNameContaining(name).stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TeacherResponse mapToResponse(Teacher teacher) {
        User user = teacher.getUser();

        // Map classes if available
        List<ClassResponse> classResponses = teacher.getClasses() != null
                ? teacher.getClasses().stream()
                        .map(classEntity -> ClassResponse.builder()
                                .id(classEntity.getId())
                                .code(classEntity.getCode())
                                .name(classEntity.getName())
                                .courseName(classEntity.getCourse() != null ? classEntity.getCourse().getName() : null)
                                .courseId(classEntity.getCourse() != null ? classEntity.getCourse().getId() : null)
                                .maxStudents(classEntity.getMaxStudents())
                                .currentStudents(classEntity.getCurrentStudents())
                                .status(classEntity.getStatus())
                                .room(classEntity.getRoom())
                                .schedule(classEntity.getSchedule())
                                .startDate(classEntity.getStartDate())
                                .endDate(classEntity.getEndDate())
                                .build())
                        .collect(Collectors.toList())
                : List.of();

        return TeacherResponse.builder()
                .id(teacher.getId())
                .employeeCode(teacher.getEmployeeCode())
                .department(teacher.getDepartment())
                .specialization(teacher.getSpecialization())
                .hireDate(teacher.getHireDate())
                .createdAt(teacher.getCreatedAt())
                .updatedAt(teacher.getUpdatedAt())
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .classes(classResponses)
                .build();
    }

    private String generateEmployeeCode() {
        long count = teacherRepository.count();
        String code;
        do {
            count++;
            code = String.format("TCH%05d", count);
        } while (teacherRepository.existsByEmployeeCode(code));
        return code;
    }
}
