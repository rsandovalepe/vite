package com.example.demo.controller;

import com.example.demo.service.TokenService;
import com.example.demo.service.UserService;
import com.example.demo.service.TotpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.util.StringUtils;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class AuthController {
    private final UserService userService;
    private final TokenService tokenService;
    private final TotpService totpService;
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    public AuthController(UserService userService, TokenService tokenService, TotpService totpService) {
        this.userService = userService;
        this.tokenService = tokenService;
        this.totpService = totpService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");
        String codeStr = payload.get("code");
        log.debug("Login attempt for {}", username);
        return userService.findByUsername(username)
                .filter(u -> u.getPassword().equals(password))
                .map(u -> {
                    String secret = u.getTotpSecret();
                    if (StringUtils.hasText(secret)) {
                        if (codeStr == null) {
                            return ResponseEntity.status(401).body(Map.of("error", "2FA code required"));
                        }
                        try {
                            int code = Integer.parseInt(codeStr);
                            if (!totpService.verifyCode(secret, code)) {
                                return ResponseEntity.status(401).body(Map.of("error", "Invalid 2FA code"));
                            }
                        } catch (NumberFormatException e) {
                            return ResponseEntity.status(401).body(Map.of("error", "Invalid 2FA code"));
                        }
                    }
                    var roleNames = u.getRoles().stream().map(r -> r.getName()).collect(Collectors.toSet());
                    var token = tokenService.generateToken(u.getId(), roleNames);
                    return ResponseEntity.ok(Map.of(
                            "token", token,
                            "roles", u.getRoles(),
                            "name", u.getName()
                    ));
                })
                .orElse(ResponseEntity.status(401).build());
    }
}
