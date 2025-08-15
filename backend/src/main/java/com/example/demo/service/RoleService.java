package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.model.rbac.Role;
import com.example.demo.repository.RoleRepository;

@Service
public class RoleService {
    private final RoleRepository repository;
    private static final Logger log = LoggerFactory.getLogger(RoleService.class);

    public RoleService(RoleRepository repository) {
        this.repository = repository;
    }

    public List<Role> findAll() {
        log.debug("Retrieving all roles");
        return repository.findAll();
    }

    public Page<Role> findAll(Pageable pageable) {
        log.debug("Retrieving roles page {}", pageable);
        return repository.findAll(pageable);
    }

    public Optional<Role> findById(Long id) {
        log.debug("Finding role {}", id);
        return repository.findById(id);
    }

    public Role save(Role role) {
        log.info("Saving role {}", role.getName());
        return repository.save(role);
    }

    public Role update(Role role) {
        log.info("Updating role {}", role.getId());
        return repository.findById(role.getId())
                .map(existing -> {
                    existing.setName(role.getName());
                    existing.setPermissions(role.getPermissions());
                    return repository.save(existing);
                })
                .orElseThrow();
    }

    public void delete(Long id) {
        log.info("Deleting role {}", id);
        repository.deleteById(id);
    }
}
