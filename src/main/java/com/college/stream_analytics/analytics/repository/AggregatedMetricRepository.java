package com.college.stream_analytics.analytics.repository;

import com.college.stream_analytics.analytics.entity.AggregatedMetric;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AggregatedMetricRepository extends JpaRepository<AggregatedMetric, Long> {
}