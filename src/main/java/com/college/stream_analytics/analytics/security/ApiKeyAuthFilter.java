package com.college.stream_analytics.analytics.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "X-API-Key";

//    @Value("${api.security.admin-key}")
    private final String adminKey;

//    @Value("${api.security.publisher-key}")
    private final String publisherKey;

    public ApiKeyAuthFilter(@Value("${spring.api.security.admin-key}") String adminKey,@Value("${spring.api.security.publisher-key}") String publisherKey){
        this.adminKey= adminKey;
        this.publisherKey= publisherKey;
    }



    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestApiKey = request.getHeader(API_KEY_HEADER);

        if (requestApiKey != null) {
            if (requestApiKey.equals(adminKey)) {
                setAuthentication("ADMIN_USER", "ROLE_ADMIN");
            } else if (requestApiKey.equals(publisherKey)) {
                setAuthentication("PUBLISHER_SYSTEM", "ROLE_PUBLISHER");
            }
        }

        // Continue the request (Spring Security will block it later if authentication wasn't set)
        filterChain.doFilter(request, response);
    }

    private void setAuthentication(String principal, String role) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                Collections.singletonList(new SimpleGrantedAuthority(role))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}