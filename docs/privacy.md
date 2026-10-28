# Privacy and retention

ScamShield has no account system. Treat the backend and its scan history as a single-user local workspace; the API does not authenticate callers or isolate users.

- Analyze requests send the text to Spring Boot and the Python service but do not insert a database record.
- Save requests re-run analysis and store full text, risk score/category, indicator/recommendation JSON, model version, and UTC timestamp in MySQL.
- Scan list/dashboard responses do not include full text. The scan detail endpoint returns stored text. Anyone able to reach this unauthenticated API can access and delete saved scans.
- Delete a scan through the history page or `DELETE /api/scans/{id}`. Database backups or host-level snapshots may retain copies.
- No deletion schedule or automatic retention policy is implemented. Decide on one before hosting real user data.
- Do not submit secrets, government identifiers, financial details, or personal contact information. Hosting operators and network providers may have their own logs and retention policies.

Before public deployment, implement authentication, authorization on every history operation, rate limiting, TLS, secure secret handling, and a tested data-retention/deletion policy.
