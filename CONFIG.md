# SentinelSight Configuration Guide

This document describes all configuration options for the SentinelSight platform.

## Environment Variables

### Database Configuration
- **DATABASE_URL**: MySQL connection string (format: `mysql://user:password@host:port/database`)
- **DB_ROOT_PASSWORD**: MySQL root password
- **DB_NAME**: Database name (default: sentinel_sight)
- **DB_USER**: Database user (default: sentinel)
- **DB_PASSWORD**: Database password

### Redis Configuration
- **REDIS_URL**: Redis connection URL (format: `redis://host:port`)

### JWT Configuration
- **JWT_SECRET**: Secret key for signing JWT tokens (min 32 characters)

### OAuth Configuration
- **VITE_APP_ID**: OAuth application ID
- **OAUTH_SERVER_URL**: OAuth server base URL
- **VITE_OAUTH_PORTAL_URL**: OAuth portal URL for login
- **OWNER_OPEN_ID**: Owner's OpenID from OAuth provider
- **OWNER_NAME**: Owner's display name

### Forge API Configuration
- **BUILT_IN_FORGE_API_URL**: Forge API base URL
- **BUILT_IN_FORGE_API_KEY**: Forge API key
- **VITE_FRONTEND_FORGE_API_URL**: Frontend Forge API URL
- **VITE_FRONTEND_FORGE_API_KEY**: Frontend Forge API key

### Application Configuration
- **NODE_ENV**: Environment (development, production)
- **LOG_LEVEL**: Logging level (DEBUG, INFO, WARNING, ERROR)

### Inference Configuration
- **YOLO_MODEL**: YOLO model to use (yolov8n, yolov8s, yolov8m, yolov8l, yolov8x)
- **GPU_ENABLED**: Enable GPU acceleration (true/false)

### MQTT Configuration (Optional)
- **MQTT_BROKER**: MQTT broker URL (format: `mqtt://host:port`)
- **MQTT_USERNAME**: MQTT username
- **MQTT_PASSWORD**: MQTT password

### Storage Configuration
- **AWS_REGION**: AWS region for S3
- **AWS_ACCESS_KEY_ID**: AWS access key
- **AWS_SECRET_ACCESS_KEY**: AWS secret key
- **AWS_S3_BUCKET**: S3 bucket name

### Feature Flags
- **ENABLE_MQTT_EVENTS**: Publish events to MQTT (true/false)
- **ENABLE_CLIP_RECORDING**: Record event clips (true/false)
- **ENABLE_HEATMAPS**: Generate heatmaps (true/false)
- **ENABLE_ANALYTICS**: Advanced analytics (true/false)

### Performance Tuning
- **MAX_CONCURRENT_CAMERAS**: Maximum concurrent camera streams
- **FRAME_BUFFER_SIZE**: Frame buffer size (frames)
- **INFERENCE_BATCH_SIZE**: Batch size for inference
- **EVENT_DEDUP_WINDOW_MS**: Event deduplication window (milliseconds)

### Retention Policies
- **EVENT_RETENTION_DAYS**: Days to retain events (default: 30)
- **SNAPSHOT_RETENTION_DAYS**: Days to retain snapshots (default: 7)
- **CLIP_RETENTION_DAYS**: Days to retain clips (default: 14)

### API Configuration
- **API_PORT**: API server port (default: 3000)
- **API_HOST**: API server host (default: 0.0.0.0)

### Monitoring
- **ENABLE_METRICS**: Enable Prometheus metrics (true/false)
- **METRICS_PORT**: Metrics server port (default: 9090)

## Configuration Files

### docker-compose.yml
Main Docker Compose configuration for containerized deployment. Defines services:
- **db**: MySQL database
- **redis**: Redis cache
- **mqtt**: MQTT broker
- **api**: Node.js API service
- **ingestion**: Python ingestion service
- **inference**: Python inference service
- **rules-engine**: Python rules engine

### drizzle.config.ts
Drizzle ORM configuration for database migrations.

### vite.config.ts
Vite build configuration for frontend.

### tsconfig.json
TypeScript configuration.

## Setup Instructions

