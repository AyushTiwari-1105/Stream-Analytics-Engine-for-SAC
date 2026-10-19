package com.college.stream_analytics.analytics.repository;

import com.college.stream_analytics.analytics.entity.EventSchema;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EventSchemaRepository extends JpaRepository<EventSchema, Long> {
    Optional<EventSchema> findByEventTypeAndSchemaVersion(String eventType, Integer schemaVersion);
}