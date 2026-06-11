# Activity Feed System

A real-time activity feed system built to understand how large-scale feed systems work under the hood — similar to LinkedIn or Twitter's notification feed.

## Architecture
API Service → PostgreSQL + Kafka
↓
Consumer Service → MongoDB + Redis
↓
Feed Reader API

## Tech Stack

| Technology | Why |
|---|---|
| **PostgreSQL** | Relational source of truth — users, follows, posts |
| **Kafka** | Decoupled event bus — fan-out without blocking the API |
| **MongoDB** | Pre-computed feed per user — O(1) reads, no joins |
| **Redis** | In-memory cache — serves hot feed reads in <1ms |
| **Node.js** | API and background services |
| **Docker** | Full local stack with one command |

## Services

- **API Service** (port 3000) — accepts user actions, writes to PostgreSQL, publishes Kafka events
- **Consumer Service** — subscribes to Kafka, fans out feed items to MongoDB, invalidates Redis cache
- **Feed Reader** (port 3001) — serves feeds from Redis cache with MongoDB fallback

## Running Locally

```bash
# Start all infrastructure
docker-compose up -d

# Start API Service
cd services/api-service && node src/index.js

# Start Consumer Service
cd services/consumer-service && node src/index.js

# Start Feed Reader
cd services/feed-reader && node src/index.js
```

## Key Concepts Demonstrated

- **Event-driven architecture** — services communicate via Kafka, not direct HTTP calls
- **Write fan-out pattern** — feed computed at write time, not read time
- **Cache-aside pattern** — Redis checked first, MongoDB as fallback
- **Idempotent consumer** — safe to replay Kafka events without duplicates
- **At-least-once delivery** — Kafka guarantees no event is lost
