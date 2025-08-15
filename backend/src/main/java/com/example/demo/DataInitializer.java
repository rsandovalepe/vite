package com.example.demo;

import com.example.demo.model.rbac.User;
import com.example.demo.model.rbac.Role;
import com.example.demo.model.rbac.Permission;
import com.example.demo.model.QRCode;
import com.example.demo.model.QRCodeItem;
import com.example.demo.model.ConnectionFTP;
import com.example.demo.model.ConnectionFolder;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.QRCodeService;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.PermissionRepository;
import com.example.demo.repository.QRCodeRepository;
import com.example.demo.repository.QRCodeItemRepository;
import com.example.demo.repository.ConnectionFTPRepository;
import com.example.demo.repository.ConnectionFolderRepository;

import org.apache.camel.CamelContext;
import org.apache.commons.imaging.ImagingException;
import org.apache.commons.imaging.formats.jpeg.exif.ExifRewriter;
import org.apache.commons.imaging.formats.tiff.constants.ExifTagConstants;
import org.apache.commons.imaging.formats.tiff.constants.TiffTagConstants;
import org.apache.commons.imaging.formats.tiff.write.TiffOutputDirectory;
import org.apache.commons.imaging.formats.tiff.write.TiffOutputSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import javax.imageio.ImageIO;

@Configuration
public class DataInitializer {
    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    @Bean
    CommandLineRunner init(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PermissionRepository permissionRepository,
                           QRCodeRepository qrCodeRepository,
                           QRCodeItemRepository qrCodeItemRepository,
                           ConnectionFTPRepository connectionFTPRepository,
                           ConnectionFolderRepository connectionFolderRepository,
                           QRCodeService qrCodeService,
                           @Value("${polling_folder_path}") String folderPath,
                           CamelContext camelContext) {
        return args -> {
            clearPollingFolder(folderPath);
            seedPermissions(permissionRepository);
            seedDefaultUsers(userRepository, roleRepository, permissionRepository);
            // seedFolderConnections(connectionFolderRepository);
            seedSampleQRCodes(qrCodeService, folderPath, connectionFolderRepository, userRepository);
            seedFTPConnections(connectionFTPRepository);
            // startCamelRoute(camelContext, "jpgPollingRoute");
        };
    }

    private void clearPollingFolder(String folderPath) {
        Path dir = Paths.get(folderPath);
        log.info("Cleaning files in: {}", dir);
        try {
            Files.createDirectories(dir);
            Files.list(dir)
                .filter(Files::isRegularFile)
                .forEach(f -> {
                    try {
                        Files.delete(f);
                    } catch (IOException e) {
                        log.warn("Failed to delete file: {}", f.getFileName(), e);
                    }
                });
        } catch (IOException e) {
            log.warn("Failed to list files in folderPath {}", folderPath, e);
        }
    }

    private void seedPermissions(PermissionRepository repository) {
        if (repository.count() == 0) {
            log.info("Seeding default permissions");
            Permission read = new Permission();
            read.setName("Read");
            repository.save(read);

            Permission write = new Permission();
            write.setName("Write");
            repository.save(write);
        }
    }

    private void seedDefaultUsers(UserRepository userRepository,
                                  RoleRepository roleRepository,
                                  PermissionRepository permissionRepository) {
        if (userRepository.count() == 0) {
            log.info("Seeding default users");

            Permission read = permissionRepository.findByName("Read").orElse(null);
            Permission write = permissionRepository.findByName("Write").orElse(null);

            Role adminRole = new Role();
            adminRole.setName("ADMIN");
            adminRole.setPermissions(Set.of(read, write));
            adminRole = roleRepository.save(adminRole);

            Role userRole = new Role();
            userRole.setName("USER");
            userRole.setPermissions(Set.of(read, write));
            userRole = roleRepository.save(userRole);

            User admin = new User("admin", "Admin", "", Set.of(adminRole));
            userRepository.save(admin);

            User user = new User("user", "User", "", Set.of(userRole));
            userRepository.save(user);
        }
    }

    private void seedFTPConnections(ConnectionFTPRepository repository) {
        if (repository.count() == 0) {
            log.info("Seeding default FTP connections");
            ConnectionFTP first = new ConnectionFTP();
            first.setName("FTP One");
            first.setEnabled(true);
            first.setFileProtocol("sftp");
            first.setHostName("ftp.example.com");
            first.setPortNumber(22);
            first.setUserName("user1");
            first.setPassword("pass1");
            repository.save(first);

            ConnectionFTP second = new ConnectionFTP();
            second.setName("FTP Two");
            second.setEnabled(false);
            second.setFileProtocol("ftp");
            second.setHostName("files.example.org");
            second.setPortNumber(21);
            second.setUserName("user2");
            second.setPassword("pass2");
            repository.save(second);
        }
    }

