package com.careerpathmap.model;

public class SyllabusRequest {
    private String role;
    private String choice;
    private String skill;
    private String skillDescription;

    public SyllabusRequest() {}

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getChoice() { return choice; }
    public void setChoice(String choice) { this.choice = choice; }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public String getSkillDescription() { return skillDescription; }
    public void setSkillDescription(String skillDescription) { this.skillDescription = skillDescription; }
}
