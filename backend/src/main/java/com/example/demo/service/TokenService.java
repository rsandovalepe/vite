package com.example.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Set;

@Service
public class TokenService {
    private final JwtEncoder encoder;
    private static final Logger log = LoggerFactory.getLogger(TokenService.class);

    public TokenService(JwtEncoder encoder) {
        this.encoder = encoder;
    }

    public String generateToken(Long userId, Set<String> roles) {
        var now = Instant.now();
        var claims = JwtClaimsSet.builder()
                .subject(String.valueOf(userId))
                .claim("roles", roles)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(3600))
                .build();
        var headers = JwsHeader.with(MacAlgorithm.HS256).build();
        log.debug("Generated token for user {} with roles {}", userId, roles);
        return encoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
    }

    public String generateTempToken(String uuid) {
        var now = Instant.now();
        var claims = JwtClaimsSet.builder()
                .subject(uuid)
                .claim("roles", Set.of("USER"))
                .issuedAt(now)
                .expiresAt(now.plusSeconds(300))
                .build();
        var headers = JwsHeader.with(MacAlgorithm.HS256).build();
        log.debug("Generated temp token for uuid {}", uuid);
        return encoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
    }
}
