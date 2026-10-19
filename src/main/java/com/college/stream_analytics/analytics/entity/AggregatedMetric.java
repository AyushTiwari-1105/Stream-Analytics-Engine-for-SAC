package com.college.stream_analytics.analytics.entity;

import jakarta.persistence.*;

import java.time.Instant;


@Entity
@Table(name = "aggregated_metrics")
public class AggregatedMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String metricName;
    private String eventType;
    private Instant windowStart;
    private Instant windowEnd;
    private Double metricValue;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMetricName() {
        return metricName;
    }

    public void setMetricName(String metricName) {
        this.metricName = metricName;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Instant getWindowStart() {
        return windowStart;
    }

    public void setWindowStart(Instant windowStart) {
        this.windowStart = windowStart;
    }

    public Instant getWindowEnd() {
        return windowEnd;
    }

    public void setWindowEnd(Instant windowEnd) {
        this.windowEnd = windowEnd;
    }

    public Double getMetricValue() {
        return metricValue;
    }

    public void setMetricValue(Double metricValue) {
        this.metricValue = metricValue;
    }
}