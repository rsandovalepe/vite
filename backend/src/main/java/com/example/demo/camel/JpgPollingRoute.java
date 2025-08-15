package com.example.demo.camel;

import com.example.demo.model.QRCode;
import com.example.demo.model.QRCodeItem;
import com.example.demo.repository.QRCodeRepository;
import com.example.demo.repository.QRCodeItemRepository;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.component.file.GenericFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import org.apache.commons.imaging.ImageReadException;
import org.apache.commons.imaging.Imaging;
import org.apache.commons.imaging.common.ImageMetadata;
import org.apache.commons.imaging.formats.jpeg.JpegImageMetadata;
import org.apache.commons.imaging.formats.tiff.TiffField;
import org.apache.commons.imaging.formats.tiff.constants.ExifTagConstants;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Component
public class JpgPollingRoute extends RouteBuilder {

    private static final Logger log = LoggerFactory.getLogger(JpgPollingRoute.class);
    private final QRCodeRepository repository;
    private final QRCodeItemRepository itemRepository;
    private final String folderPath;
    private final String photoThumbnailFolderPath;

    public JpgPollingRoute(QRCodeRepository repository,
                           QRCodeItemRepository itemRepository,
                           @Value("${polling_folder_path}") String folderPath,
                           @Value("${photo_folder_path}") String photoThumbnailFolderPath) {
        this.repository = repository;
        this.itemRepository = itemRepository;
        this.folderPath = folderPath;
        this.photoThumbnailFolderPath = photoThumbnailFolderPath;
    }

    @Override
    public void configure() {
        log.info("Polling folder path: {}", folderPath);
        from("file://" + folderPath + "?noop=true&antInclude=**/*.jpg&antFilterCaseSensitive=false")
            .routeId("jpgPollingRoute")
            .noAutoStartup()
            .process(exchange -> {
                GenericFile<File> fileGeneric = exchange.getIn().getBody(GenericFile.class);
                File file = fileGeneric.getFile();
                LocalDateTime creation = extractCreationDate(file);
                if (creation != null) {
                    QRCode code = repository
                        .findTopByCreationDateLessThanEqualOrderByCreationDateDesc(creation);
                    if (code == null) {
                        log.info("No QR codes found for creation date {}", creation);
                    }
                    else {
                        log.info("Found {} / {} QR code for JP creation date {}", code.getCreatedAt(), code.getUuid(), creation);
                        QRCodeItem item = new QRCodeItem();
                        item.setQrCode(code);
                        item.setUuid(code.getUuid());
                        item.setFileName(file.getName());
                        item.setExifCreatedAt(creation);
                        item.setCreatedBy("system");
                        item.setUpdatedBy("system");
                        itemRepository.save(item);
                        log.info("Saved QR code item {} for QR code {}", item.getFileName(), code.getUuid());

                        String fullDestinationFolderPath = photoThumbnailFolderPath + code.getUuid();
                        try {
                            Path destDir = Paths.get(fullDestinationFolderPath);
                            Files.createDirectories(destDir);
                            Files.move(file.toPath(), destDir.resolve(file.getName()), StandardCopyOption.REPLACE_EXISTING);
                            log.info("Moved file {} to {}", file.getName(), destDir);
                        } catch (IOException e) {
                            log.warn("Failed to move file {} to thumbnail folder {}", file.getName(), fullDestinationFolderPath, e);
                        }
                    }
                }
            });
    }

    private LocalDateTime extractCreationDate(File file) {
        try {
            ImageMetadata metadata = Imaging.getMetadata(file);
            if (metadata instanceof JpegImageMetadata jpegMeta) {
                TiffField field = jpegMeta.findEXIFValueWithExactMatch(ExifTagConstants.EXIF_TAG_DATE_TIME_ORIGINAL);
                if (field != null) {
                    String value = field.getStringValue();
                    log.info("Extracted creation date for {}: {}", file.getName(), value);
                    DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy:MM:dd HH:mm:ss");
                    LocalDateTime ldt = LocalDateTime.parse(value, fmt);
                    return ldt.atZone(ZoneId.of("MST", ZoneId.SHORT_IDS)).toLocalDateTime();
                }
            }
        } catch (ImageReadException | IOException e) {
            log.warn("Failed to read metadata for {}", file.getName(), e);
        }
        return null;
    }
}
