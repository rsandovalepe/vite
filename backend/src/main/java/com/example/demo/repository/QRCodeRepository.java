package com.example.demo.repository;

import com.example.demo.model.QRCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface QRCodeRepository extends JpaRepository<QRCode, Long> {
    Optional<QRCode> findByUuid(String uuid);
    void deleteByUuid(String uuid);
    Page<QRCode> findByCreatedBy(String createdBy, Pageable pageable);
    Page<QRCode> findByUserId(Long userId, Pageable pageable);
    QRCode findByConnectionFolders_Id(Long connectionFolderId);

    @Query(value = "SELECT q.* FROM qr_codes q " +
            "JOIN qr_code_connection_folder cf ON q.id = cf.qr_code_id " +
            "WHERE cf.connection_folder_id = :connectionFolderId",
            nativeQuery = true)
    List<QRCode> findByConnectionFolderId(@Param("connectionFolderId") Long connectionFolderId);    

    @Query("SELECT u FROM QRCode u WHERE createdAt <= :creationDateTime ORDER BY createdAt DESC LIMIT 1")
    QRCode findTopByCreationDateLessThanEqualOrderByCreationDateDesc(@Param("creationDateTime") LocalDateTime creationDateTime);
}
