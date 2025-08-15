package com.example.demo.service;

import com.example.demo.model.QRCode;
import com.example.demo.model.QRCodeItem;
import com.example.demo.repository.QRCodeItemRepository;
import com.example.demo.repository.QRCodeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class QRCodeItemService {
    private final QRCodeItemRepository repository;
    private final QRCodeRepository qrCodeRepository;
    private static final Logger log = LoggerFactory.getLogger(QRCodeItemService.class);

    public QRCodeItemService(QRCodeItemRepository repository, QRCodeRepository qrCodeRepository) {
        this.repository = repository;
        this.qrCodeRepository = qrCodeRepository;
    }

    public Page<QRCodeItem> findByQrCodeId(Long qrCodeId, Pageable pageable) {
        log.debug("Retrieving items for QR code {} page {}", qrCodeId, pageable);
        return repository.findByQrCodeId(qrCodeId, pageable);
    }

    public Page<QRCodeItem> findByQrCodeId(Long qrCodeId, String uuid, Pageable pageable) {
        log.debug("Retrieving items for QR code {} uuid {} page {}", qrCodeId, uuid, pageable);
        if (uuid == null || uuid.isBlank()) {
            return repository.findByQrCodeId(qrCodeId, pageable);
        }
        return repository.findByQrCodeIdAndUuidContainingIgnoreCase(qrCodeId, uuid, pageable);
    }

    public Page<QRCodeItem> findByQrCodeUuid(String qrCodeUuid, Pageable pageable) {
        log.debug("Retrieving items for QR code {} page {}", qrCodeUuid, pageable);
        return repository.findByQrCodeUuid(qrCodeUuid, pageable);
    }

    public Page<QRCodeItem> findByQrCodeUuid(String qrCodeUuid, String uuid, Pageable pageable) {
        log.debug("Retrieving items for QR code {} uuid {} page {}", qrCodeUuid, uuid, pageable);
        if (uuid == null || uuid.isBlank()) {
            return repository.findByQrCodeUuid(qrCodeUuid, pageable);
        }
        return repository.findByQrCodeUuidAndUuidContainingIgnoreCase(qrCodeUuid, uuid, pageable);
    }

    public Optional<QRCodeItem> findById(Long id) {
        log.debug("Finding QR code item {}", id);
        return repository.findById(id);
    }

    public Optional<QRCodeItem> findByUuid(String uuid) {
        log.debug("Finding QR code item {}", uuid);
        return repository.findByUuid(uuid);
    }

    public QRCodeItem save(Long qrCodeId, QRCodeItem item) {
        QRCode qrCode = qrCodeRepository.findById(qrCodeId).orElseThrow();
        item.setQrCode(qrCode);
        log.info("Saving QR code item {} for code {}", item.getFileName(), qrCodeId);
        return repository.save(item);
    }

    public QRCodeItem update(QRCodeItem item) {
        return repository.findById(item.getId())
                .map(existing -> {
                    existing.setFileName(item.getFileName());
                    existing.setUpdatedBy(item.getUpdatedBy());
                    log.info("Updating QR code item {}", existing.getId());
                    return repository.save(existing);
                })
                .orElseThrow();
    }

    @Transactional
    public void delete(Long id) {
        log.info("Deleting QR code item {}", id);
        repository.deleteById(id);
    }

    @Transactional
    public void deleteByUuid(String uuid) {
        log.info("Deleting QR code item {}", uuid);
        repository.deleteByUuid(uuid);
    }
}
