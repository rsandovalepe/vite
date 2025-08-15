package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.model.rbac.UserRole;
import com.example.demo.repository.UserRoleRepository;

@Service
public class UserRoleService {
    private final UserRoleRepository repository;
    private static final Logger log = LoggerFactory.getLogger(UserRoleService.class);

    public UserRoleService(UserRoleRepository repository) {
        this.repository = repository;
    }

    public List<UserRole> findAll() {
        log.debug("Retrieving all user roles");
        return repository.findAll();
    }

    public Page<UserRole> findAll(Pageable pageable) {
        log.debug("Retrieving user roles page {}", pageable);
        return repository.findAll(pageable);
    }

    public Optional<UserRole> findById(Long id) {
        log.debug("Finding user role {}", id);
        return repository.findById(id);
    }

    public UserRole save(UserRole userRole) {
        log.info("Saving user role for user {}", userRole.getUser().getId());
        return repository.save(userRole);
    }

    public UserRole update(UserRole userRole) {
        log.info("Updating user role {}", userRole.getId());
        return repository.findById(userRole.getId())
                .map(existing -> {
                    existing.setUser(userRole.getUser());
                    existing.setRole(userRole.getRole());
                    return repository.save(existing);
                })
                .orElseThrow();
    }

    public void delete(Long id) {
        log.info("Deleting user role {}", id);
        repository.deleteById(id);
    }
}
