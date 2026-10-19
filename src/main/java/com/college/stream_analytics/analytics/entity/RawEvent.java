package com.college.stream_analytics.analytics.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import tools.jackson.databind.JsonNode;

import java.time.Instant;


@Entity
@Table(name = "raw_events")
public class RawEvent {

    @Id
    private String eventId; // Using the incoming eventId as the Primary Key for deduplication

    @Column(nullable = false)
    private String sourceId;

    @Column(nullable = false)
    private String eventType;

    @Column(nullable = false)
    private Instant eventTimestamp;

    // Tells Hibernate to map this directly to a PostgreSQL JSONB column
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private JsonNode payload;

    // Standard Getters and Setters
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public String getSourceId() { return sourceId; }
    public void setSourceId(String sourceId) { this.sourceId = sourceId; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public Instant getEventTimestamp() { return eventTimestamp; }
    public void setEventTimestamp(Instant eventTimestamp) { this.eventTimestamp = eventTimestamp; }
    public JsonNode getPayload() { return payload; }
    public void setPayload(JsonNode payload) { this.payload = payload; }
}