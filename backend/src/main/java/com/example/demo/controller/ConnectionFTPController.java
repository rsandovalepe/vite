package com.example.demo.controller;

import com.example.demo.model.ConnectionFTP;
import com.example.demo.service.ConnectionFTPService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ftp-connections")
public class ConnectionFTPController {

    private final ConnectionFTPService service;
    private static final Logger log = LoggerFactory.getLogger(ConnectionFTPController.class);

    public ConnectionFTPController(ConnectionFTPService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ConnectionFTP> all() {
        log.debug("Fetching all FTP connections");
        return service.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ConnectionFTP get(@PathVariable Long id) {
        log.debug("Fetching FTP connection {}", id);
        return service.findById(id).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ConnectionFTP create(@RequestBody ConnectionFTP connection) {
        log.info("Creating FTP connection to {}:{}", connection.getHostName(), connection.getPortNumber());
        return service.save(connection);
    }

    @PostMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    public boolean test(@RequestBody ConnectionFTP connection) {
        log.info("Testing FTP connection to {}:{}", connection.getHostName(), connection.getPortNumber());
        return service.testConnection(connection);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ConnectionFTP update(@PathVariable Long id, @RequestBody ConnectionFTP connection) {
        connection.setId(id);
        log.info("Updating FTP connection {}", id);
        return service.update(connection);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        log.info("Deleting FTP connection {}", id);
        service.delete(id);
    }
}