### Local Development

1. **Create .env file**
```bash
cp .env.example .env
```

2. **Edit .env with local values**
```bash
# Use localhost for all services
DATABASE_URL=mysql://sentinel:sentinel123@localhost:3306/sentinel_sight
REDIS_URL=redis://localhost:6379
```

3. **Start services**
```bash
# Terminal 1: Start database and Redis
docker-compose up db redis

# Terminal 2: Start API service
pnpm dev

# Terminal 3: Start ingestion service
python3 services/ingestion_service.py

# Terminal 4: Start inference service
python3 services/inference_service.py

# Terminal 5: Start rules engine
python3 services/rules_engine.py
```

### Docker Compose Deployment

1. **Create .env file**
```bash
cp .env.example .env
```

2. **Edit .env with production values**
```bash
# Use service names for Docker Compose
DATABASE_URL=mysql://sentinel:sentinel123@db:3306/sentinel_sight
REDIS_URL=redis://redis:6379
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Verify services**
```bash
docker-compose ps
```

### Production Deployment

1. **Use managed services**
   - AWS RDS for MySQL
   - AWS ElastiCache for Redis
   - AWS S3 for storage

2. **Update environment variables**
```bash
DATABASE_URL=mysql://user:pass@rds-endpoint:3306/db
REDIS_URL=redis://elasticache-endpoint:6379
AWS_S3_BUCKET=production-bucket
```

3. **Deploy with Docker or Kubernetes**

## Security Best Practices

### Secrets Management
- Never commit .env files to version control
- Use secrets management service (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly
- Use strong, random values for JWT_SECRET

### Network Security
- Use HTTPS in production
- Enable firewall rules
- Use VPC/security groups
- Restrict database access

### Database Security
- Use strong passwords
- Enable SSL for database connections
- Regular backups
- Monitor access logs

### API Security
- Enable rate limiting
- Use CORS appropriately
- Validate all inputs
- Use HTTPS only

## Performance Tuning

### Database
- Enable query caching
- Add indexes on frequently queried columns
- Use connection pooling
- Monitor slow queries

### Inference
- Increase batch size for GPU
- Use smaller model (yolov8n) for CPU
- Enable GPU acceleration if available
- Monitor GPU memory usage

### API
- Enable caching headers
- Use compression (gzip)
- Enable connection pooling
- Monitor response times

### Storage
- Use S3 lifecycle policies
- Enable CDN for snapshots
- Compress snapshots
- Monitor storage costs

## Monitoring

### Logs
- Check API logs: `docker-compose logs api`
- Check ingestion logs: `docker-compose logs ingestion`
- Check inference logs: `docker-compose logs inference`
- Check rules engine logs: `docker-compose logs rules-engine`

### Metrics
- API response times
- Inference latency
- Event rate
- Camera stream health
- Resource usage (CPU, memory, GPU)

### Health Checks
- Database connectivity
- Redis connectivity
- MQTT connectivity
- Camera stream status
- Service availability

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
mysql -h localhost -u sentinel -p sentinel_sight

# Check logs
docker-compose logs db
```

### Redis Connection Issues
```bash
# Test connection
redis-cli ping

# Check logs
docker-compose logs redis
```

### API Service Issues
```bash
# Check logs
docker-compose logs api

# Restart service
docker-compose restart api
```

### Inference Service Issues
```bash
# Check logs
docker-compose logs inference

# Verify GPU (if enabled)
nvidia-smi
```

### Camera Connection Issues
```bash
# Test RTSP URL
ffprobe rtsp://user:pass@camera-ip:554/stream

# Check ingestion logs
docker-compose logs ingestion
```

## Scaling Configuration

### Horizontal Scaling
- Deploy multiple API instances behind load balancer
- Deploy multiple inference instances with queue
- Use read replicas for database

### Vertical Scaling
- Increase CPU/memory for services
- Use larger GPU for inference
- Increase database resources

### Configuration Changes
```bash
# Update .env
vi .env

# Restart services
docker-compose down
docker-compose up -d
```

---

**Last Updated**: January 2026
**Version**: 1.0.0
