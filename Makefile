# ==============================================
# DOCKER MAKEFILE FOR TRAIN TRACKER
# ==============================================
# Makes Docker commands easier to remember
# ==============================================

.PHONY: help build up down logs clean seed test shell

# Default target
help:
	@echo "🚂 Train Tracker Docker Commands"
	@echo ""
	@echo "  make build    - Build all Docker images"
	@echo "  make up       - Start all services"
	@echo "  make down     - Stop all services"
	@echo "  make logs     - View logs"
	@echo "  make clean    - Remove containers and volumes"
	@echo "  make seed     - Seed database"
	@echo "  make test     - Run tests"
	@echo "  make shell    - Open shell in app container"
	@echo ""
	@echo "  make prod-up  - Start in production mode"
	@echo "  make dev-up   - Start in development mode"
	@echo ""

# Build images
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "   App: http://localhost:3000"
	@echo "   Redis Insight: http://localhost:5540"

# Stop all services
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Clean everything
clean:
	docker-compose down -v
	docker system prune -f
	@echo "✅ Clean complete"

# Seed database
seed:
	docker-compose exec nextjs-app npm run seed

# Run tests
test:
	docker-compose exec nextjs-app npm run test:redis

# Open shell
shell:
	docker-compose exec nextjs-app sh

# Production mode
prod-up:
	@echo "🚂 Starting in PRODUCTION mode..."
	docker-compose -f docker-compose.yml up -d
	@echo "✅ Production services started!"

# Development mode
dev-up:
	@echo "🚂 Starting in DEVELOPMENT mode..."
	NODE_ENV=development docker-compose up -d
	@echo "✅ Development services started!"

# Start with all profiles
full-up:
	docker-compose --profile monitoring --profile with-proxy --profile with-backup up -d
	@echo "✅ Full stack started!"

# Backup Redis
backup:
	docker-compose exec redis redis-cli SAVE
	docker cp train-tracker-redis:/data/dump.rdb ./backups/dump-$$(date +%Y%m%d-%H%M%S).rdb
	@echo "✅ Backup created in ./backups/"

# Restore Redis from backup
restore:
	@echo "Please specify backup file: make restore FILE=backup.rdb"
	docker cp ./backups/$(FILE) train-tracker-redis:/data/dump.rdb
	docker-compose restart redis
	@echo "✅ Restored from $(FILE)"