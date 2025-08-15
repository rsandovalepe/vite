package com.example.demo.service;

import com.example.demo.model.QRCode;
import com.example.demo.model.ConnectionFolder;
import com.example.demo.repository.QRCodeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class QRCodeService {
    private final QRCodeRepository repository;
    private final ConnectionFolderService connectionFolderService;
    private final String pollingFolderPath;
    private static final Logger log = LoggerFactory.getLogger(QRCodeService.class);

    public QRCodeService(QRCodeRepository repository,
                         ConnectionFolderService connectionFolderService,
                         @Value("${polling_folder_path}") String pollingFolderPath) {
        this.repository = repository;
        this.connectionFolderService = connectionFolderService;
        this.pollingFolderPath = pollingFolderPath;
    }

    public List<QRCode> findAll() {
        log.debug("Retrieving all QR codes");
        return repository.findAll();
    }

    public Page<QRCode> findAll(Pageable pageable) {
        log.debug("Retrieving QR codes page {}", pageable);
        return repository.findAll(pageable);
    }

    public Page<QRCode> findAllByCreatedBy(String createdBy, Pageable pageable) {
        log.debug("Retrieving QR codes for {} page {}", createdBy, pageable);
        return repository.findByCreatedBy(createdBy, pageable);
    }

    public Page<QRCode> findAllByUserId(Long userId, Pageable pageable) {
        log.debug("Retrieving QR codes for user {} page {}", userId, pageable);
        return repository.findByUserId(userId, pageable);
    }

    public Optional<QRCode> findById(Long id) {
        log.debug("Finding QR code {}", id);
        return repository.findById(id);
    }

    public Optional<QRCode> findByUuid(String uuid) {
        log.debug("Finding QR code {}", uuid);
        return repository.findByUuid(uuid);
    }

    public QRCode save(QRCode qrCode) {
        log.info("Saving QR code with description {}", qrCode.getDescription());
        QRCode saved = repository.save(qrCode);

        Path newDir = Paths.get(pollingFolderPath, saved.getUuid());
        try {
            Files.createDirectories(newDir);
            log.info("Created polling folder at {}", newDir);
        } catch (IOException e) {
            log.warn("Failed to create polling folder for {}", saved.getUuid(), e);
        }

        ConnectionFolder folder = new ConnectionFolder();
        folder.setPath(saved.getUuid());
        folder.setName("Default");
        folder.setEnabled(true);

        ConnectionFolder savedFolder = connectionFolderService.save(folder);
        saved.getConnectionFolders().add(savedFolder);

        return repository.save(saved);
    }

    public QRCode update(QRCode qrCode) {
        log.info("Updating QR code {}", qrCode.getId());
        return repository.findById(qrCode.getId())
                .map(existing -> {
                    // existing.setBlob(qrCode.getBlob());
                    existing.setDescription(qrCode.getDescription());
                    existing.setUpdatedBy(qrCode.getUpdatedBy());
                    existing.setConnectionFTPs(qrCode.getConnectionFTPs());
                    existing.setConnectionFolders(qrCode.getConnectionFolders());
                    existing.setType(qrCode.getType());
                    return repository.save(existing);
                })
                .orElseThrow();
    }

    @Transactional
    public void delete(Long id) {
        log.info("Deleting QR code {}", id);
        repository.deleteById(id);
    }

    @Transactional
    public void deleteByUuid(String uuid) {
        log.info("Deleting QR code {}", uuid);
        repository.deleteByUuid(uuid);
    }
}
