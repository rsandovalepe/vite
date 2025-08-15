package com.example.demo.service;

import com.example.demo.model.ConnectionFTP;
import com.example.demo.repository.ConnectionFTPRepository;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import org.apache.commons.net.ftp.FTPClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.Properties;

@Service
public class ConnectionFTPService {
    private final ConnectionFTPRepository repository;
    private static final Logger log = LoggerFactory.getLogger(ConnectionFTPService.class);

    public ConnectionFTPService(ConnectionFTPRepository repository) {
        this.repository = repository;
    }

    public List<ConnectionFTP> findAll() {
        log.debug("Retrieving all FTP connections");
        return repository.findAll();
    }

    public Optional<ConnectionFTP> findById(Long id) {
        log.debug("Finding FTP connection {}", id);
        return repository.findById(id);
    }

    public ConnectionFTP save(ConnectionFTP connection) {
        log.info("Saving FTP connection to {}:{}", connection.getHostName(), connection.getPortNumber());
        return repository.save(connection);
    }

    public ConnectionFTP update(ConnectionFTP connection) {
        log.info("Updating FTP connection {}", connection.getId());
        return repository.findById(connection.getId())
                .map(existing -> {
                    existing.setFileProtocol(connection.getFileProtocol());
                    existing.setHostName(connection.getHostName());
                    existing.setPortNumber(connection.getPortNumber());
                    existing.setUserName(connection.getUserName());
                    existing.setName(connection.getName());
                    existing.setEnabled(connection.isEnabled());
                    if (connection.getPassword() != null && !connection.getPassword().isEmpty()) {
                        existing.setPassword(connection.getPassword());
                    }
                    if (connection.getSshKey() != null && !connection.getSshKey().isEmpty()) {
                        existing.setSshKey(connection.getSshKey());
                    }
                    return repository.save(existing);
                })
                .orElseThrow();
    }

    public void delete(Long id) {
        log.info("Deleting FTP connection {}", id);
        repository.deleteById(id);
    }

    public boolean testConnection(ConnectionFTP connection) {
        if ("sftp".equalsIgnoreCase(connection.getFileProtocol())) {
            JSch jsch = new JSch();
            Session session = null;
            try {
                if (connection.getSshKey() != null && !connection.getSshKey().isEmpty()) {
                    jsch.addIdentity("key", connection.getSshKey().getBytes(StandardCharsets.UTF_8), null, null);
                }
                session = jsch.getSession(connection.getUserName(), connection.getHostName(), connection.getPortNumber());
                if (connection.getSshKey() == null || connection.getSshKey().isEmpty()) {
                    session.setPassword(connection.getPassword());
                }
                Properties config = new Properties();
                config.put("StrictHostKeyChecking", "no");
                session.setConfig(config);
                session.connect(5000);
                return session.isConnected();
            } catch (Exception e) {
                log.warn("SFTP connection test failed", e);
                return false;
            } finally {
                if (session != null && session.isConnected()) {
                    session.disconnect();
                }
            }
        } else {
            FTPClient ftp = new FTPClient();
            try {
                ftp.connect(connection.getHostName(), connection.getPortNumber());
                boolean result = ftp.login(connection.getUserName(), connection.getPassword());
                ftp.logout();
                ftp.disconnect();
                return result;
            } catch (IOException e) {
                log.warn("FTP connection test failed", e);
                return false;
            }
        }
    }
}
