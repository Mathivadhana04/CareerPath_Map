package com.careerpathmap.service;

import org.springframework.stereotype.Service;

@Service
public class FallbackService {

    public String getFallbackChoices(String role) {
        String cleanRole = (role != null) ? role : "Developer";
        return String.format("""
            {
              "role": "%s",
              "summary": "Core technology roadmap and career progression path for %s. Build real-world skills from scratch to advanced.",
              "avgSalary": "₹8L - ₹28L per year",
              "demandLevel": "Very High",
              "choices": [
                {
                  "id": "java-spring",
                  "label": "Java + Spring Boot",
                  "icon": "☕",
                  "color": "#f89820",
                  "difficulty": "Intermediate",
                  "description": "Enterprise-grade backend with Java & Spring Boot microservices ecosystem",
                  "skillCount": 12,
                  "tags": ["Java", "Spring Boot", "REST API", "Microservices"]
                },
                {
                  "id": "python-stack",
                  "label": "Python + Django / FastAPI",
                  "icon": "🐍",
                  "color": "#3b82f6",
                  "difficulty": "Beginner",
                  "description": "High-velocity development using Python, FastAPI & async data processing",
                  "skillCount": 10,
                  "tags": ["Python", "FastAPI", "PostgreSQL", "Docker"]
                },
                {
                  "id": "node-express",
                  "label": "Node.js + TypeScript",
                  "icon": "⚡",
                  "color": "#22d3ee",
                  "difficulty": "Intermediate",
                  "description": "Modern full-stack JavaScript runtime with Express.js & async I/O",
                  "skillCount": 11,
                  "tags": ["Node.js", "Express", "TypeScript", "MongoDB"]
                }
              ]
            }
            """, cleanRole, cleanRole);
    }

    public String getFallbackRoadmap(String role, String choice) {
        return String.format("""
            {
              "role": "%s",
              "choice": "%s",
              "nodes": [
                {
                  "id": "core-programming",
                  "label": "Programming Fundamentals",
                  "category": "fundamentals",
                  "level": 0,
                  "description": "Language syntax, data types, control flow & memory concepts",
                  "estimatedWeeks": 3,
                  "difficulty": "Beginner",
                  "parents": [],
                  "children": ["oop-concepts", "git-basics"]
                },
                {
                  "id": "oop-concepts",
                  "label": "OOP & Design Patterns",
                  "category": "fundamentals",
                  "level": 1,
                  "description": "Classes, Inheritance, Polymorphism & SOLID design principles",
                  "estimatedWeeks": 2,
                  "difficulty": "Beginner",
                  "parents": ["core-programming"],
                  "children": ["data-structures"]
                },
                {
                  "id": "git-basics",
                  "label": "Git & Version Control",
                  "category": "tools",
                  "level": 1,
                  "description": "Branching, merging, pull requests & GitHub workflow",
                  "estimatedWeeks": 1,
                  "difficulty": "Beginner",
                  "parents": ["core-programming"],
                  "children": ["database-fundamentals"]
                },
                {
                  "id": "data-structures",
                  "label": "Data Structures & Algorithms",
                  "category": "fundamentals",
                  "level": 2,
                  "description": "Arrays, HashMaps, Trees, Graphs & Complexity (Big-O)",
                  "estimatedWeeks": 4,
                  "difficulty": "Intermediate",
                  "parents": ["oop-concepts"],
                  "children": ["web-framework"]
                },
                {
                  "id": "database-fundamentals",
                  "label": "SQL & Relational Databases",
                  "category": "databases",
                  "level": 2,
                  "description": "MySQL/PostgreSQL, normalization, indexing & complex queries",
                  "estimatedWeeks": 2,
                  "difficulty": "Intermediate",
                  "parents": ["git-basics"],
                  "children": ["orm-data-access"]
                },
                {
                  "id": "web-framework",
                  "label": "%s Framework Core",
                  "category": "frameworks",
                  "level": 3,
                  "description": "Routing, middleware, request handling & dependency injection",
                  "estimatedWeeks": 4,
                  "difficulty": "Intermediate",
                  "parents": ["data-structures"],
                  "children": ["rest-api-design", "security-auth"]
                },
                {
                  "id": "orm-data-access",
                  "label": "ORM & Data Access",
                  "category": "databases",
                  "level": 3,
                  "description": "Entity mapping, migrations, query performance tuning",
                  "estimatedWeeks": 2,
                  "difficulty": "Intermediate",
                  "parents": ["database-fundamentals"],
                  "children": ["rest-api-design"]
                },
                {
                  "id": "rest-api-design",
                  "label": "RESTful API Architecture",
                  "category": "frameworks",
                  "level": 4,
                  "description": "HTTP methods, status codes, OpenAPI/Swagger & JSON formatting",
                  "estimatedWeeks": 2,
                  "difficulty": "Intermediate",
                  "parents": ["web-framework", "orm-data-access"],
                  "children": ["testing-qa", "docker-containers"]
                },
                {
                  "id": "security-auth",
                  "label": "Authentication & JWT",
                  "category": "advanced",
                  "level": 4,
                  "description": "OAuth2, JWT tokens, password hashing & CORS security",
                  "estimatedWeeks": 2,
                  "difficulty": "Advanced",
                  "parents": ["web-framework"],
                  "children": ["microservices"]
                },
                {
                  "id": "testing-qa",
                  "label": "Unit & Integration Testing",
                  "category": "testing",
                  "level": 5,
                  "description": "Automated testing, mocking dependencies & test coverage",
                  "estimatedWeeks": 2,
                  "difficulty": "Intermediate",
                  "parents": ["rest-api-design"],
                  "children": []
                },
                {
                  "id": "docker-containers",
                  "label": "Docker & Containerization",
                  "category": "devops",
                  "level": 5,
                  "description": "Dockerfiles, multi-stage builds & docker-compose services",
                  "estimatedWeeks": 2,
                  "difficulty": "Intermediate",
                  "parents": ["rest-api-design"],
                  "children": []
                },
                {
                  "id": "microservices",
                  "label": "Microservices & Cloud",
                  "category": "advanced",
                  "level": 5,
                  "description": "Distributed systems, API gateways, message queues & AWS deployment",
                  "estimatedWeeks": 3,
                  "difficulty": "Advanced",
                  "parents": ["security-auth"],
                  "children": []
                }
              ]
            }
            """, role, choice, choice);
    }

