package com.example.demo.controller;

import com.example.demo.model.rbac.UserRole;
import com.example.demo.service.UserRoleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user-roles")
public class UserRoleController {

    private final UserRoleService service;
    private static final Logger log = LoggerFactory.getLogger(UserRoleController.class);

    public UserRoleController(UserRoleService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserRole> all(@RequestParam(defaultValue = "0") int page,
                              @RequestParam(defaultValue = "10") int size) {
        log.debug("Fetching user roles page {} size {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        return service.findAll(pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserRole get(@PathVariable Long id) {
        log.debug("Fetching user role {}", id);
        return service.findById(id).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserRole create(@RequestBody UserRole userRole) {
        log.info("Creating user role for user {}", userRole.getUser().getId());
        return service.save(userRole);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserRole update(@PathVariable Long id, @RequestBody UserRole userRole) {
        userRole.setId(id);
        log.info("Updating user role {}", id);
        return service.update(userRole);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        log.info("Deleting user role {}", id);
        service.delete(id);
    }
}
