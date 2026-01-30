package com.example.studentmanagement.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "grades")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false, unique = true)
    @JsonIgnoreProperties({ "grade", "payments", "hibernateLazyInitializer", "handler" })
    private Enrollment enrollment;

    @Column(name = "attendance_score", precision = 4, scale = 2)
    private BigDecimal attendanceScore;

    @Column(name = "midterm_score", precision = 4, scale = 2)
    private BigDecimal midtermScore;

    @Column(name = "final_score", precision = 4, scale = 2)
    private BigDecimal finalScore;

    @Column(name = "total_score", precision = 4, scale = 2)
    private BigDecimal totalScore;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by")
    @JsonIgnoreProperties({ "teacher", "student", "password", "roles", "hibernateLazyInitializer", "handler" })
    private User gradedBy;

    @Column(name = "graded_at")
    private LocalDateTime gradedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (gradedAt == null) {
            gradedAt = LocalDateTime.now();
        }
        calculateTotalScore();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateTotalScore();
    }

    public void calculateTotalScore() {
        // weights: attendance 20%, midterm 30%, final 50%
        BigDecimal attendance = attendanceScore != null ? attendanceScore : BigDecimal.ZERO;
        BigDecimal midterm = midtermScore != null ? midtermScore : BigDecimal.ZERO;
        BigDecimal finalS = finalScore != null ? finalScore : BigDecimal.ZERO;

        BigDecimal attendancePart = attendance.multiply(new BigDecimal("0.2"));
        BigDecimal midtermPart = midterm.multiply(new BigDecimal("0.3"));
        BigDecimal finalPart = finalS.multiply(new BigDecimal("0.5"));

        this.totalScore = attendancePart.add(midtermPart).add(finalPart);
    }
}
