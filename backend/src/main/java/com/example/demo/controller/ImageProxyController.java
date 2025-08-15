package com.example.demo.controller;

import java.io.IOException;
import java.time.Duration;

import com.example.demo.security.TokenVerifier;
import com.example.demo.security.ReplayGuard;
import com.example.demo.storage.FileSystemStore;
import com.example.demo.storage.FileSystemStore.InputStreamRange;
import com.nimbusds.jwt.JWTClaimsSet;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@RequestMapping("/img")
public class ImageProxyController {
    private final TokenVerifier verifier;
    private final ReplayGuard replay;
    private final FileSystemStore fs;

    @Value("${security.requireScope:image:read}") String requiredScope;
    @Value("${security.jtiTtlSeconds:900}") long jtiTtl;

    public ImageProxyController(TokenVerifier verifier, ReplayGuard replay, FileSystemStore fs) {
        this.verifier = verifier;
        this.replay = replay;
        this.fs = fs;
    }

    @GetMapping("/{galleryId}/{imageId}")
    public ResponseEntity<StreamingResponseBody> get(
            @PathVariable String galleryId,
            @PathVariable String imageId,
            @RequestParam(name = "token", required = false) String tokenQuery,
            @RequestHeader(name = "Authorization", required = false) String authz,
            @RequestHeader(name = "Range", required = false) String range) {

        String token = extractToken(tokenQuery, authz);
        JWTClaimsSet claims;
        try {
            claims = verifier.verify(token, galleryId, imageId, requiredScope);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String jti = claims.getJWTID();
        if (jti != null && !replay.recordJtiOnce(jti, Duration.ofSeconds(jtiTtl))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        InputStreamRange in;
        try {
            in = fs.open(keyFor(galleryId, imageId), range);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }

        long size = in.size();
        long start = in.start();
        long end = in.end();

        StreamingResponseBody body = os -> {
            try (var input = in.in()) {
                input.transferTo(os);
            }
        };

        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        h.set("Accept-Ranges", "bytes");
        h.setCacheControl("private, max-age=120");
        h.set("Content-Length", String.valueOf((end - start) + 1));
        if (range != null) {
            h.set("Content-Range", "bytes " + start + "-" + end + "/" + size);
            return new ResponseEntity<>(body, h, HttpStatus.PARTIAL_CONTENT);
        }
        return new ResponseEntity<>(body, h, HttpStatus.OK);
    }

    private static String keyFor(String gid, String imageId) {
        return gid + "/" + imageId;
    }

    private static String extractToken(String tokenQuery, String authzHeader) {
        if (tokenQuery != null && !tokenQuery.isBlank()) return tokenQuery;
        if (authzHeader != null && authzHeader.startsWith("Bearer ")) return authzHeader.substring(7);
        throw new SecurityException("missing-token");
    }
}
