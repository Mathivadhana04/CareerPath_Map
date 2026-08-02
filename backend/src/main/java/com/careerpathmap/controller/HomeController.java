package com.careerpathmap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> index() {
        return ResponseEntity.ok(Map.of(
            "service", "Career Pathmap Spring Boot Backend API",
            "status", "RUNNING",
            "frontendUrl", "http://localhost:5173",
            "endpoints", Map.of(
                "health", "/api/health",
                "choices", "GET /api/choices?role=...",
                "roadmap", "POST /api/roadmap",
                "syllabus", "POST /api/syllabus"
            )
        ));
    }
}
