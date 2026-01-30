package com.example.studentmanagement.controller;

import com.example.studentmanagement.dto.request.ClassRequest;
import com.example.studentmanagement.dto.response.ClassResponse;
import com.example.studentmanagement.entity.enums.ClassStatus;
import com.example.studentmanagement.service.ClassService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    @GetMapping
    public ResponseEntity<List<ClassResponse>> getAllClasses() {
        return ResponseEntity.ok(classService.getAllClasses());
    }

    @GetMapping("/available")
    public ResponseEntity<List<ClassResponse>> getAvailableClasses() {
        return ResponseEntity.ok(classService.getAvailableClasses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassResponse> getClassById(@PathVariable Long id) {
        return ResponseEntity.ok(classService.getClassById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassResponse> createClass(@Valid @RequestBody ClassRequest request) {
        return new ResponseEntity<>(classService.createClass(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ClassResponse> updateClass(@PathVariable Long id, @RequestBody ClassRequest request) {
        return ResponseEntity.ok(classService.updateClass(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClass(@PathVariable Long id) {
        classService.deleteClass(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ClassResponse>> getClassesByCourseId(@PathVariable Long courseId) {
        return ResponseEntity.ok(classService.getClassesByCourseId(courseId));
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<ClassResponse>> getClassesByTeacherId(@PathVariable Long teacherId) {
        return ResponseEntity.ok(classService.getClassesByTeacherId(teacherId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ClassResponse>> getClassesByStatus(@PathVariable ClassStatus status) {
        return ResponseEntity.ok(classService.getClassesByStatus(status));
    }

    @GetMapping("/{id}/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> getStudentsInClass(@PathVariable Long id) {
        return ResponseEntity.ok(classService.getStudentsInClass(id));
    }
}
