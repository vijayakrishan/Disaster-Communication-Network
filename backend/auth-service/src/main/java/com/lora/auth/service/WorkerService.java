package com.lora.auth.service;

import com.lora.auth.entity.User;
import com.lora.auth.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class WorkerService {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();


    public WorkerService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    // =====================================================
    // GET ALL WORKERS
    // =====================================================

    public List<User> getAllWorkers() {

        return userRepository.findByRole("WORKER");

    }


    // =====================================================
    // GET WORKERS BY TEAM
    // =====================================================

    public List<User> getWorkersByTeam(String teamId) {

        return userRepository.findByRoleAndTeamId(
                "WORKER",
                teamId
        );

    }


    // =====================================================
    // ADD WORKER
    // =====================================================

    public User addWorker(User worker) {

        // -------------------------
        // VALIDATION
        // -------------------------

        if (worker.getName() == null ||
                worker.getName().isBlank()) {

            throw new RuntimeException(
                    "Worker name is required"
            );
        }


        if (worker.getEmail() == null ||
                worker.getEmail().isBlank()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }


        if (worker.getPassword() == null ||
                worker.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Password is required"
            );
        }


        if (worker.getPhone() == null ||
                worker.getPhone().isBlank()) {

            throw new RuntimeException(
                    "Phone number is required"
            );
        }


        if (worker.getTeamId() == null ||
                worker.getTeamId().isBlank()) {

            throw new RuntimeException(
                    "Team ID is required"
            );
        }


        // -------------------------
        // CHECK EMAIL
        // -------------------------

        if (userRepository.existsByEmail(
                worker.getEmail()
        )) {

            throw new RuntimeException(
                    "Email already exists"
            );
        }


        // -------------------------
        // GENERATE USER ID
        // -------------------------

        worker.setId(
                UUID.randomUUID().toString()
        );


        // -------------------------
        // FORCE WORKER ROLE
        // -------------------------

        worker.setRole("WORKER");


        // -------------------------
        // GENERATE WORKER ID
        // -------------------------

        worker.setWorkerId(
                generateWorkerId()
        );


        // -------------------------
        // DEFAULT STATUS
        // -------------------------

        if (worker.getAccountStatus() == null ||
                worker.getAccountStatus().isBlank()) {

            worker.setAccountStatus(
                    "AVAILABLE"
            );
        }


        // -------------------------
        // ENCRYPT PASSWORD
        // -------------------------

        worker.setPassword(
                passwordEncoder.encode(
                        worker.getPassword()
                )
        );


        // -------------------------
        // SAVE TO DATABASE
        // -------------------------

        return userRepository.save(worker);

    }


    // =====================================================
    // GENERATE WORKER ID
    // =====================================================

    private String generateWorkerId() {

        List<User> workers =
                userRepository.findByRole("WORKER");


        int maxNumber = 0;


        for (User worker : workers) {

            String workerId =
                    worker.getWorkerId();


            if (workerId == null ||
                    !workerId.startsWith("WRK-")) {

                continue;

            }


            try {

                int number =
                        Integer.parseInt(
                                workerId.substring(4)
                        );


                if (number > maxNumber) {

                    maxNumber = number;

                }

            } catch (NumberFormatException ignored) {

            }

        }


        return String.format(
                "WRK-%03d",
                maxNumber + 1
        );

    }


    // =====================================================
    // DELETE WORKER
    // =====================================================

    public void deleteWorker(String id) {

        if (!userRepository.existsById(id)) {

            throw new RuntimeException(
                    "Worker not found"
            );

        }


        userRepository.deleteById(id);

    }

}