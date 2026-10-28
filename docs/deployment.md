# Deployment checklist

Deployment is a guide only; this repository has not been deployed or connected to a cloud account.

## Frontend on Vercel

1. Import the repository and set the project root to `frontend`.
2. Build command: `npm run build`; output directory: `dist`.
3. Set `VITE_API_BASE_URL` to the Spring API's HTTPS origin plus `/api`.
4. SPA navigation is handled by `frontend/vercel.json`.
5. Do not add database passwords or the internal ML URL to Vite environment variables; `VITE_` variables are public.

## FastAPI service

Build from `ml-service/Dockerfile`, or install `requirements.txt` and run:

```text
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

Configure `MODEL_PATH` only if you have a trusted trained artifact, and allow only required origins if browser access is intentionally enabled. The browser should call Spring Boot, not FastAPI directly. Use the hosting provider's private service networking for the Spring-to-ML request.

## Spring Boot service

Build the included `backend/Dockerfile`, or run `mvnw.cmd package` and deploy `target/scamshield-backend-1.0.0.jar`. Set the managed MySQL JDBC URL, user, password, ML service URL, allowed frontend origin, and `JPA_DDL_AUTO=validate` using the host's secret manager. Flyway applies schema migrations. Keep CORS restricted to the deployed frontend origin.

## MySQL

Provision a managed MySQL 8 instance. Use a dedicated least-privilege user and database, TLS, backups, and a retention policy. The initial schema is applied by Flyway from `backend/src/main/resources/db/migration`.

## Required before public exposure

The current application has no authentication, user-scoped records, API rate limits, or public abuse protections. Do not expose it to untrusted users until access control is implemented and tested. A single global CORS origin is not authorization. Set a deletion policy, protect logs and backups, configure TLS, rotate secrets, and verify all services using non-sensitive test data. Hosting a service does not amount to production verification or proof that the analysis is accurate.
