package com.example.demo.controller;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.example.demo.security.TokenIssuer;
import com.nimbusds.jose.JOSEException;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/img")
public class ImageTokenController {
    private final TokenIssuer issuer;

    public ImageTokenController(TokenIssuer issuer) {
        this.issuer = issuer;
    }

    @PostMapping("/{galleryId}/{imageId}/token")
    public Map<String, String> token(@PathVariable String galleryId, @PathVariable String imageId) throws JOSEException {
        String token = issuer.issue("user", galleryId, "image:read", imageId, Duration.ofMinutes(5));
        return Map.of("token", token);
    }

    public record TokenRequest(String galleryId, String imageId) {}

    public record TokenResponse(String galleryId, String imageId, String token) {}

    @PostMapping("/tokens")
    public List<TokenResponse> tokens(@RequestBody List<TokenRequest> images) throws JOSEException {
        List<TokenResponse> tokens = new ArrayList<>();
        for (TokenRequest img : images) {
            String token = issuer.issue("user", img.galleryId(), "image:read", img.imageId(), Duration.ofMinutes(5));
            tokens.add(new TokenResponse(img.galleryId(), img.imageId(), token));
        }
        return tokens;
    }
}
