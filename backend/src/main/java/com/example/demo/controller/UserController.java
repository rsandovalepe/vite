package com.example.demo.controller;

import com.example.demo.model.rbac.User;
import com.example.demo.model.QRCode;
import com.example.demo.service.UserService;
import com.example.demo.service.TotpService;
import com.example.demo.service.QRCodeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final TotpService totpService;
    private final QRCodeService qrCodeService;
    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    public UserController(UserService userService, TotpService totpService, QRCodeService qrCodeService) {
        this.userService = userService;
        this.totpService = totpService;
        this.qrCodeService = qrCodeService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<User> all(@RequestParam(defaultValue = "0") int page,
                          @RequestParam(defaultValue = "10") int size) {
        log.debug("Fetching users page {} size {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        return userService.findAll(pageable);
    }
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public User create(@RequestBody User user) {
        log.info("Creating user {}", user.getUsername());
        return userService.save(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public User update(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        log.info("Updating user {}", id);
        return userService.update(user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        log.info("Deleting user {}", id);
        userService.delete(id);
    }

    @GetMapping("/{id}/qrcodes")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<QRCode> qrCodes(@PathVariable Long id,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "10") int size) {
        log.debug("Fetching QR codes for user {} page {} size {}", id, page, size);
        Pageable pageable = PageRequest.of(page, size);
        return qrCodeService.findAllByUserId(id, pageable);
    }

    @PostMapping("/me/2fa/setup")
    public Map<String, String> setup2fa(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        var user = userService.findById(userId).orElseThrow();
        String secret = totpService.generateSecret();
        String otpAuth = totpService.getOtpAuthURL(user.getUsername(), secret);
        String qr = totpService.generateQrImage(otpAuth);
        return Map.of("secret", secret, "otpauthUrl", otpAuth, "qrImage", qr);
    }

    @PostMapping("/me/2fa/verify")
    public Map<String, String> verify2fa(Authentication authentication,
                                         @RequestBody Map<String, String> payload) {
        Long userId = Long.parseLong(authentication.getName());
        String secret = payload.get("secret");
        String codeStr = payload.get("code");
        if (secret == null || codeStr == null) {
            return Map.of("status", "missing");
        }
        try {
            int code = Integer.parseInt(codeStr);
            if (totpService.verifyCode(secret, code)) {
                userService.updateTotpSecret(userId, secret);
                return Map.of("status", "verified");
            }
        } catch (NumberFormatException ignored) {
        }
        return Map.of("status", "invalid");
    }

    @GetMapping("/me/2fa/status")
    public Map<String, Boolean> twoFaStatus(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        var user = userService.findById(userId).orElseThrow();
        boolean enabled = user.getTotpSecret() != null;
        return Map.of("enabled", enabled);
    }

    @DeleteMapping("/me/2fa")
    public Map<String, String> disable2fa(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        userService.updateTotpSecret(userId, null);
        return Map.of("status", "disabled");
    }
}
