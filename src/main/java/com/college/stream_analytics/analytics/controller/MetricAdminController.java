package com.college.stream_analytics.analytics.controller;

import com.college.stream_analytics.analytics.entity.AggregatedMetric;
import com.college.stream_analytics.analytics.repository.AggregatedMetricRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Exposes aggregated telemetry metrics stored by MetricAggregationScheduler.
 * Secured by the existing /api/v1/admin/** → ROLE_ADMIN rule in SecurityConfig.
 */
@RestController
@RequestMapping("/api/v1/admin/metrics")
public class MetricAdminController {

    private final AggregatedMetricRepository metricRepository;

    public MetricAdminController(AggregatedMetricRepository metricRepository) {
        this.metricRepository = metricRepository;
    }

    /**
     * GET /api/v1/admin/metrics
     * Returns all rows from the aggregated_metrics table.
     * Requires X-API-Key: admin-secret-key-999 (ROLE_ADMIN).
     */
    @GetMapping
    public List<AggregatedMetric> listMetrics() {
        return metricRepository.findAll();
    }
}
