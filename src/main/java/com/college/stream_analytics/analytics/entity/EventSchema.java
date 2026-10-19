package com.college.stream_analytics.analytics.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "event_schemas")
public class EventSchema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String eventType;

    @Column(nullable = false)
    private Integer schemaVersion;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String jsonSchemaDefinition;

    // Standard Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public Integer getSchemaVersion() { return schemaVersion; }
    public void setSchemaVersion(Integer schemaVersion) { this.schemaVersion = schemaVersion; }
    public String getJsonSchemaDefinition() { return jsonSchemaDefinition; }
    public void setJsonSchemaDefinition(String jsonSchemaDefinition) { this.jsonSchemaDefinition = jsonSchemaDefinition; }
}