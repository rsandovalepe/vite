package com.example.demo.controller;

import com.example.demo.model.QRCodeItem;
import com.example.demo.service.QRCodeItemService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/qrcode-items")
public class QRCodeItemController {

    private final QRCodeItemService service;
    private static final Logger log = LoggerFactory.getLogger(QRCodeItemController.class);

    public QRCodeItemController(QRCodeItemService service) {
        this.service = service;
    }

    @GetMapping("/qr/{qrCodeId}")
    public Page<QRCodeItem> all(@PathVariable Long qrCodeId,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "10") int size,
                                @RequestParam(required = false) String uuid,
                                @RequestParam(defaultValue = "createdAt") String sortBy) {
        log.debug("Fetching items for QR code {} uuid {} page {} size {} sort {}", qrCodeId, uuid, page, size, sortBy);
        String sortField = "exifCreatedAt".equals(sortBy) ? "exifCreatedAt" : "createdAt";
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortField));
        return service.findByQrCodeId(qrCodeId, uuid, pageable);
    }

    @GetMapping("/qr/uuid/{qrCodeUuid}")
    public Page<QRCodeItem> allByUuid(@PathVariable String qrCodeUuid,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "10") int size,
                                      @RequestParam(required = false) String uuid,
                                      @RequestParam(defaultValue = "createdAt") String sortBy,
                                      Authentication authentication) {
        log.debug("Fetching items for QR code {} uuid {} page {} size {} sort {}", qrCodeUuid, uuid, page, size, sortBy);
        // boolean isPrivileged = authentication.getAuthorities().stream()
        //         .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_USER"));
        // if (!isPrivileged && !qrCodeUuid.equals(authentication.getName())) {
        //     throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        // }
        String sortField = "exifCreatedAt".equals(sortBy) ? "exifCreatedAt" : "createdAt";
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortField));
        return service.findByQrCodeUuid(qrCodeUuid, uuid, pageable);
    }

    @GetMapping("/{id}")
    public QRCodeItem get(@PathVariable Long id) {
        log.debug("Fetching QR code item {}", id);
        return service.findById(id).orElseThrow();
    }

    @PostMapping("/qr/{qrCodeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public QRCodeItem create(@PathVariable Long qrCodeId, @RequestBody QRCodeItem item) {
        log.info("Creating QR code item {} for code {}", item.getFileName(), qrCodeId);
        return service.save(qrCodeId, item);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public QRCodeItem update(@PathVariable Long id, @RequestBody QRCodeItem item) {
        item.setId(id);
        log.info("Updating QR code item {}", id);
        return service.update(item);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        log.info("Deleting QR code item {}", id);
        service.delete(id);
    }

    @DeleteMapping("/uuid/{uuid}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteByUuid(@PathVariable String uuid) {
        log.info("Deleting QR code item {}", uuid);
        service.deleteByUuid(uuid);
    }
}
