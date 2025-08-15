package com.example.demo.security;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class ReplayGuard {
    private final Map<String, Instant> used = new ConcurrentHashMap<>();

    public boolean recordJtiOnce(String jti, Duration ttl) {
        Instant now = Instant.now();
        Instant expiry = now.plus(ttl);
        Instant existing = used.putIfAbsent(jti, expiry);
        if (existing != null && existing.isAfter(now)) {
            return false;
        }
        used.put(jti, expiry);
        return true;
    }
}
