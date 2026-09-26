package com.lora.auth.repository;

import com.lora.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);

    List<User> findByRole(String role);

    Optional<User> findByWorkerId(String workerId);

    List<User> findByRoleAndTeamId(String role, String teamId);

    boolean existsByEmail(String email);
}