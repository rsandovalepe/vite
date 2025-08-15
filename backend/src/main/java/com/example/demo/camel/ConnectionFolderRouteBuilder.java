package com.example.demo.camel;

import com.example.demo.model.ConnectionFolder;
import com.example.demo.model.QRCode;
import com.example.demo.model.QRCodeItem;
import com.example.demo.repository.QRCodeItemRepository;
import com.example.demo.repository.QRCodeRepository;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.component.file.GenericFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import javax.imageio.ImageIO;

public class ConnectionFolderRouteBuilder extends RouteBuilder {
    private final String photoFolderPath;
    private final String pollingFolderPath;
    private final ConnectionFolder connection;
    private final QRCodeRepository qrCodeRepository;
    private final QRCodeItemRepository itemRepository;
    private static final Logger log = LoggerFactory.getLogger(ConnectionFolderRouteBuilder.class);

    public ConnectionFolderRouteBuilder(@Value("${photo_folder_path}") String photoFolderPath,
                                        @Value("${polling_folder_path}") String pollingFolderPath,
                                        ConnectionFolder connection,
                                        QRCodeRepository qrCodeRepository,
                                        QRCodeItemRepository itemRepository) {
        this.photoFolderPath = photoFolderPath;
        this.pollingFolderPath = pollingFolderPath;
        this.connection = connection;
        this.qrCodeRepository = qrCodeRepository;
        this.itemRepository = itemRepository;
    }

    @Override
    public void configure() {
        var route = from("file://" + pollingFolderPath + "??noop=true&antInclude=**/*.jpg&antFilterCaseSensitive=false");
        route.routeId(connection.getId().toString());
        if (!connection.isEnabled()) {
            route.noAutoStartup();
        }

        route.process(exchange -> {
            log.debug("id={} name={}", connection.getId(), connection.getName());
            List<QRCode> codes = qrCodeRepository.findByConnectionFolderId(connection.getId());
            GenericFile<File> fileGeneric = exchange.getIn().getBody(GenericFile.class);
            File file = fileGeneric.getFile();
            String fileNameUuid = UUID.randomUUID().toString();
            String fileName = fileNameUuid + ".jpg";
            if (codes.isEmpty()) {
                log.info("No QR codes linked to folder connection {}", connection.getId());
            }
            for (QRCode code : codes) {
                QRCodeItem item = new QRCodeItem();
                item.setQrCode(code);
                item.setUuid(code.getUuid());
                item.setFileName(fileName);
                item.setCreatedBy("system");
                item.setUpdatedBy("system");
                itemRepository.save(item);
                log.info("Saved QR code item {} for QR code {}", fileName, code.getUuid());

                String fullDestinationFolderPath = photoFolderPath + code.getUuid();
                try {
                    Path destDir = Paths.get(fullDestinationFolderPath);
                    Files.createDirectories(destDir);
                    Path destPath = destDir.resolve(fileName);
                    Files.move(file.toPath(), destPath, StandardCopyOption.REPLACE_EXISTING);
                    log.info("Moved file {} to {}", file.getName(), destPath);
                    createThumbnail(destPath, destDir.resolve(fileNameUuid + "-thumb.jpg"));
                } catch (IOException e) {
                    log.warn("Failed to move file {} to thumbnail folder {}", file.getName(), fullDestinationFolderPath, e);
                }
            }
        }).log("Polled file ${file:name}");
    }

    private void createThumbnail(Path sourcePath, Path thumbPath) {
        try {
            BufferedImage original = ImageIO.read(sourcePath.toFile());
            int thumbWidth = 200;
            int thumbHeight = (int) ((double) thumbWidth / original.getWidth() * original.getHeight());
            BufferedImage thumb = new BufferedImage(thumbWidth, thumbHeight, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = thumb.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.drawImage(original, 0, 0, thumbWidth, thumbHeight, null);
            g.dispose();
            ImageIO.write(thumb, "jpg", thumbPath.toFile());
            log.info("Created thumbnail {}", thumbPath);
        } catch (IOException e) {
            log.warn("Failed to create thumbnail for {}", sourcePath, e);
        }
    }
}
