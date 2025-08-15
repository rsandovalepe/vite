package com.example.demo.model;

import com.example.demo.config.EncryptionConverter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "connection_ftp")
public class ConnectionFTP {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private boolean enabled;

    @Column(name = "file_protocol")
    private String fileProtocol;

    @Column(name = "host_name")
    private String hostName;

    @Column(name = "port_number")
    private Integer portNumber;

    @Column(name = "user_name")
    private String userName;

    @Convert(converter = EncryptionConverter.class)
    private String password;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "ssh_key", length = 4096)
    private String sshKey;

    @ManyToMany(mappedBy = "connectionFTPs")
    @JsonIgnore
    private Set<QRCode> qrCodes = new HashSet<>();

    private static final Logger log = LoggerFactory.getLogger(ConnectionFTP.class);

    public ConnectionFTP() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getFileProtocol() {
        return fileProtocol;
    }

    public void setFileProtocol(String fileProtocol) {
        this.fileProtocol = fileProtocol;
    }

    public String getHostName() {
        return hostName;
    }

    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    public Integer getPortNumber() {
        return portNumber;
    }

    public void setPortNumber(Integer portNumber) {
        this.portNumber = portNumber;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        log.debug("Setting password for {}", hostName);
        this.password = password;
    }

    public String getSshKey() {
        return sshKey;
    }

    public void setSshKey(String sshKey) {
        log.debug("Setting SSH key for {}", hostName);
        this.sshKey = sshKey;
    }

    public Set<QRCode> getQrCodes() {
        return qrCodes;
    }

    public void setQrCodes(Set<QRCode> qrCodes) {
        this.qrCodes = qrCodes;
    }
}
