# ==============================================
# TRAIN TRACKER - DOCKERFILE
# ==============================================
# This file builds a containerized version of our
# Next.js application with the background worker.
#
# Think of this as creating a self-contained
# train station module that has everything needed
# to run the railway system.
# ==============================================

# ---- Stage 1: Base Image ----
# We use Node.js 20 as our foundation (like laying the concrete foundation)
FROM node:20-alpine AS base

# Set working directory (like designating the construction site)
WORKDIR /app

# Install necessary system dependencies (like installing utilities)
# tini helps handle signals properly (like having a proper station manager)
RUN apk add --no-cache tini

# ---- Stage 2: Dependencies ----
FROM base AS deps

# Copy package files first (like bringing the blueprints)
# This is done before copying source code to leverage Docker caching
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev dependencies for build)
# --frozen-lockfile ensures exact versions (like following blueprints precisely)
RUN npm ci --frozen-lockfile

# ---- Stage 3: Builder ----
FROM base AS builder

# Copy dependencies from deps stage (like moving materials to construction site)
COPY --from=deps /app/node_modules ./node_modules

# Copy source code (like bringing all the building materials)
COPY . .

# Set environment for production build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js application (like constructing the building)
RUN npm run build

# ---- Stage 4: Production Runner ----
FROM base AS runner

# Create a non-root user for security (like hiring staff, not giving them master keys)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set proper permissions (like assigning locker keys)
RUN mkdir -p /app/.next/cache/images && \
    chown -R nextjs:nodejs /app

# Copy built application from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy worker files
COPY --from=builder --chown=nextjs:nodejs /app/worker ./worker
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib
COPY --from=builder --chown=nextjs:nodejs /app/types ./types

# Switch to non-root user (like handing over control to station staff)
USER nextjs

# Expose the port (like opening the station doors)
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Use tini as entrypoint (proper process management)
ENTRYPOINT ["/sbin/tini", "--"]

# ---- Stage 5: Development Runner ----
FROM base AS dev

# Copy everything for development
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install nodemon for hot reload
RUN npm install -g nodemon

# Expose port
EXPOSE 3000

# Default command for development
CMD ["npm", "run", "dev"]