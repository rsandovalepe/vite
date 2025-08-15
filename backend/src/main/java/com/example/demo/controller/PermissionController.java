package com.example.demo.controller;

import com.example.demo.model.rbac.Permission;
import com.example.demo.service.PermissionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/permissions")
public class PermissionController {

    private final PermissionService service;
    private static final Logger log = LoggerFactory.getLogger(PermissionController.class);

    public PermissionController(PermissionService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<Permission> all(@RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "10") int size) {
        log.debug("Fetching permissions page {} size {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        return service.findAll(pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Permission get(@PathVariable Long id) {
        log.debug("Fetching permission {}", id);
        return service.findById(id).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Permission create(@RequestBody Permission permission) {
        log.info("Creating permission {}", permission.getName());
        return service.save(permission);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Permission update(@PathVariable Long id, @RequestBody Permission permission) {
        permission.setId(id);
        log.info("Updating permission {}", id);
        return service.update(permission);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        log.info("Deleting permission {}", id);
        service.delete(id);
    }
}