    private void seedFolderConnections(ConnectionFolderRepository repository) {
        if (repository.count() == 0) {
            log.info("Seeding default Folder connections");

            ConnectionFolder first = new ConnectionFolder();
            first.setName("Event Polling Folder");
            first.setPath("/Users/ruben/Development/vite-react/images/polling/");
            first.setEnabled(true);
            repository.save(first);

            ConnectionFolder second = new ConnectionFolder();
            second.setName("Folder Two");
            second.setPath("/Users/ruben/Development/vite-react/images/polling/");
            second.setEnabled(false);
            repository.save(second);

            ConnectionFolder third = new ConnectionFolder();
            third.setName("Folder Three");
            third.setPath("/Users/ruben/Development/vite-react/images/polling/");
            third.setEnabled(false);
            repository.save(third);
        }
    }

    private void seedSampleQRCodes(QRCodeService qrCodeService,
                                   String folderPath,
                                   ConnectionFolderRepository connectionFolderRepository, UserRepository userRepository)
            throws IOException, ImagingException {
        QRCode sample = null;
        LocalDateTime base = LocalDateTime.now();
        ConnectionFolder folder = connectionFolderRepository.findById(1L).orElse(null);
        for (int i = 1; i <= 1; i++) {
            String uuid = UUID.randomUUID().toString();
            log.info("Seeding sample QR code {}", uuid);
            sample = new QRCode();
            sample.setDescription("Sample QR Code " + i);
            sample.setUuid(uuid);
            sample.setCreatedAt(base.plusMinutes((long) (i - 1) * 180));
            Optional<User> user = userRepository.findByUsername("user");
            sample.setUser(user.orElse(null));
            sample.setCreatedBy("user");
            sample.setUpdatedBy("user");
            // if (folder != null) {
            //     if ( i == 1 ) {
            //         sample.getConnectionFolders().add(folder);
            //     }
            // }
            sample = qrCodeService.save(sample);
            String fullPath = folderPath + uuid;
            generateSampleImages(sample.getCreatedAt().plusMinutes(10), fullPath, 5, uuid);
        }
    }

    private void startCamelRoute(CamelContext camelContext, String routeId) {
        try {
            log.debug("Starting rount [{}].", routeId);
            camelContext.getRouteController().startRoute(routeId);
        } catch (Exception e) {
            log.error("Failed to start Camel route {}", routeId, e);
        }
    }

    private void generateSampleImages(LocalDateTime base, String folderPath, int numberOfImages, String uuid) throws IOException, ImagingException {
        Path dir = Paths.get(folderPath);
        Files.createDirectories(dir);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy:MM:dd HH:mm:ss");

        for (int i = 1; i <= numberOfImages; i++) {
            BufferedImage img = new BufferedImage(200, 200, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = img.createGraphics();
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, 200, 200);
            g.setColor(Color.BLACK);
            g.setFont(new Font("SansSerif", Font.BOLD, 72));
            String text = String.valueOf(i);
            FontMetrics fm = g.getFontMetrics();
            int x = (200 - fm.stringWidth(text)) / 2;
            int y = (200 - fm.getHeight()) / 2 + fm.getAscent();
            g.drawString(text, x, y);
            g.dispose();

            Path file = dir.resolve(uuid + "-" + i + ".jpg");
            ImageIO.write(img, "jpg", file.toFile());

            LocalDateTime date = base.plusMinutes((long) (i - 1) * 1);
            String formatted = date.format(fmt);

            log.trace("Setting EXIF date for {}: {}", file.getFileName(), formatted);

            TiffOutputSet outputSet = new TiffOutputSet();
            TiffOutputDirectory root = outputSet.getOrCreateRootDirectory();
            TiffOutputDirectory exif = outputSet.getOrCreateExifDirectory();
            root.add(TiffTagConstants.TIFF_TAG_DATE_TIME, formatted);
            exif.add(ExifTagConstants.EXIF_TAG_DATE_TIME_ORIGINAL, formatted);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            new ExifRewriter().updateExifMetadataLossless(file.toFile(), baos, outputSet);
            try (FileOutputStream fos = new FileOutputStream(file.toFile())) {
                fos.write(baos.toByteArray());
            }
        }
    }
}
