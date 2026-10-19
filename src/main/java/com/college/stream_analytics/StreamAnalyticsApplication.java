package com.college.stream_analytics;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class StreamAnalyticsApplication {


	public static void main(String[] args) {
		SpringApplication.run(StreamAnalyticsApplication.class, args);
	}

}
