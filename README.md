# 🚂 Real-Time Train Tracker

A production-grade real-time train tracking system built with Next.js, TypeScript, and Redis.

## 🎯 Project Overview

This system simulates a live railway information display with:

- Real-time train status updates (On Time / Delayed / Cancelled)
- Automatic UI updates via Server-Sent Events (SSE)
- Background worker simulating railway operations
- Redis as an in-memory state store

## Architecture

Frontend (Next.js) ← SSE → API Layer ←→ Redis

Worker (Simulation)

## 🚀 Quick Start

1. Clone this repository
2. Copy `.env.example` to `.env.local` and add your Redis URL
3. Install dependencies: `npm install`
4. Seed the database: `npm run seed`
5. Start the worker: `npm run worker`
6. Start the dev server: `npm run dev`

## 📁 Project Structure

train-tracker/
├── app/ # Next.js App Router pages & API
├── components/ # React components
├── lib/ # Core business logic
├── worker/ # Background simulation engine
├── types/ # TypeScript type definitions
└── scripts/ # Utility scripts

## ️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Redis (Upstash)
- **Real-time**: Server-Sent Events (SSE)
- **Worker**: Node.js background process

## 📊 Features

- ✅ Live train dashboard with auto-updating table
- ✅ Real-time status changes (delays, platform changes, cancellations)
- ✅ Station arrival/departure boards
- ✅ Train journey timeline view
- ✅ Admin panel for simulation control
- ✅ System health monitoring

## 🔧 Development

```bash
# Install dependencies
npm install
# Start development server
npm run dev
# Run TypeScript compiler
npm run type-check
# Lint code
npm run lint
# Format code
npm run format
```

📝 Environment Variables
See `.env.example` for required environment variables.

🧪 Simulation Logic

The worker updates trains every 8 seconds with:
30% chance of delay (1-30 minutes)
5% chance of platform change
2% chance of cancellation
Automatic delay recovery over time

## 📄 License

MIT
