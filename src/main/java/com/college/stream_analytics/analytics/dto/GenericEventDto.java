package com.college.stream_analytics.analytics.dto;

import tools.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class GenericEventDto {

    @NotBlank(message = "eventId is required")
    private String eventId;

    @NotBlank(message = "sourceId is required")
    private String sourceId;

    @NotBlank(message = "eventType is required")
    private String eventType;

    @NotNull(message = "eventTimestamp is required")
    private Instant eventTimestamp;

    @NotNull(message = "schemaVersion is required")
    private Integer schemaVersion;

    @NotNull(message = "payload is required")
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
    public Integer getSchemaVersion() { return schemaVersion; }
    public void setSchemaVersion(Integer schemaVersion) { this.schemaVersion = schemaVersion; }
    public JsonNode getPayload() { return payload; }
    public void setPayload(JsonNode payload) { this.payload = payload; }
}