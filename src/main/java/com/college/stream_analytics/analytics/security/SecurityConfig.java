package com.college.stream_analytics.analytics.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final ApiKeyAuthFilter apiKeyAuthFilter;

    public SecurityConfig(ApiKeyAuthFilter apiKeyAuthFilter) {
        this.apiKeyAuthFilter = apiKeyAuthFilter;
    }

    /**
     * CORS configuration for the Vite development server.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "X-API-Key"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF because this is a stateless API, not a browser application
                .csrf(csrf -> csrf.disable())
                // Ensure no server-side sessions are created
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Enforce Role-Based Access Control
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS,"/**").permitAll()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/events/**").hasRole("PUBLISHER")
                        // Reject any other requests that aren't explicitly mapped above
                        .anyRequest().authenticated()
                )
                // Add our custom API Key filter before the default Spring authentication filter
                .addFilterBefore(apiKeyAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
