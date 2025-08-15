package com.example.demo.controller;

import com.example.demo.model.QRCode;
import com.example.demo.model.QRCodeItem;
import com.example.demo.repository.QRCodeItemRepository;
import com.example.demo.repository.QRCodeRepository;
import com.example.demo.service.QRCodeItemService;
import com.example.demo.service.QRCodeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@RestController
@RequestMapping("/photos")
public class PhotoController {
    private final QRCodeItemService qrCodeItemService;
    private final QRCodeRepository qrCodeRepository;
    private final QRCodeItemRepository qrCodeItemRepository;
    private static final Logger log = LoggerFactory.getLogger(PhotoController.class);

    @Value("${photo_folder_path}")
    private String photoFolderPath;

    public PhotoController(QRCodeService qrCodeService, QRCodeItemService qrCodeItemService, QRCodeItemRepository qrCodeItemRepository, QRCodeRepository qrCodeRepository) {
        this.qrCodeItemService = qrCodeItemService;
        this.qrCodeRepository = qrCodeRepository;
        this.qrCodeItemRepository = qrCodeItemRepository;
    }

    @PostMapping("/{uuid}/")
    public QRCodeItem upload(@PathVariable String uuid, @RequestParam("file") MultipartFile file) throws IOException {
        QRCode qrCode = qrCodeRepository.findByUuid(uuid).orElse(null);

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("File must have a name");
        }

        Path destDir = Paths.get(photoFolderPath + uuid);
        Files.createDirectories(destDir);
        Path destFile = destDir.resolve(originalFilename);
        Files.copy(file.getInputStream(), destFile, StandardCopyOption.REPLACE_EXISTING);

        QRCodeItem item = new QRCodeItem();
        item.setQrCode(qrCode);
        item.setUuid(uuid);
        item.setFileName(originalFilename);
        item.setCreatedBy("system");
        item.setUpdatedBy("system");
        qrCodeItemRepository.save(item);

        log.info("Uploaded photo {} for QR code {}", originalFilename, uuid);
        return qrCodeItemService.save(qrCode.getId(), item);
    }
}

