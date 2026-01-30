package com.example.studentmanagement.service;

import com.example.studentmanagement.dto.request.UserRequest;
import com.example.studentmanagement.dto.response.MessageResponse;
import com.example.studentmanagement.dto.response.UserResponse;
import com.example.studentmanagement.entity.Role;
import com.example.studentmanagement.entity.User;
import com.example.studentmanagement.entity.enums.RoleName;
import com.example.studentmanagement.exception.ResourceNotFoundException;
import com.example.studentmanagement.repository.RoleRepository;
import com.example.studentmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.example.studentmanagement.repository.TeacherRepository teacherRepository;
    private final com.example.studentmanagement.repository.StudentRepository studentRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToResponse(user);
    }

    public List<UserResponse> getUsersByRole(String roleName) {
        try {
            RoleName role = RoleName.valueOf(roleName);
            return userRepository.findByRoles_Name(role).stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Invalid role name: " + roleName);
        }
    }

    @Transactional
    public UserResponse createUser(com.example.studentmanagement.dto.request.CreateUserRequest request) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new com.example.studentmanagement.exception.DuplicateResourceException("User", "username",
                    request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new com.example.studentmanagement.exception.DuplicateResourceException("User", "email",
                    request.getEmail());
        }

        // Create user
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .avatarUrl(request.getAvatarUrl())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        // Assign roles
        Set<Role> roles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (String roleName : request.getRoles()) {
                RoleName roleEnum;
                try {
                    roleEnum = RoleName.valueOf(roleName.toUpperCase().startsWith("ROLE_")
                            ? roleName.toUpperCase()
                            : "ROLE_" + roleName.toUpperCase());
                } catch (IllegalArgumentException e) {
                    throw new ResourceNotFoundException("Invalid role: " + roleName);
                }
                Role role = roleRepository.findByName(roleEnum)
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
                roles.add(role);
            }
        } else {
            // Default role: STUDENT
            Role defaultRole = roleRepository.findByName(RoleName.ROLE_STUDENT)
                    .orElseThrow(() -> new ResourceNotFoundException("Default role STUDENT not found"));
            roles.add(defaultRole);
        }
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        // Auto-create Teacher or Student entity based on role
        for (String roleName : request.getRoles()) {
            if (roleName.toUpperCase().contains("TEACHER")) {
                // Create Teacher entity
                com.example.studentmanagement.entity.Teacher teacher = com.example.studentmanagement.entity.Teacher
                        .builder()
                        .user(savedUser)
                        .employeeCode(generateEmployeeCode())
                        .build();
                teacherRepository.save(teacher);
            } else if (roleName.toUpperCase().contains("STUDENT")) {
                // Create Student entity
                com.example.studentmanagement.entity.Student student = com.example.studentmanagement.entity.Student
                        .builder()
                        .user(savedUser)
                        .studentCode(generateStudentCode())
                        .build();
                studentRepository.save(student);
            }
        }

        return convertToResponse(savedUser);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : request.getRoles()) {
                RoleName roleEnum;
                try {
                    roleEnum = RoleName.valueOf(roleName.toUpperCase().startsWith("ROLE_")
                            ? roleName.toUpperCase()
                            : "ROLE_" + roleName.toUpperCase());
                } catch (IllegalArgumentException e) {
                    throw new ResourceNotFoundException("Invalid role: " + roleName);
                }
                Role role = roleRepository.findByName(roleEnum)
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
                roles.add(role);
            }
            user.setRoles(roles);
        }

        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }

    @Transactional
    public MessageResponse deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
        return MessageResponse.success("User deleted successfully");
    }

    @Transactional
    public UserResponse activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setIsActive(true);
        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }

    @Transactional
    public UserResponse deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setIsActive(false);
        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();

        com.example.studentmanagement.security.UserDetailsImpl userDetails = (com.example.studentmanagement.security.UserDetailsImpl) authentication
                .getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return convertToResponse(user);
    }

    @Transactional
    public UserResponse updateCurrentUserProfile(UserRequest request) {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();

        com.example.studentmanagement.security.UserDetailsImpl userDetails = (com.example.studentmanagement.security.UserDetailsImpl) authentication
                .getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }

    @Transactional
    public MessageResponse changePassword(com.example.studentmanagement.dto.request.ChangePasswordRequest request) {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();

        com.example.studentmanagement.security.UserDetailsImpl userDetails = (com.example.studentmanagement.security.UserDetailsImpl) authentication
                .getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new com.example.studentmanagement.exception.BadRequestException("Old password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return MessageResponse.success("Password changed successfully");
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

    private String generateEmployeeCode() {
        long count = teacherRepository.count();
        String code;
        do {
            count++;
            code = String.format("TCH%05d", count);
        } while (teacherRepository.existsByEmployeeCode(code));
        return code;
    }

    private UserResponse convertToResponse(User user) {
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
}
