package com.careerpathmap.controller;

import com.careerpathmap.model.RoadmapRequest;
import com.careerpathmap.model.SyllabusRequest;
import com.careerpathmap.service.FallbackService;
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
    private final FallbackService fallbackService;
    private final ObjectMapper objectMapper;

    public RoadmapController(GroqService groqService, FallbackService fallbackService, ObjectMapper objectMapper) {
        this.groqService = groqService;
        this.fallbackService = fallbackService;
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
     */
    @GetMapping("/choices")
    public ResponseEntity<?> getChoices(@RequestParam String role) {
        try {
            log.info("Generating choices for role: {}", role);
            String json = groqService.generateChoices(role);
            JsonNode node = objectMapper.readTree(json);
            return ResponseEntity.ok(node);
        } catch (Exception e) {
            log.warn("Groq API unavailable/rate-limited for role '{}'. Serving fallback data. Error: {}", role, e.getMessage());
            try {
                String fallbackJson = fallbackService.getFallbackChoices(role);
                JsonNode fallbackNode = objectMapper.readTree(fallbackJson);
                return ResponseEntity.ok(fallbackNode);
            } catch (Exception ex) {
                return ResponseEntity.internalServerError().body(Map.of("error", "Failed to generate choices"));
            }
        }
    }

    /**
     * POST /api/roadmap
     */
    @PostMapping("/roadmap")
    public ResponseEntity<?> getRoadmap(@RequestBody RoadmapRequest request) {
        try {
            log.info("Generating roadmap for role: '{}', choice: '{}'", request.getRole(), request.getChoice());
            String json = groqService.generateRoadmap(request.getRole(), request.getChoice());
            JsonNode node = objectMapper.readTree(json);
            return ResponseEntity.ok(node);
        } catch (Exception e) {
            log.warn("Groq API unavailable/rate-limited for roadmap. Serving fallback data. Error: {}", e.getMessage());
            try {
                String fallbackJson = fallbackService.getFallbackRoadmap(request.getRole(), request.getChoice());
                JsonNode fallbackNode = objectMapper.readTree(fallbackJson);
                return ResponseEntity.ok(fallbackNode);
            } catch (Exception ex) {
                return ResponseEntity.internalServerError().body(Map.of("error", "Failed to generate roadmap"));
            }
        }
    }

    /**
     * POST /api/syllabus
     */
    @PostMapping("/syllabus")
    public ResponseEntity<?> getSyllabus(@RequestBody SyllabusRequest request) {
        try {
            log.info("Generating syllabus for skill: '{}' in role: '{}'", request.getSkill(), request.getRole());
            String json = groqService.generateSyllabus(request.getRole(), request.getChoice(), request.getSkill());
            JsonNode node = objectMapper.readTree(json);
            return ResponseEntity.ok(node);
        } catch (Exception e) {
            log.warn("Groq API unavailable/rate-limited for syllabus. Serving fallback data. Error: {}", e.getMessage());
            try {
                String fallbackJson = fallbackService.getFallbackSyllabus(request.getRole(), request.getChoice(), request.getSkill());
                JsonNode fallbackNode = objectMapper.readTree(fallbackJson);
                return ResponseEntity.ok(fallbackNode);
            } catch (Exception ex) {
                return ResponseEntity.internalServerError().body(Map.of("error", "Failed to generate syllabus"));
            }
        }
    }
}
