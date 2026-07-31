package com.careerpathmap.controller;

import com.careerpathmap.model.RoadmapRequest;
import com.careerpathmap.model.SyllabusRequest;
import com.careerpathmap.service.GroqService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class RoadmapController {

    private static final Logger log = LoggerFactory.getLogger(RoadmapController.class);

    private final GroqService groqService;
    private final ObjectMapper objectMapper;

    public RoadmapController(GroqService groqService, ObjectMapper objectMapper) {
        this.groqService = groqService;
        this.objectMapper = objectMapper;
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "Career Pathmap API"));
    }

    /**
     * GET /api/choices?role=Backend+Developer
     * Returns list of tech stack choices for a given role
     */
    @GetMapping("/choices")
    public ResponseEntity<?> getChoices(@RequestParam String role) {
        try {
            log.info("Generating choices for role: {}", role);
            String json = groqService.generateChoices(role);
            JsonNode node = objectMapper.readTree(json);
            return ResponseEntity.ok(node);
        } catch (Exception e) {
            log.error("Error generating choices for role '{}': {}", role, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to generate choices", "message", e.getMessage()));
        }
    }

    /**
     * POST /api/roadmap
     * Body: { "role": "Backend Developer", "choice": "Java + Spring Boot" }
     * Returns full skill tree as flowchart nodes
     */
    @PostMapping("/roadmap")
    public ResponseEntity<?> getRoadmap(@RequestBody RoadmapRequest request) {
        try {
            log.info("Generating roadmap for role: '{}', choice: '{}'", request.getRole(), request.getChoice());
            String json = groqService.generateRoadmap(request.getRole(), request.getChoice());
            JsonNode node = objectMapper.readTree(json);
            return ResponseEntity.ok(node);
        } catch (Exception e) {
            log.error("Error generating roadmap: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to generate roadmap", "message", e.getMessage()));
        }
    }

    /**
     * POST /api/syllabus
     * Body: { "role": "...", "choice": "...", "skill": "Java Core" }
     * Returns full detailed syllabus for a specific skill node
     */
    @PostMapping("/syllabus")
    public ResponseEntity<?> getSyllabus(@RequestBody SyllabusRequest request) {
        try {
            log.info("Generating syllabus for skill: '{}' in role: '{}'", request.getSkill(), request.getRole());
            String json = groqService.generateSyllabus(request.getRole(), request.getChoice(), request.getSkill());
            JsonNode node = objectMapper.readTree(json);
            return ResponseEntity.ok(node);
        } catch (Exception e) {
            log.error("Error generating syllabus: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to generate syllabus", "message", e.getMessage()));
        }
    }
}
