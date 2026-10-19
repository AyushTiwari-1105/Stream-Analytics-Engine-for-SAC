package com.college.stream_analytics.analytics.service;

import com.college.stream_analytics.analytics.entity.AggregatedMetric;
import com.college.stream_analytics.analytics.repository.AggregatedMetricRepository;
import com.college.stream_analytics.analytics.repository.RawEventRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class MetricAggregationScheduler {

    private final RawEventRepository eventRepository;
    private final AggregatedMetricRepository metricRepository;

    public MetricAggregationScheduler(RawEventRepository eventRepository, AggregatedMetricRepository metricRepository) {
        this.eventRepository = eventRepository;
        this.metricRepository = metricRepository;
    }

    @Scheduled(fixedRate = 30000)
    public void aggregateLastMinuteWindow() {
        Instant now = Instant.now();
        Instant oneMinuteAgo= now.minus(24, ChronoUnit.HOURS);

        System.out.println("Running stream aggregation for window: " + oneMinuteAgo + " to " + now);

        //Counting Login Attempts
        long loginCount = eventRepository.countByEventTypeAndEventTimestampGreaterThanEqual("USER_LOGIN", oneMinuteAgo);

        AggregatedMetric loginMetric = new AggregatedMetric();
        loginMetric.setMetricName("total_login_attempts");
        loginMetric.setEventType("USER_LOGIN");
        loginMetric.setWindowStart(oneMinuteAgo);
        loginMetric.setWindowEnd(now);
        loginMetric.setMetricValue((double) loginCount);

        metricRepository.save(loginMetric);

        // Calculating Bytes Transferred
        Double bytesTransferred = eventRepository.sumBytesTransferred("DOWNLOAD_COMPLETED", oneMinuteAgo);

        AggregatedMetric transferMetric = new AggregatedMetric();
        transferMetric.setMetricName("total_bytes_transferred");
        transferMetric.setEventType("DOWNLOAD_COMPLETED");
        transferMetric.setWindowStart(oneMinuteAgo);
        transferMetric.setWindowEnd(now);
        transferMetric.setMetricValue(bytesTransferred);

        metricRepository.save(transferMetric);

        System.out.println("Aggregation complete. Metrics saved.");
    }
}