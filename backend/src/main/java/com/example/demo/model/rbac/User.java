package com.example.demo.model.rbac;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;
import com.example.demo.model.QRCode;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

/**
 * Represents an application user. The entity stores a username, a plain text
 * password (for demo purposes) and a collection of {@link Role} entities. The
 * roles are persisted via a join table linking users and roles.
 */
@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = {"username"}))
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String password;

    @Column(name = "totp_secret")
    private String totpSecret;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @OneToMany(mappedBy = "user")
    @JsonManagedReference("user-qrcodes")
    private Set<QRCode> qrCodes = new HashSet<>();

    public User() {
    }

    public User(String username, String name, String password, Set<Role> roles) {
        this.username = username;
        this.name = name;
        this.password = password;
        this.roles = roles;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getTotpSecret() {
        return totpSecret;
    }

    public void setTotpSecret(String totpSecret) {
        this.totpSecret = totpSecret;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public Set<QRCode> getQrCodes() {
        return qrCodes;
    }

    public void setQrCodes(Set<QRCode> qrCodes) {
        this.qrCodes = qrCodes;
    }
}

