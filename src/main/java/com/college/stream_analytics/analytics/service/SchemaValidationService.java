package com.college.stream_analytics.analytics.service;

import com.college.stream_analytics.analytics.entity.EventSchema;
import com.college.stream_analytics.analytics.repository.EventSchemaRepository;
import tools.jackson.databind.JsonNode;

// Modern NetworkNT 3.x Imports
import com.networknt.schema.Schema;
import com.networknt.schema.SchemaRegistry;
import com.networknt.schema.SpecificationVersion;
import com.networknt.schema.Error;
import com.networknt.schema.InputFormat;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SchemaValidationService {

    private final EventSchemaRepository schemaRepository;
    private final SchemaRegistry schemaRegistry;

    public SchemaValidationService(EventSchemaRepository schemaRepository) {
        this.schemaRepository = schemaRepository;
        // Configure the registry to support standard Draft 7 schemas
        this.schemaRegistry = SchemaRegistry.withDefaultDialect(SpecificationVersion.DRAFT_7);
    }

    public List<String> validatePayload(String eventType, Integer schemaVersion, JsonNode payload) {
        EventSchema schemaConfig = schemaRepository.findByEventTypeAndSchemaVersion(eventType, schemaVersion)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unsupported event type or version: " + eventType + " v" + schemaVersion));

        try {
            // 1. Fetch the schema directly from the string in the database
            Schema schema = schemaRegistry.getSchema(schemaConfig.getJsonSchemaDefinition(), InputFormat.JSON);

            // 2. Validate the incoming Jackson 3 JsonNode payload
            // (Converting to string guarantees format compatibility with the validator)
            List<Error> validationResult = schema.validate(payload.toString(), InputFormat.JSON);

            // 3. Return the formatted error messages
            return validationResult.stream()
                    .map(Error::toString) // toString() automatically prepends the JSON path where the error occurred
                    .collect(Collectors.toList());

        } catch (Exception e) {
            throw new RuntimeException("Failed to process schema validation", e);
        }
    }
}