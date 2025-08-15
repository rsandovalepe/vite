package com.example.demo.controller;

import com.example.demo.model.QRCode;
import com.example.demo.service.QRCodeService;
import com.example.demo.service.TokenService;
import com.example.demo.service.UserService;
import com.example.demo.model.rbac.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/qrcodes")
public class QRCodeController {

    private final QRCodeService service;
    private final TokenService tokenService;
    private final UserService userService;
    private static final Logger log = LoggerFactory.getLogger(QRCodeController.class);

    public QRCodeController(QRCodeService service, TokenService tokenService, UserService userService) {
        this.service = service;
        this.tokenService = tokenService;
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Page<QRCode> all(@RequestParam(defaultValue = "0") int page,
                            @RequestParam(defaultValue = "10") int size,
                            Authentication authentication) {
        log.debug("Fetching QR codes page {} size {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return service.findAll(pageable);
        }
        Long userId = Long.parseLong(authentication.getName());
        return service.findAllByUserId(userId, pageable);
    }

    @GetMapping("/uuid/{uuid}")
    public QRCode getByUuid(@PathVariable String uuid) {
        log.debug("Fetching QR code {}", uuid);
        return service.findByUuid(uuid).orElseThrow();
    }

    @GetMapping("/{uuid}/token")
    public java.util.Map<String, String> getTempToken(@PathVariable String uuid) {
        log.debug("Generating temp token for qr code {}", uuid);
        return java.util.Map.of("token", tokenService.generateTempToken(uuid));
    }

    @GetMapping("/{id}")
    public QRCode get(@PathVariable Long id) {
        log.debug("Fetching QR code {}", id);
        return service.findById(id).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public QRCode create(@RequestBody QRCode qrCode, Authentication authentication) {
        log.info("Creating QR code with description {}", qrCode.getDescription());
        Long userId = Long.parseLong(authentication.getName());
        User user = userService.findById(userId).orElseThrow();
        qrCode.setCreatedBy(user.getUsername());
        qrCode.setUser(user);
        return service.save(qrCode);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public QRCode update(@PathVariable Long id, @RequestBody QRCode qrCode) {
        qrCode.setId(id);
        log.info("Updating QR code {}", id);
        return service.update(qrCode);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public void delete(@PathVariable Long id) {
        log.info("Deleting QR code {}", id);
        service.delete(id);
    }

    @DeleteMapping("/uuid/{uuid}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public void deleteByUuid(@PathVariable String uuid) {
        log.info("Deleting QR code {}", uuid);
        service.deleteByUuid(uuid);
    }
}
