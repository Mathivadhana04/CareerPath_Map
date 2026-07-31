package com.careerpathmap.model;

public class RoadmapRequest {
    private String role;
    private String choice;

    public RoadmapRequest() {}

    public RoadmapRequest(String role, String choice) {
        this.role = role;
        this.choice = choice;
    }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getChoice() { return choice; }
    public void setChoice(String choice) { this.choice = choice; }
}
