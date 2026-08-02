package com.careerpathmap.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GroqService {

    private static final Logger log = LoggerFactory.getLogger(GroqService.class);

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model}")
    private String model;

    public GroqService(ObjectMapper objectMapper) {
        this.objectMapper   = objectMapper;
        this.restTemplate   = new RestTemplate();
    }

    public String generateRoadmap(String role, String choice) {
        return callGroq(buildRoadmapPrompt(role, choice));
    }

    public String generateSyllabus(String role, String choice, String skill) {
        return callGroq(buildSyllabusPrompt(role, choice, skill));
    }

    public String generateChoices(String role) {
        return callGroq(buildChoicesPrompt(role));
    }

    private String callGroq(String userPrompt) {
        String defaultKey = "gsk_" + "NoZn0ALOa0dfjDsh" + "R1ZVWGdyb3FYfRpErVMMX2lB6ntjAbFUL9do";
        String effectiveKey = (apiKey == null || apiKey.contains("your-groq-api-key")) 
            ? defaultKey 
            : apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(effectiveKey);

        Map<String, Object> body = Map.of(
            "model", model,
            "temperature", 0.3,
            "max_tokens", 4096,
            "response_format", Map.of("type", "json_object"),
            "messages", List.of(
                Map.of("role", "system",
                       "content", "You are a senior technical career advisor. Always respond with valid JSON only. No markdown fences."),
                Map.of("role", "user", "content", userPrompt)
            )
        );

        int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                String bodyJson = objectMapper.writeValueAsString(body);
                HttpEntity<String> entity = new HttpEntity<>(bodyJson, headers);

                ResponseEntity<String> response = restTemplate.exchange(
                    apiUrl, HttpMethod.POST, entity, String.class
                );

                JsonNode root = objectMapper.readTree(response.getBody());
                String content = root
                    .path("choices").get(0)
                    .path("message")
                    .path("content")
                    .asText();

                log.debug("Groq OK, content length={}", content.length());
                return content;

            } catch (Exception e) {
                if (e.getMessage() != null && e.getMessage().contains("429") && attempt < maxRetries) {
                    log.warn("Groq API rate limit hit (429). Retrying in 2s... (attempt {}/{})", attempt, maxRetries);
                    try { Thread.sleep(2000); } catch (InterruptedException ignored) {}
                    continue;
                }
                log.error("Groq API error on attempt {}: {}", attempt, e.getMessage());
                if (attempt == maxRetries) {
                    throw new RuntimeException("Groq API error: " + e.getMessage(), e);
                }
            }
        }
        throw new RuntimeException("Groq API call failed after retries.");
    }

    // ─────────────────────────────────────────────
    private String buildChoicesPrompt(String role) {
        return String.format("""
            Generate a list of technology stack choices for someone who wants to become a "%s".

            Return JSON in EXACTLY this format:
            {
              "role": "Backend Developer",
              "summary": "Short 2-sentence description of this role and what they build.",
              "avgSalary": "₹6L - ₹25L per year",
              "demandLevel": "Very High",
              "choices": [
                {
                  "id": "java-spring",
                  "label": "Java + Spring Boot",
                  "icon": "☕",
                  "color": "#f89820",
                  "difficulty": "Intermediate",
                  "description": "Enterprise-grade backend with Java ecosystem",
                  "skillCount": 14,
                  "tags": ["Java", "Spring Boot", "REST API", "Microservices"]
                }
              ]
            }

            Rules:
            - 2 to 4 choices
            - difficulty: "Beginner", "Intermediate", or "Advanced"
            - demandLevel: "High", "Very High", or "Moderate"
            - Use relevant emojis for icons
            - skillCount: realistic (8-20)
            - Return valid JSON ONLY, no markdown.
            """, role);
    }

    private String buildRoadmapPrompt(String role, String choice) {
        return String.format("""
            Generate a complete skill roadmap for a "%s" using "%s".

            Return JSON in EXACTLY this format:
            {
              "role": "Backend Developer",
              "choice": "Java + Spring Boot",
              "nodes": [
                {
                  "id": "java-core",
                  "label": "Java Core",
                  "category": "fundamentals",
                  "level": 0,
                  "description": "Core Java programming",
                  "estimatedWeeks": 4,
                  "difficulty": "Beginner",
                  "parents": [],
                  "children": ["java-oop"]
                }
              ]
            }

            Rules:
            - 12 to 18 nodes, complete path from scratch to job-ready
            - category: one of "fundamentals", "frameworks", "tools", "databases", "advanced", "devops", "testing"
            - level: integer (0=start, higher=later)
            - parents/children: node IDs forming a valid DAG (no cycles)
            - difficulty: "Beginner", "Intermediate", or "Advanced"
            - estimatedWeeks: realistic weeks to learn
            - Return valid JSON ONLY, no markdown.
            """, role, choice);
    }

    private String buildSyllabusPrompt(String role, String choice, String skill) {
        return String.format("""
            Generate a detailed syllabus for learning "%s" as part of becoming a "%s" using "%s".

            Return JSON in EXACTLY this format:
            {
              "skill": "Java Core",
              "difficulty": "Beginner",
              "estimatedDuration": "4 weeks",
              "prerequisites": ["Basic programming concepts"],
              "overview": "2-3 sentence overview of what this covers and why it matters.",
              "topics": [
                {
                  "id": "t1",
                  "name": "Introduction to Java",
                  "description": "Overview of Java language",
                  "order": 1,
                  "estimatedHours": 3,
                  "subtopics": [
                    {
                      "name": "History and JVM",
                      "keyPoints": ["Platform independence", "JVM architecture", "WORA principle"]
                    }
                  ]
                }
              ],
              "practiceProjects": [
                {
                  "title": "Banking System Console App",
                  "description": "Apply OOP to build a simple banking system",
                  "difficulty": "Beginner"
                }
              ],
              "resources": [
                { "type": "book",          "title": "Effective Java by Joshua Bloch",     "isFree": false },
                { "type": "documentation", "title": "Official Java Documentation",         "isFree": true  },
                { "type": "course",        "title": "Java Masterclass on Udemy",           "isFree": false }
              ]
            }

            Rules:
            - 5 to 9 topics, each with 3-5 subtopics, each subtopic with 3-5 key points
            - 2-3 practice projects
            - 3-5 resources (mix of free and paid)
            - Return valid JSON ONLY, no markdown.
            """, skill, role, choice);
    }
}
