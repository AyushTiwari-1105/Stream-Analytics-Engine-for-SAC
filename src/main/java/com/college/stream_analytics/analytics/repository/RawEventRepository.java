package com.college.stream_analytics.analytics.repository;

import com.college.stream_analytics.analytics.entity.RawEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface RawEventRepository extends JpaRepository<RawEvent, String> {

    // 1. A standard JPA query to count total events in a time window
    long countByEventTypeAndEventTimestampGreaterThanEqual(String eventType, Instant timestamp);

    // 2. A Native Postgres JSONB query extracting and summing a value from inside the dynamic payload
    @Query(value = "SELECT COALESCE(SUM(CAST(payload->>'bytesTransferred' AS NUMERIC)), 0) " +
            "FROM raw_events " +
            "WHERE event_type = :eventType AND event_timestamp >= :since",
            nativeQuery = true)
    Double sumBytesTransferred(@Param("eventType") String eventType, @Param("since") Instant since);
}