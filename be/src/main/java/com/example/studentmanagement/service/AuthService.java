package com.example.studentmanagement.service;

import com.example.studentmanagement.dto.request.LoginRequest;
import com.example.studentmanagement.dto.request.RegisterRequest;
import com.example.studentmanagement.dto.response.JwtResponse;
import com.example.studentmanagement.dto.response.MessageResponse;
import com.example.studentmanagement.dto.response.UserResponse;
import com.example.studentmanagement.entity.Role;
import com.example.studentmanagement.entity.Student;
import com.example.studentmanagement.entity.Teacher;
import com.example.studentmanagement.entity.User;
import com.example.studentmanagement.entity.enums.RoleName;
import com.example.studentmanagement.exception.DuplicateResourceException;
import com.example.studentmanagement.exception.ResourceNotFoundException;
import com.example.studentmanagement.repository.RoleRepository;
import com.example.studentmanagement.repository.StudentRepository;
import com.example.studentmanagement.repository.TeacherRepository;
import com.example.studentmanagement.repository.UserRepository;
import com.example.studentmanagement.security.JwtUtils;
import com.example.studentmanagement.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        // Query teacherId hoặc studentId dựa trên role
        Long teacherId = null;
        Long studentId = null;

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Nếu user có role TEACHER, lấy teacherId
        if (roles.contains("ROLE_TEACHER")) {
            teacherId = user.getTeacher() != null ? user.getTeacher().getId() : null;
        }

        // Nếu user có role STUDENT, lấy studentId
        if (roles.contains("ROLE_STUDENT")) {
            studentId = user.getStudent() != null ? user.getStudent().getId() : null;
        }

        return new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(),
                userDetails.getEmail(), userDetails.getFullName(), roles, teacherId, studentId);
    }

    @Transactional
    public MessageResponse registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new DuplicateResourceException("User", "username", registerRequest.getUsername());
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new DuplicateResourceException("User", "email", registerRequest.getEmail());
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .fullName(registerRequest.getFullName())
                .phone(registerRequest.getPhone())
                .isActive(true)
                .build();

        Set<String> strRoles = registerRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Role studentRole = roleRepository.findByName(RoleName.ROLE_STUDENT)
                    .orElseThrow(() -> new ResourceNotFoundException("Role STUDENT not found"));
            roles.add(studentRole);
        } else {
            strRoles.forEach(role -> {
                switch (role.toUpperCase()) {
                    case "ADMIN":
                        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                                .orElseThrow(() -> new ResourceNotFoundException("Role ADMIN not found"));
                        roles.add(adminRole);
                        break;
                    case "TEACHER":
                        Role teacherRole = roleRepository.findByName(RoleName.ROLE_TEACHER)
                                .orElseThrow(() -> new ResourceNotFoundException("Role TEACHER not found"));
                        roles.add(teacherRole);
                        break;
                    default:
                        Role studentRole = roleRepository.findByName(RoleName.ROLE_STUDENT)
                                .orElseThrow(() -> new ResourceNotFoundException("Role STUDENT not found"));
                        roles.add(studentRole);
                }
            });
        }

        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        // Auto-create Student or Teacher record based on role
        for (Role role : roles) {
            if (role.getName() == RoleName.ROLE_STUDENT) {
                // Create Student record
                String studentCode = generateStudentCode();
                Student student = Student.builder()
                        .user(savedUser)
                        .studentCode(studentCode)
                        .enrollmentDate(LocalDate.now())
                        .build();
                studentRepository.save(student);
                System.out.println("Created student record with code: " + studentCode);
            } else if (role.getName() == RoleName.ROLE_TEACHER) {
                // Create Teacher record
                String employeeCode = generateEmployeeCode();
                Teacher teacher = Teacher.builder()
                        .user(savedUser)
                        .employeeCode(employeeCode)
                        .hireDate(LocalDate.now())
                        .build();
                teacherRepository.save(teacher);
                System.out.println("Created teacher record with code: " + employeeCode);
            }
        }

        return MessageResponse.success("User registered successfully!");
    }

    private String generateStudentCode() {
        long count = studentRepository.count();
        return String.format("STU%05d", count + 1);
    }

    private String generateEmployeeCode() {
        long count = teacherRepository.count();
        return String.format("TCH%05d", count + 1);
    }

    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .isActive(user.getIsActive())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public MessageResponse logout() {
        SecurityContextHolder.clearContext();
        return MessageResponse.success("Logged out successfully!");
    }
}
