# CityConnect Backup & Disaster Recovery Plan

## 1. Backup Strategy
- **Database Backups**: Daily automated JSON/mongodump snapshots stored in `backups/`.
- **Media Assets**: Cloudinary cloud backup with multi-region redundancy.
- **Access & Activity Logs**: Preserved in `backend/logs/` directory (`access.log`, `error.log`, `activity.log`).

## 2. Automated Backup Execution
Run manually or via cron:
```bash
node scripts/db_backup.js
```

## 3. Disaster Recovery & Restoration Procedure
In case of server instance corruption or database loss:
1. Provision new database instance or clear corrupted database.
2. Ensure latest backup file is in `backups/`.
3. Run restoration utility:
```bash
node scripts/restore.js
```
4. Verify database indices and test health endpoint `GET /api/health`.
