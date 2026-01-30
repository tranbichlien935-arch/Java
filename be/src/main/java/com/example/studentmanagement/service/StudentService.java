package com.example.studentmanagement.service;

import com.example.studentmanagement.dto.request.StudentRequest;
import com.example.studentmanagement.dto.response.StudentResponse;
import com.example.studentmanagement.entity.Role;
import com.example.studentmanagement.entity.Student;
import com.example.studentmanagement.entity.User;
import com.example.studentmanagement.entity.enums.RoleName;
import com.example.studentmanagement.exception.DuplicateResourceException;
import com.example.studentmanagement.exception.ResourceNotFoundException;
import com.example.studentmanagement.repository.RoleRepository;
import com.example.studentmanagement.repository.StudentRepository;
import com.example.studentmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public StudentResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        return mapToResponse(student);
    }

    public StudentResponse getStudentByCode(String studentCode) {
        Student student = studentRepository.findByStudentCode(studentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "studentCode", studentCode));
        return mapToResponse(student);
    }

    @Transactional
    public StudentResponse createStudent(StudentRequest request) {
        if (request.getStudentCode() != null && studentRepository.existsByStudentCode(request.getStudentCode())) {
            throw new DuplicateResourceException("Student", "studentCode", request.getStudentCode());
        }
        if (request.getUsername() != null && userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("User", "username", request.getUsername());
        }
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        Role studentRole = roleRepository.findByName(RoleName.ROLE_STUDENT)
                .orElseThrow(() -> new ResourceNotFoundException("Role STUDENT not found"));
        Set<Role> roles = new HashSet<>();
        roles.add(studentRole);

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

        Student student = Student.builder()
                .user(user)
                .studentCode(request.getStudentCode() != null ? request.getStudentCode() : generateStudentCode())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .address(request.getAddress())
                .enrollmentDate(request.getEnrollmentDate() != null ? request.getEnrollmentDate() : LocalDate.now())
                .build();
        student = studentRepository.save(student);
        return mapToResponse(student);
    }

    @Transactional
    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        if (request.getDateOfBirth() != null)
            student.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null)
            student.setGender(request.getGender());
        if (request.getAddress() != null)
            student.setAddress(request.getAddress());

        User user = student.getUser();
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
        student = studentRepository.save(student);
        return mapToResponse(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        User user = student.getUser();
        studentRepository.delete(student);
        userRepository.delete(user);
    }

    public List<StudentResponse> searchStudents(String name) {
        return studentRepository.findByNameContaining(name).stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<StudentResponse> getStudentsByClassId(Long classId) {
        return studentRepository.findByClassId(classId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private StudentResponse mapToResponse(Student student) {
        User user = student.getUser();
        return StudentResponse.builder()
                .id(student.getId())
                .studentCode(student.getStudentCode())
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender())
                .address(student.getAddress())
                .enrollmentDate(student.getEnrollmentDate())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    private String generateStudentCode() {
        long count = studentRepository.count();
        String code;
        do {
            count++;
            code = String.format("STU%05d", count);
        } while (studentRepository.existsByStudentCode(code));
        return code;
    }
}
