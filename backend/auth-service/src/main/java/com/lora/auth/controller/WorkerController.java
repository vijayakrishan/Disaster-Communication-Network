package com.lora.auth.controller;

import com.lora.auth.entity.User;
import com.lora.auth.service.WorkerService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/workers")
@CrossOrigin(origins = "*")
public class WorkerController {


    private final WorkerService workerService;


    public WorkerController(
            WorkerService workerService
    ) {

        this.workerService = workerService;

    }


    // =====================================================
    // GET ALL WORKERS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<User>> getAllWorkers() {

        return ResponseEntity.ok(
                workerService.getAllWorkers()
        );

    }


    // =====================================================
    // GET WORKERS BY TEAM
    // =====================================================

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<User>> getWorkersByTeam(
            @PathVariable String teamId
    ) {

        return ResponseEntity.ok(
                workerService.getWorkersByTeam(teamId)
        );

    }


    // =====================================================
    // ADD WORKER
    // =====================================================

    @PostMapping
    public ResponseEntity<?> addWorker(
            @RequestBody User worker
    ) {

        try {

            User savedWorker =
                    workerService.addWorker(worker);


            return ResponseEntity.ok(
                    savedWorker
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );

        }

    }


    // =====================================================
    // DELETE WORKER
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorker(
            @PathVariable String id
    ) {

        try {

            workerService.deleteWorker(id);


            return ResponseEntity.ok(
                    "Worker deleted successfully"
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );

        }

    }

}