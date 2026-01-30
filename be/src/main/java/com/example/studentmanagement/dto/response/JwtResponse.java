package com.example.studentmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtResponse {
    private String accessToken;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private List<String> roles;
    private Long teacherId; // ID từ bảng teachers (nếu user là teacher)
    private Long studentId; // ID từ bảng students (nếu user là student)

    public JwtResponse(String accessToken, Long id, String username, String email, String fullName,
            List<String> roles) {
        this.accessToken = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
    }

    public JwtResponse(String accessToken, Long id, String username, String email, String fullName,
            List<String> roles, Long teacherId, Long studentId) {
        this.accessToken = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
        this.teacherId = teacherId;
        this.studentId = studentId;
    }
}
