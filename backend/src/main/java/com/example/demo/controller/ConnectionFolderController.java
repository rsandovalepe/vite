package com.example.demo.controller;

import com.example.demo.model.ConnectionFolder;
import com.example.demo.service.ConnectionFolderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/folder-connections")
public class ConnectionFolderController {

    private final ConnectionFolderService service;
    private static final Logger log = LoggerFactory.getLogger(ConnectionFolderController.class);

    public ConnectionFolderController(ConnectionFolderService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ConnectionFolder> all() {
        log.debug("Fetching all folder connections");
        return service.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ConnectionFolder get(@PathVariable Long id) {
        log.debug("Fetching folder connection {}", id);
        return service.findById(id).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ConnectionFolder create(@RequestBody ConnectionFolder connection) {
        log.info("Creating folder connection {}", connection.getName());
        return service.save(connection);
    }

    @PostMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    public boolean test(@RequestBody ConnectionFolder connection) {
        log.info("Testing folder path {}", connection.getPath());
        return service.testConnection(connection);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ConnectionFolder update(@PathVariable Long id, @RequestBody ConnectionFolder connection) {
        connection.setId(id);
        log.info("Updating folder connection {}", id);
        return service.update(connection);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        log.info("Deleting folder connection {}", id);
        service.delete(id);
    }
}

