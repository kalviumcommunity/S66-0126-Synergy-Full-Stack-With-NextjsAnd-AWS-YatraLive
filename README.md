# YatraLive

A **real-time train tracking system** built with **Next.js, Redis, and TypeScript**.  
This project simulates train schedules, delays, and status updates to help commuters make informed decisions.

---

## **Project Overview**

Millions of local trains in India run late daily, and passengers rarely get **real-time updates** or reroutes.  
This system provides a **demo-ready solution** to visualize train statuses in real time, including:

Delayed trains
Cancelled trains
Updated current arrival times
Platform information

---

## **Tech Stack**

**Frontend & API Layer:** Next.js (TypeScript)
**Database:** PostgreSQL (planned for persistence)
**Caching Layer:** Redis (stores real-time train updates)
**Containerization:** Docker
**Deployment & Cloud:** AWS or Azure (optional)
**Version Control & CI/CD:** GitHub Actions

---
## **Features**

Display train details in a responsive table
Real-time updates for train status every 5 seconds
Color-coded status:
  - Green → On Time
  - Red → Delayed
  - Gray → Cancelled
Simulated platform and time updates
API endpoint to fetch train data: /api/trains
Ready for integration with real-time train APIs in the future

---

## Future Improvements

Integrate real train APIs for live data

Add reroutes and alerts for passengers

Store historical data in PostgreSQL

Deploy using Docker + AWS/Azure

## **Setup Instructions**

### **1. Clone the repository**
bash
git clone https://github.com/kalviumcommunity/S66-0126-Synergy-Full-Stack-With-NextjsAnd-AWS-YatraLive.git
cd S66-0126-Synergy-Full-Stack-With-NextjsAnd-AWS-YatraLive
### 2. Install dependencies
npm install

### 3. Install and start Redis
Windows: Download Redis

Mac: brew install redis

Linux: sudo apt install redis-server

Start Redis server:

redis-server
### 4. Run the train simulation
node scripts/simulateTrains.ts

This script updates train status in Redis every 5 seconds.

### 5. Start the Next.js server
npm run dev


Open http://localhost:3000 to see the live train table.

### 6. Frontend

The frontend fetches data from /api/trains every 5 seconds and displays it in a table.
