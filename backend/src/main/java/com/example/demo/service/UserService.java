package com.example.demo.service;

import com.example.demo.model.rbac.User;
import com.example.demo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> findAll() {
        log.debug("Retrieving all users");
        return userRepository.findAll();
    }

    public Page<User> findAll(Pageable pageable) {
        log.debug("Retrieving users page {}", pageable);
        return userRepository.findAll(pageable);
    }

    public Optional<User> findByUsername(String username) {
        log.debug("Finding user by username {}", username);
        return userRepository.findByUsername(username);
    }

    public User save(User user) {
        log.info("Saving new user {}", user.getUsername());
        return userRepository.save(user);
    }

    public User update(User user) {
        return userRepository.findById(user.getId())
                .map(existing -> {
                    existing.setUsername(user.getUsername());
                    existing.setName(user.getName());
                    if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                        existing.setPassword(user.getPassword());
                    }
                    existing.setRoles(user.getRoles());
                    log.info("Updating user {}", existing.getId());
                    return userRepository.save(existing);
                })
                .orElseThrow();
    }

    public void delete(Long id) {
        log.info("Deleting user {}", id);
        userRepository.deleteById(id);
    }

    public Optional<User> findById(Long id) {
        log.debug("Finding user by id {}", id);
        return userRepository.findById(id);
    }

    public User updateTotpSecret(Long userId, String secret) {
        return userRepository.findById(userId)
                .map(u -> {
                    u.setTotpSecret(secret);
                    log.info("Setting 2FA secret for user {}", userId);
                    return userRepository.save(u);
                })
                .orElseThrow();
    }
}
