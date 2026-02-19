-- CreateTable
CREATE TABLE "journey_history" (
    "id" TEXT NOT NULL,
    "train_id" TEXT NOT NULL,
    "train_number" TEXT NOT NULL,
    "train_name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "route" JSONB NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "scheduled_time" TEXT NOT NULL,
    "actual_time" TEXT,
    "delay_minutes" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ON_TIME',
    "completed_stations" JSONB,
    "final_station_index" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journey_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delay_patterns" (
    "id" TEXT NOT NULL,
    "station_code" TEXT NOT NULL,
    "train_number" TEXT NOT NULL,
    "average_delay" DOUBLE PRECISION NOT NULL,
    "max_delay" INTEGER NOT NULL,
    "total_journeys" INTEGER NOT NULL,
    "delayed_count" INTEGER NOT NULL,
    "hour_of_day" INTEGER,
    "day_of_week" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delay_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT,
    "admin_email" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "before_state" JSONB,
    "after_state" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "journey_history_train_id_idx" ON "journey_history"("train_id");

-- CreateIndex
CREATE INDEX "journey_history_train_number_idx" ON "journey_history"("train_number");

-- CreateIndex
CREATE INDEX "journey_history_scheduled_date_idx" ON "journey_history"("scheduled_date");

-- CreateIndex
CREATE INDEX "journey_history_status_idx" ON "journey_history"("status");

-- CreateIndex
CREATE INDEX "journey_history_delay_minutes_idx" ON "journey_history"("delay_minutes");

-- CreateIndex
CREATE INDEX "delay_patterns_station_code_idx" ON "delay_patterns"("station_code");

-- CreateIndex
CREATE INDEX "delay_patterns_train_number_idx" ON "delay_patterns"("train_number");

-- CreateIndex
CREATE UNIQUE INDEX "delay_patterns_station_code_train_number_hour_of_day_day_of_key" ON "delay_patterns"("station_code", "train_number", "hour_of_day", "day_of_week");

-- CreateIndex
CREATE INDEX "audit_logs_admin_id_idx" ON "audit_logs"("admin_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "system_events_type_idx" ON "system_events"("type");

-- CreateIndex
CREATE INDEX "system_events_level_idx" ON "system_events"("level");

-- CreateIndex
CREATE INDEX "system_events_created_at_idx" ON "system_events"("created_at");

