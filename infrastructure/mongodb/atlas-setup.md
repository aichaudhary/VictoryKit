# MongoDB Atlas Setup for MAULA.AI

This guide walks you through setting up MongoDB Atlas for the MAULA.AI platform.

## Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" or "Sign In"
3. Create an account or sign in with Google/GitHub

## Step 2: Create a New Cluster

1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox) for development or **Dedicated** for production
3. Select a cloud provider:
   - **AWS** (Recommended)
   - Google Cloud
   - Azure
4. Select region closest to your users (e.g., `us-east-1` for US East Coast)
5. Cluster Name: `maula-cluster`
6. Click "Create"

## Step 3: Create Database User

1. Navigate to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: `maula-admin`
5. Password: Generate a secure password (save it!)
6. Database User Privileges: **Atlas admin** (or read/write to any database)
7. Click "Add User"

## Step 4: Configure Network Access

1. Navigate to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. For development:
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ **Warning:** Not recommended for production
4. For production:
   - Add your server's IP address
   - Or use AWS VPC Peering
5. Click "Confirm"

## Step 5: Get Connection String

1. Click "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copy the connection string:
   ```
   mongodb+srv://maula-admin:<password>@maula-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password
8. Replace `?retryWrites=true` with `/maula_auth_db?retryWrites=true` to specify database

## Step 6: Create Databases

You need to create 51 databases:

1. **Auth Database:** `maula_auth_db`
2. **50 Tool Databases:**
   - `fraudguard_db`
   - `iscout_db`
   - `tradar_db`
   - `mhunter_db`
   - ... (one for each tool)

**Note:** Databases will be created automatically when you first write data to them.

## Step 7: Configure Environment Variables

Update your `.env` files:

### Auth Service
```env
MONGODB_URI=mongodb+srv://maula-admin:YOUR_PASSWORD@maula-cluster.xxxxx.mongodb.net/maula_auth_db?retryWrites=true&w=majority
```

### Each Tool Service (example for FraudGuard)
```env
MONGODB_URI=mongodb+srv://maula-admin:YOUR_PASSWORD@maula-cluster.xxxxx.mongodb.net/fraudguard_db?retryWrites=true&w=majority
```

## Step 8: Test Connection

```bash
# Using MongoDB Compass (GUI)
# Download from: https://www.mongodb.com/try/download/compass
# Paste your connection string

# Using Node.js
cd backend/shared-services/auth-service
npm run dev
# Check console for "✅ MongoDB connected successfully"
```

## Step 9: Set Up Backups (Production)

1. Navigate to **Backup** (left sidebar)
2. Enable **Continuous Backup** or **Cloud Backup Snapshots**
3. Configure backup schedule:
   - Daily backups
   - Retention: 7-30 days
4. Set up backup alerts

## Step 10: Performance Optimization

### Create Indexes

For Auth Service (`maula_auth_db.users` collection):
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ "subscription.status": 1 })
db.users.createIndex({ "oauth.providerId": 1 })
```

### Monitor Performance

1. Navigate to **Performance Advisor**
2. Review slow queries
3. Create recommended indexes

## Connection String Examples

### Auth Service
```
mongodb+srv://maula-admin:PASSWORD@maula-cluster.xxxxx.mongodb.net/maula_auth_db?retryWrites=true&w=majority
```

### FraudGuard Tool
```
mongodb+srv://maula-admin:PASSWORD@maula-cluster.xxxxx.mongodb.net/fraudguard_db?retryWrites=true&w=majority
```

### All Databases on Same Cluster
All 51 databases run on the same Atlas cluster. Just change the database name in the connection string.

## Security Best Practices

1. ✅ Use strong passwords (20+ characters)
2. ✅ Enable IP whitelist (don't use 0.0.0.0/0 in production)
3. ✅ Use separate users for each service (optional)
4. ✅ Enable two-factor authentication on Atlas account
5. ✅ Rotate credentials periodically
6. ✅ Enable encryption at rest (available in paid tiers)
7. ✅ Use VPC peering for production (M10+ clusters)

## Monitoring & Alerts

1. Navigate to **Alerts** (left sidebar)
2. Set up alerts for:
   - High memory usage (>80%)
   - High CPU usage (>80%)
   - Connection limits reached
   - Disk space low
   - Failed authentication attempts

## Pricing

- **Free Tier (M0):** 512 MB storage, shared RAM/CPU
  - Perfect for development and testing
  - Supports all 51 databases
  
- **Shared Tier (M2/M5):** $9-$25/month
  - 2-5 GB storage
  - Better performance than M0
  
- **Dedicated (M10+):** $57+/month
  - Dedicated resources
  - Automated backups
  - VPC peering
  - Recommended for production

## Troubleshooting

### Can't connect?
- Check IP whitelist
- Verify username/password
- Check connection string format
- Ensure network allows outbound connections to port 27017

### Slow queries?
- Create indexes (use Performance Advisor)
- Upgrade cluster tier
- Review query patterns

### Out of storage?
- Upgrade to larger cluster
- Delete old data
- Archive to S3

## Next Steps

After setup:
1. Test connection with auth service
2. Create initial admin user
3. Set up monitoring alerts
4. Configure backups (for production)
5. Proceed to Phase 2 (build first tool)

## Useful Links

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Connection String Options](https://docs.mongodb.com/manual/reference/connection-string/)
- [MongoDB Node.js Driver](https://docs.mongodb.com/drivers/node/)
