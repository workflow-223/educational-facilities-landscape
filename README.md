# JadeEd Explorer

Data visualization platform mapping educational facilities across Canada with Leaflet maps, Recharts analytics, and multi-service Docker orchestration.

## Architecture

- **Frontend**: React + TypeScript + Leaflet + Recharts
- **Backend**: Java Spring Boot 3.3.5 REST API
- **Python Service**: Flask-based data importer
- **Database**: MariaDB

## CI/CD

This project uses GitHub Actions for continuous integration:
- Frontend linting and testing
- Backend linting (Checkstyle, SpotBugs) and testing (JaCoCo coverage)

## Local Setup

```bash
docker compose up --build
```

## Deployment

```bash
docker compose -f compose.deploy.yml up --build -d
```