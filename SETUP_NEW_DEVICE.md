# 🚀 YatraLive - New Device Setup Guide

Complete step-by-step instructions to run this project on a new device.

---

## 📋 Prerequisites

Before starting, ensure you have these installed:

### **Required Software**

- **Node.js** v20 or higher - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

### **Verify Installation**

```bash
node --version    # Should show v20 or higher
npm --version     # Should show 9.0 or higher
docker --version  # Should show 20.0 or higher
git --version     # Should show 2.0 or higher
```

---

## 🔐 Step 1: Get the `.env` File

**IMPORTANT:** You need the `.env` file from the project maintainer. This file contains sensitive credentials and is NOT in the Git repository.

### **What's in the `.env` file:**

- Database passwords
- Redis connection URL
- JWT secrets
- AWS credentials (S3, SES)
- Email service API keys

### **How to get it:**

1. Contact the project admin/maintainer
2. They will securely share the `.env` file (via password manager, encrypted message, etc.)
3. Save it for Step 4

**⚠️ NEVER commit this file to Git or share it publicly!**

---

## 📥 Step 2: Clone the Repository

```bash
# Clone the repository
git clone <REPOSITORY_URL>

# Navigate to project directory
cd S66-0126-Synergy-Full-Stack-With-NextjsAnd-AWS-YatraLive
```

Replace `<REPOSITORY_URL>` with your actual Git repository URL.

---

## 🔧 Step 3: Place the `.env` File

Copy the `.env` file you received into the **project root directory**:

```
S66-0126-Synergy-Full-Stack-With-NextjsAnd-AWS-YatraLive/
├── .env                    ← Place the file here
├── package.json
├── docker-compose.yml
├── prisma/
└── ...
```

**Verify it's there:**

```bash
# Windows PowerShell
dir .env

# Mac/Linux
ls -la .env
```

---

## 📦 Step 4: Install Dependencies

```bash
npm install --legacy-peer-deps
```

**Why `--legacy-peer-deps`?**  
This resolves React version conflicts between Next.js 19 and email packages.

**Expected Output:** Installation completes successfully (ignore warnings about vulnerabilities for development).

---

## 🐳 Step 5: Start Docker Services

Start PostgreSQL and Redis containers:

```bash
docker-compose up -d postgres redis
```

**Wait 10 seconds** for services to start, then verify:

```bash
# Check containers are running
docker ps
```

**You should see:**

- `train-tracker-postgres` - Status: Up (healthy)
- `train-tracker-redis` - Status: Up (healthy)

### **Troubleshooting Docker:**

```bash
# If containers fail to start, check logs:
docker logs train-tracker-postgres
docker logs train-tracker-redis

# Restart containers:
docker-compose restart postgres redis
```

---

## 🗄️ Step 6: Setup Database

### **6.1 Run Migrations**

Create all database tables:

```bash
npm run prisma:migrate
```

When prompted for migration name, enter: `initial_setup`

### **6.2 Generate Prisma Client**

Generate TypeScript types:

```bash
npm run prisma:generate
```

### **6.3 Seed Database**

Populate with sample train data:

```bash
npm run seed
```

**Expected Output:**

```
✅ Database cleared
✅ Created 10 stations
✅ Created 5 trains
```

---

## 👤 Step 7: Create Admin User

```bash
npm run create-admin
```

**Follow the prompts:**

1. **Name:** Enter your name (e.g., "Admin")
2. **Email:** Enter email (e.g., "admin@traintracker.com")
3. **Password:** Min 8 chars, must include:
   - Uppercase letter
   - Number
   - Special character
   - Example: `Admin@123`
4. **Confirm Password:** Re-enter the same password

**Save these credentials!** You'll need them to login.

---

## 🚀 Step 8: Start the Application

```bash
npm run dev:all
```

This starts two processes:

1. **Next.js App** - Frontend & API (Port 3000)
2. **Worker Simulation** - Updates train statuses every 8 seconds

**Expected Output:**

```
[0] ▲ Next.js 16.1.6 (Turbopack)
[0] - Local:         http://localhost:3000
[1] 🚂 Train Tracker Worker Started
[1] [Redis] Connected successfully
```

---

## 🌐 Step 9: Access the Application

Open your browser and visit:

### **Public Pages:**

- **Main Dashboard:** http://localhost:3000
  - View live train updates
  - Search trains
  - Add favorites
  - Subscribe to email alerts

### **Admin Panel:**

- **Admin Login:** http://localhost:3000/admin/login
  - Use credentials from Step 7
- **Admin Dashboard:** http://localhost:3000/admin
  - Manage trains
  - View system logs
  - Control simulation
