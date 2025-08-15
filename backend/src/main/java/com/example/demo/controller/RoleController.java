package com.example.demo.controller;

import com.example.demo.model.rbac.Role;
import com.example.demo.service.RoleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/roles")
public class RoleController {

    private final RoleService service;
    private static final Logger log = LoggerFactory.getLogger(RoleController.class);

    public RoleController(RoleService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<Role> all(@RequestParam(defaultValue = "0") int page,
                          @RequestParam(defaultValue = "10") int size) {
        log.debug("Fetching roles page {} size {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        return service.findAll(pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Role get(@PathVariable Long id) {
        log.debug("Fetching role {}", id);
        return service.findById(id).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Role create(@RequestBody Role role) {
        log.info("Creating role {}", role.getName());
        return service.save(role);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Role update(@PathVariable Long id, @RequestBody Role role) {
        role.setId(id);
        log.info("Updating role {}", id);
        return service.update(role);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        log.info("Deleting role {}", id);
        service.delete(id);
    }
}
