package com.example.demo.repository;

import com.example.demo.model.QRCodeItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QRCodeItemRepository extends JpaRepository<QRCodeItem, Long> {
    Optional<QRCodeItem> findByUuid(String uuid);
    void deleteByUuid(String uuid);
    Page<QRCodeItem> findByQrCodeId(Long qrCodeId, Pageable pageable);
    Page<QRCodeItem> findByQrCodeIdAndUuidContainingIgnoreCase(Long qrCodeId, String uuid, Pageable pageable);
    Page<QRCodeItem> findByQrCodeUuid(String qrCodeUuid, Pageable pageable);
    Page<QRCodeItem> findByQrCodeUuidAndUuidContainingIgnoreCase(String qrCodeUuid, String uuid, Pageable pageable);
}
