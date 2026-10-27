# FleetCore API

A REST API for managing the vehicle fleet and its maintenance lifecycle. It includes JWT authentication, role-based authorization, PostgreSQL with TypeORM, audit logs, Swagger, and idempotent test seed data.

## Coder Information

- **Name:** Andrés Gutiérrez
- **Clan:** Cohort 5
- **Public repository:** [FleetCore](https://github.com/AndrxsGutierrez/FleetCore)

## Technologies

- Node.js and TypeScript
- NestJS
- PostgreSQL and TypeORM
- JWT and bcrypt
- class-validator and class-transformer
- Swagger / OpenAPI
- Docker and Docker Compose
- Vitest

## Features

- Vehicle, mechanic, and workshop management with logical deactivation.
- Scheduling and tracking of preventive and corrective maintenance.
- Validation of availability, mileage, status transitions, and schedule overlaps.
- JWT authentication and authorization for `ADMIN` and `TECHNICIAN` roles.
- Technicians can view their assigned maintenance jobs.
- External integrations can query vehicle availability and maintenance history using `x-api-key`.
- Successful data-changing operations are audited; ADMIN users can query the audit log.
- Global response interceptor, exception filter, and Swagger documentation.

## Project Structure

```text
src/
├── audits/        # Audit log recording and queries
├── auth/          # Login, JWT, roles, guards, and decorators
├── common/        # Response interceptor and exception filter
├── database/      # Test data seeder
├── health/        # Health endpoint
├── maintenances/  # Maintenance operations and business rules
├── mechanics/     # Mechanics
├── vehicles/      # Vehicles and external integration
└── workshops/     # Workshops
```

## Prerequisites

- Docker and Docker Compose
- Node.js and npm if you run the seeder from your machine

## Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Set your own values for `JWT_SECRET` and `API_KEYS`. Generate random keys with:

```bash
openssl rand -hex 32
```

Use one generated value for `JWT_SECRET` and another for `API_KEYS`. To configure multiple API keys, separate them with commas. Do not use the example values in a real environment.

`POSTGRES_HOST=localhost` is used when running commands from your machine. Docker Compose overrides it so the API connects to the `db` service on the Compose network.

## Installation and Docker Execution

From the project root, run:

```bash
docker compose up -d --build
```

Check the containers and view API logs:

```bash
docker compose ps
docker compose logs -f api
```

The API is available at `http://localhost:3000` (or the port configured in `APP_PORT`). PostgreSQL data is persisted in the `pgdata` volume. Stop the services without deleting the database with:

```bash
docker compose down
```

## Seeder and Test Credentials

The seeder creates or updates the sample data and can be run repeatedly without creating duplicates. From your machine, with PostgreSQL running, execute:

```bash
docker compose up -d db
npm install
npm run seed
```

The command compiles the seeder to a cache directory inside `node_modules` and does not write to `dist`.

The seed data includes one ADMIN, two TECHNICIAN users linked to active mechanics, one inactive mechanic, two workshops (one active and one inactive), four vehicles, and completed and in-progress maintenance records.

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | `admin@fleetcore.test` | `FleetCoreDemo123` |
| TECHNICIAN | `tecnico1@fleetcore.test` | `FleetCoreDemo123` |
| TECHNICIAN | `tecnico2@fleetcore.test` | `FleetCoreDemo123` |

## API Documentation and Endpoints

Swagger UI: **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**.

| Method and route | Access | Description |
| --- | --- | --- |
| `GET /health` | Public | Check API status |
| `POST /auth/login` | Public | Log in and receive a JWT |
| `POST /auth/register` | ADMIN | Create an account; `mechanicId` is required for `TECHNICIAN` |
| `GET /auth/me` | JWT | Get the authenticated user's profile |
| `/vehicles` | ADMIN + JWT | Create, list, view, update, activate, and deactivate vehicles |
| `GET /vehicles/:id/external-summary` | `x-api-key` | Get availability and maintenance history, including mechanic and workshop |
| `/mechanics` | ADMIN + JWT | Manage mechanics |
| `/workshops` | ADMIN + JWT | Manage workshops |
| `/maintenances` | ADMIN + JWT | Schedule and query maintenance records |
| `GET /maintenances/assigned-to-me` | TECHNICIAN + JWT | View assigned maintenance records |
| `GET /maintenances/:id` | ADMIN or assigned TECHNICIAN | View a maintenance record |
| `PATCH /maintenances/:id/status` | ADMIN or assigned TECHNICIAN | Advance the maintenance status according to its business rules |
| `GET /audits` | ADMIN + JWT | Query audit records; supports `page` and `limit` |

In Swagger, select **Authorize** to configure the JWT for protected routes or the `x-api-key` for the integration endpoint. These are separate credentials. For Bearer Auth, paste the JWT; for the integration endpoint, paste one of the keys configured in `API_KEYS`.

## Responses

Successful responses use a common format with `statusCode`, `success`, `data`, `path`, and `timestamp`. Errors include `statusCode`, `success`, `message`, `path`, and `timestamp`.

## Tests

The project uses Vitest. Available commands:

```bash
npm run test
npm run test:e2e
npm run test:cov
```

## PostgreSQL Backup

With the database container running, create a dump for submission to Moodle:

```bash
docker exec fleetcore-db pg_dump -U fleetcore -d fleetcore > fleetcore.sql
```

If you changed `DB_CONTAINER_NAME`, `POSTGRES_USER`, or `POSTGRES_DB` in `.env`, update those values in the command. Verify the `fleetcore.sql` file and upload it with the requested evidence.