- **Simulation Control:** http://localhost:3000/admin/simulation
  - Adjust delay probability
  - Change update interval

### **Testing:**

- **SSE Test:** http://localhost:3000/test-sse
  - Test real-time updates

---

## ✅ Verification Checklist

Confirm everything is working:

- [ ] Docker containers running (postgres & redis)
- [ ] Database migrations completed
- [ ] Sample trains seeded
- [ ] Admin user created
- [ ] Both app and worker started without errors
- [ ] Can access http://localhost:3000
- [ ] Can login to admin panel
- [ ] Train statuses update automatically (watch for changes)

---

## 🔄 Daily Usage

### **Start the App:**

```bash
# Make sure Docker is running
docker ps

# Start Docker services (if not running)
docker-compose up -d postgres redis

# Start the app
npm run dev:all
```

### **Stop the App:**

```bash
# Press Ctrl+C in terminal to stop app

# Stop Docker containers (optional)
docker-compose down
```

---

## 🛠️ Testing Individual Components

### **Test PostgreSQL Connection:**

```bash
npm run test:postgres
```

### **Test Redis Connection:**

```bash
npm run test:redis
```

### **Test AWS S3 (Photo Upload):**

```bash
npm run test:s3
```

### **Test Email Service:**

```bash
npm run test:email
```

---

## 🐛 Common Issues & Solutions

### **Issue: "REDIS_URL is missing"**

**Solution:** Ensure `.env` file is in the project root directory.

### **Issue: "Cannot connect to database"**

**Solution:**

```bash
# Check Docker containers are running
docker ps

# Restart containers
docker-compose restart postgres redis
```

### **Issue: "Port 3000 already in use"**

**Solution:**

```bash
# Kill process using port 3000
npx kill-port 3000

# Or change port in package.json:
"dev": "next dev -p 3001"
```

### **Issue: "npm install fails"**

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### **Issue: Docker containers keep restarting**

**Solution:**

```bash
# Check logs
docker logs train-tracker-postgres
docker logs train-tracker-redis

# Remove and recreate containers
docker-compose down -v
docker-compose up -d postgres redis
```

---

## 📂 Project Structure

```
S66-0126-Synergy-Full-Stack-With-NextjsAnd-AWS-YatraLive/
├── .env                          # Environment variables (NOT in Git)
├── .env.example                  # Template for .env
├── package.json                  # Dependencies
├── docker-compose.yml            # Docker services config
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript config
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Database migrations
├── app/                         # Next.js pages & API routes
│   ├── page.tsx                 # Main dashboard
│   ├── api/                     # API endpoints
│   └── admin/                   # Admin pages
├── components/                  # React components
├── lib/                         # Core business logic
│   ├── services/                # Service layer
│   ├── redis/                   # Redis client
│   ├── prisma/                  # Prisma client
│   └── utils/                   # Utilities
├── worker/                      # Background simulation engine
├── scripts/                     # Setup & test scripts
└── types/                       # TypeScript types
```

---

## 🔒 Security Notes

### **DO:**

- ✅ Keep `.env` file secure and private
- ✅ Use strong passwords for admin accounts
- ✅ Rotate AWS keys periodically
- ✅ Enable 2FA for admin accounts (in production)

### **DON'T:**

- ❌ Commit `.env` to Git
- ❌ Share `.env` via email or public channels
- ❌ Use weak passwords in production
- ❌ Expose admin panel publicly without HTTPS

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Docker and application logs
3. Contact the project maintainer
4. Check the README.md for additional documentation

---

## 🎯 Next Steps

After setup is complete:

1. **Explore the Dashboard:** Watch trains update in real-time
2. **Login as Admin:** Manage trains and system settings
3. **Test Features:**
   - Search functionality
   - Favorites system
   - Email subscriptions
   - Photo uploads
   - Admin controls
4. **Customize:** Adjust simulation settings in admin panel
5. **Deploy:** When ready, deploy to production (see deployment guide)

---

## 📝 Quick Command Reference

```bash
# Setup
npm install --legacy-peer-deps
docker-compose up -d postgres redis
npm run prisma:migrate
npm run prisma:generate
npm run seed
npm run create-admin

# Run
npm run dev:all

# Test
npm run test:postgres
npm run test:redis
npm run test:s3
npm run test:email

# Database
npm run prisma:studio        # Open database GUI
npm run db:reset             # Reset database
npm run seed:history         # Add historical data

# Stop
Ctrl+C                       # Stop app
docker-compose down          # Stop Docker
```

---

**Happy Coding! 🚂✨**
