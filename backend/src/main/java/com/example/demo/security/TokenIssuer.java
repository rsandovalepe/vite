package com.example.demo.security;

import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jose.KeyLengthException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class TokenIssuer {
    private final JWSSigner signer;
    private final String issuer = "your-app";

    public TokenIssuer(@Value("${auth.jwt.secretB64}") String secretB64) throws KeyLengthException {
        this.signer = new MACSigner(Base64.getDecoder().decode(secretB64));
    }

    public String issue(String sub, String gid, String scope, String imageId, Duration ttl) throws JOSEException {
        var now = new Date();
        var exp = Date.from(Instant.now().plus(ttl));
        var claims = new JWTClaimsSet.Builder()
                .issuer(issuer).audience("gallery")
                .subject(sub)
                .expirationTime(exp).notBeforeTime(now).issueTime(now)
                .jwtID(UUID.randomUUID().toString())
                .claim("gid", gid)
                .claim("scp", List.of(scope.split(" ")))
                .claim("img", imageId)
                .build();
        var jws = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
        jws.sign(signer);
        return jws.serialize();
    }
}
