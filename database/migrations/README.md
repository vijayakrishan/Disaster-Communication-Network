# Database Schema Migrations

This folder tracks incremental database schema changes, migrations, and patch scripts for ResQMesh microservice databases.

---

## Migration Policy

- **Spring Boot JPA (`ddl-auto`)**:
  - Development environments use `spring.jpa.hibernate.ddl-auto=update` to automatically create and synchronize schema definitions with JPA entities.
- **Production Migrations**:
  - In production deployments, SQL schema migrations should be managed via version-controlled migration scripts applied in sequential numbering (e.g., `V1__init.sql`, `V2__add_index.sql`) or via Liquibase / Flyway.

---

## Schema History

- `01` — Base microservices database creation (`auth_db`, `user_db`, `rescue_db`, `lora_device_db`, `lora_station_db`)
- `02` — Auth & credential tables (`users`, `email_verification`, `teams`, `workers`)
- `03` — Victim user profile tables
- `04` — Worker and field responder definitions
- `05` — Rescue team and team member tables
- `06` — SOS distress alerts, rescue assignments, relay telemetry, worker messaging
- `07` — LoRa device registry and sensor telemetry tables
- `08` — Administrative views and indexes