    public String getFallbackSyllabus(String role, String choice, String skill) {
        return String.format("""
            {
              "skill": "%s",
              "difficulty": "Intermediate",
              "estimatedDuration": "3 weeks",
              "prerequisites": ["Programming Fundamentals", "Computer Science Basics"],
              "overview": "Comprehensive deep dive into %s for becoming a professional %s. Master core patterns, real-world implementations, and production best practices.",
              "topics": [
                {
                  "id": "t1",
                  "name": "Core Principles & Architecture",
                  "description": "Understanding core concepts, environment setup, and fundamental architecture",
                  "order": 1,
                  "estimatedHours": 4,
                  "subtopics": [
                    {
                      "name": "Environment & Tooling Setup",
                      "keyPoints": ["Installing required SDKs and dependencies", "Configuring IDE & linting rules", "First runnable project structure"]
                    },
                    {
                      "name": "Key Architectural Concepts",
                      "keyPoints": ["Core paradigms and design patterns", "Memory management & execution lifecycle", "Standard library capabilities"]
                    }
                  ]
                },
                {
                  "id": "t2",
                  "name": "Practical Implementation & Patterns",
                  "description": "Building components, managing state, and handling asynchronous operations",
                  "order": 2,
                  "estimatedHours": 6,
                  "subtopics": [
                    {
                      "name": "Data Flow & State Management",
                      "keyPoints": ["Handling input/output data streams", "Managing local & application state", "Error handling strategies"]
                    },
                    {
                      "name": "Asynchronous & Concurrent Execution",
                      "keyPoints": ["Promises, futures, or thread pools", "Non-blocking I/O operations", "Avoiding race conditions"]
                    }
                  ]
                },
                {
                  "id": "t3",
                  "name": "Production Optimization & Security",
                  "description": "Performance tuning, security hardening, and deployment preparation",
                  "order": 3,
                  "estimatedHours": 5,
                  "subtopics": [
                    {
                      "name": "Security & Validation",
                      "keyPoints": ["Sanitizing user inputs", "Preventing common vulnerabilities", "Secure credential handling"]
                    },
                    {
                      "name": "Benchmarking & Performance Tuning",
                      "keyPoints": ["Profiling CPU & memory consumption", "Optimizing bottleneck operations", "Caching strategies"]
                    }
                  ]
                }
              ],
              "practiceProjects": [
                {
                  "title": "Production-Ready Service Module",
                  "description": "Build a fully tested, configurable service module implementing %s best practices",
                  "difficulty": "Intermediate"
                },
                {
                  "title": "Real-time Monitoring & Dashboard",
                  "description": "Create an interactive dashboard with metric collection & alerting",
                  "difficulty": "Advanced"
                }
              ],
              "resources": [
                { "type": "documentation", "title": "Official %s Documentation", "isFree": true },
                { "type": "course", "title": "Mastering %s — Practical Guide", "isFree": true },
                { "type": "book", "title": "Architecting Scalable Systems", "isFree": false }
              ]
            """, skill, skill, role, skill, skill, skill);
    }
}
