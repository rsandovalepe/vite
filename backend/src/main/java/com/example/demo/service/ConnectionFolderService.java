package com.example.demo.service;

import com.example.demo.model.ConnectionFolder;
import com.example.demo.repository.ConnectionFolderRepository;
import com.example.demo.repository.QRCodeRepository;
import com.example.demo.repository.QRCodeItemRepository;
import com.example.demo.camel.ConnectionFolderRouteBuilder;
import org.apache.camel.CamelContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class ConnectionFolderService {
    private final ConnectionFolderRepository repository;
    private final QRCodeRepository qrCodeRepository;
    private final QRCodeItemRepository itemRepository;
    private final CamelContext camelContext;
    private final String photoFolderPath;
    private final String pollingFolderPath;
    private static final Logger log = LoggerFactory.getLogger(ConnectionFolderService.class);

    public ConnectionFolderService(ConnectionFolderRepository repository,
                                   QRCodeRepository qrCodeRepository,
                                   QRCodeItemRepository itemRepository,
                                   CamelContext camelContext,
                                   @Value("${photo_folder_path}") String photoFolderPath,
                                   @Value("${polling_folder_path}") String pollingFolderPath) {
        this.repository = repository;
        this.qrCodeRepository = qrCodeRepository;
        this.itemRepository = itemRepository;
        this.camelContext = camelContext;
        this.photoFolderPath = photoFolderPath;
        this.pollingFolderPath = pollingFolderPath;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initRoutes() {
        repository.findAll().forEach(connection -> {
            addCamelRoute(connection);
            if (connection.isEnabled()) {
                startCamelRoute(connection.getId().toString());
            }
        });
    }

    public List<ConnectionFolder> findAll() {
        log.debug("Retrieving all folder connections");
        return repository.findAll();
    }

    public Optional<ConnectionFolder> findById(Long id) {
        log.debug("Finding folder connection {}", id);
        return repository.findById(id);
    }

    public ConnectionFolder save(ConnectionFolder connection) {
        log.info("Saving folder connection {}", connection.getName());
        ConnectionFolder saved = repository.save(connection);
        addCamelRoute(saved);
        return saved;
    }

    public ConnectionFolder update(ConnectionFolder connection) {
        log.info("Updating folder connection {}", connection.getId());
        return repository.findById(connection.getId())
                .map(existing -> {
                    boolean wasEnabled = existing.isEnabled();
                    existing.setName(connection.getName());
                    existing.setPath(connection.getPath());
                    existing.setEnabled(connection.isEnabled());
                    ConnectionFolder updated = repository.save(existing);
                    if (!wasEnabled && updated.isEnabled()) {
                        startCamelRoute(updated.getId().toString());
                    }
                    return updated;
                })
                .orElseThrow();
    }

    public void delete(Long id) {
        log.info("Deleting folder connection {}", id);
        repository.deleteById(id);
    }

    public boolean testConnection(ConnectionFolder connection) {
        try {
            if (connection.getPath() == null || connection.getPath().isBlank()) {
                return false;
            }
            Path path = Paths.get(connection.getPath());
            return Files.exists(path) && Files.isDirectory(path);
        } catch (Exception e) {
            log.warn("Folder path validation failed", e);
            return false;
        }
    }

    private void addCamelRoute(ConnectionFolder connection) {
        try {
            String fullPath = pollingFolderPath + connection.getPath();
            log.debug("addCamelRoute, Path: {}", fullPath);
            camelContext.addRoutes(new ConnectionFolderRouteBuilder(photoFolderPath, fullPath, connection, qrCodeRepository, itemRepository));
        } catch (Exception e) {
            log.error("Failed to add Camel route for connection {}", connection.getId(), e);
        }
    }

    private void startCamelRoute(String routeId) {
        try {
            camelContext.getRouteController().startRoute(routeId);
        } catch (Exception e) {
            log.error("Failed to start Camel route {}", routeId, e);
        }
    }
}

