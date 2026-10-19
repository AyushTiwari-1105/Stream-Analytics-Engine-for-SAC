package com.college.stream_analytics.analytics.controller;

import com.college.stream_analytics.analytics.entity.EventSchema;
import com.college.stream_analytics.analytics.repository.EventSchemaRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/schemas")
public class SchemaAdminController {

    private final EventSchemaRepository schemaRepository;

    public SchemaAdminController(EventSchemaRepository schemaRepository) {
        this.schemaRepository = schemaRepository;
    }

    @PostMapping
    public String registerSchema(@RequestBody EventSchema eventSchema) {
        schemaRepository.save(eventSchema);
        return "Schema registered successfully for: " + eventSchema.getEventType();
    }
}