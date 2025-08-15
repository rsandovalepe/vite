package com.example.demo.repository;

import com.example.demo.model.rbac.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
}
