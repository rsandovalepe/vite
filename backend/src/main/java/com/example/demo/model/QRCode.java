package com.example.demo.model;

import jakarta.persistence.*;
import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.example.demo.model.rbac.User;

@Entity
@Table(name = "qr_codes")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class QRCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String uuid;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    private byte[] blob;

    private String description;
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private Type type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference("user-qrcodes")
    private User user;

    @ManyToMany
    @JoinTable(
        name = "qr_code_connection_ftp",
        joinColumns = @JoinColumn(name = "qr_code_id"),
        inverseJoinColumns = @JoinColumn(name = "connection_ftp_id")
    )
    private Set<ConnectionFTP> connectionFTPs = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "qr_code_connection_folder",
        joinColumns = @JoinColumn(name = "qr_code_id"),
        inverseJoinColumns = @JoinColumn(name = "connection_folder_id")
    )
    private Set<ConnectionFolder> connectionFolders = new HashSet<>();

    private static final Logger log = LoggerFactory.getLogger(QRCode.class);

    @PrePersist
    public void prePersist() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
        if (this.blob == null) {
            this.blob = generateBlob(this.uuid);
        }
        if ( this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.type == null) {
            this.type = Type.EVENT;
        }
        this.updatedAt = LocalDateTime.now();
        log.debug("Persisting QR code {} createdAt {}", this.uuid, this.createdAt);
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public byte[] getBlob() {
        return blob;
    }

    public void setBlob(byte[] blob) {
        this.blob = blob;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Set<ConnectionFTP> getConnectionFTPs() {
        return connectionFTPs;
    }

    public void setConnectionFTPs(Set<ConnectionFTP> connectionFTPs) {
        this.connectionFTPs = connectionFTPs;
    }

    public Set<ConnectionFolder> getConnectionFolders() {
        return connectionFolders;
    }

    public void setConnectionFolders(Set<ConnectionFolder> connectionFolders) {
        this.connectionFolders = connectionFolders;
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    private byte[] generateBlob(String data) {
        try {
            BitMatrix matrix = new MultiFormatWriter().encode(data, BarcodeFormat.QR_CODE, 200, 200);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return out.toByteArray();
        } catch (WriterException | IOException e) {
            log.error("Failed to generate QR code", e);
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    public enum Type {
        EVENT,
        EXIF_TAG_DATE_TIME_ORIGINAL
    }
}
