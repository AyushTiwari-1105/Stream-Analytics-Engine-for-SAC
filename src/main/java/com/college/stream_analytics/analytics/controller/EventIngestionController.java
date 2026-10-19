package com.college.stream_analytics.analytics.controller;

import com.college.stream_analytics.analytics.dto.GenericEventDto;
import com.college.stream_analytics.analytics.entity.RawEvent;
import com.college.stream_analytics.analytics.repository.RawEventRepository;
import com.college.stream_analytics.analytics.service.SchemaValidationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/events")
public class EventIngestionController {

    private final SchemaValidationService validationService;
    private final RawEventRepository eventRepository;

    // Inject the new repository
    public EventIngestionController(SchemaValidationService validationService, RawEventRepository eventRepository) {
        this.validationService = validationService;
        this.eventRepository = eventRepository;
    }

    @PostMapping
    public ResponseEntity<?> ingestEvent(@Valid @RequestBody GenericEventDto eventDto) {
        try {
            // 1. Validate Payload
            List<String> validationErrors = validationService.validatePayload(
                    eventDto.getEventType(),
                    eventDto.getSchemaVersion(),
                    eventDto.getPayload()
            );

            if (!validationErrors.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Payload validation failed", "details", validationErrors));
            }

            // 2. Convert DTO to Entity and Save to PostgreSQL
            RawEvent rawEvent = new RawEvent();
            rawEvent.setEventId(eventDto.getEventId());
            rawEvent.setSourceId(eventDto.getSourceId());
            rawEvent.setEventType(eventDto.getEventType());
            rawEvent.setEventTimestamp(eventDto.getEventTimestamp());
            rawEvent.setPayload(eventDto.getPayload());

            eventRepository.save(rawEvent);

            return ResponseEntity.status(HttpStatus.ACCEPTED).body("Event accepted and stored successfully");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}