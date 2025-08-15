package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.model.rbac.Permission;
import com.example.demo.repository.PermissionRepository;

@Service
public class PermissionService {
    private final PermissionRepository repository;
    private static final Logger log = LoggerFactory.getLogger(PermissionService.class);

    public PermissionService(PermissionRepository repository) {
        this.repository = repository;
    }

    public List<Permission> findAll() {
        log.debug("Retrieving all permissions");
        return repository.findAll();
    }

    public Page<Permission> findAll(Pageable pageable) {
        log.debug("Retrieving permissions page {}", pageable);
        return repository.findAll(pageable);
    }

    public Optional<Permission> findById(Long id) {
        log.debug("Finding permission {}", id);
        return repository.findById(id);
    }

    public Permission save(Permission permission) {
        log.info("Saving permission {}", permission.getName());
        return repository.save(permission);
    }

    public Permission update(Permission permission) {
        log.info("Updating permission {}", permission.getId());
        return repository.findById(permission.getId())
                .map(existing -> {
                    existing.setName(permission.getName());
                    return repository.save(existing);
                })
                .orElseThrow();
    }

    public void delete(Long id) {
        log.info("Deleting permission {}", id);
        repository.deleteById(id);
    }
}
