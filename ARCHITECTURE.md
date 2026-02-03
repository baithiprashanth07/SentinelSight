# SentinelSight Architecture & Design Document

## Executive Summary

SentinelSight is a modular, scalable AI video analytics platform designed for real-time surveillance and event management. It follows a microservices architecture with separate services for ingestion, inference, rules processing, and API serving, enabling independent scaling and deployment.

## Research & Best Practices Adoption

### Global Platforms Studied

**1. Milestone XProtect VMS**
- Multi-site architecture with centralized management
- Recording servers handling 100+ cameras per site
- Smart Client for live viewing and playback
- Hierarchical site/camera organization
- **Adopted:** Multi-site grouping, hierarchical camera organization, centralized event management

**2. BriefCam Video Analytics Platform**
- Three-module framework: Review, Respond, Research
- Review: Post-incident search and filtering with accelerated playback
- Respond: Real-time alerts and notifications
- Research: Trend analysis, heatmaps, and quantitative insights
- **Adopted:** Three-tier event management (review past events, respond to alerts, research trends), timeline-based navigation, event filtering and search

**3. Avigilon Unity Visual Alerts**
- "Focus of Attention" concept reducing information overload
- AI-powered detection of security and operational risks
- Proactive alert prioritization
- Multi-site visibility with unified dashboard
- **Adopted:** Alert prioritization with "Attention Required" view, confidence-based filtering, multi-site dashboard

**4. Frigate NVR**
- Local-first architecture with privacy-first approach
- RTSP stream ingestion with auto-reconnect
- Zone-based detection with configurable rules
- MQTT event messaging for integrations
- YOLO-based object detection
- **Adopted:** RTSP ingestion, zone-based rules, MQTT event publishing, YOLO detection, local processing

## System Architecture

### Service Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Web Dashboard (React)                     │
│              Camera Management • Event Monitoring                │
│            Zone Editor • Alert Viewer • Timeline Nav             │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      API Service (Express/tRPC)                  │
│        Cameras • Events • Zones • Users • Sites • Rules          │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼────────┐ ┌────▼──────────┐ ┌──▼────────────────┐
│  Event Store   │ │  Rules Engine │ │  Inference Queue │
│   (Database)   │ │  (Zone Rules) │ │   (Redis/Memory) │
└────────────────┘ └────┬──────────┘ └──┬────────────────┘
                        │               │
        ┌───────────────┴───────────────┘
        │
┌───────▼────────────────────────────────────────────────────────┐
│                   Inference Service (Python)                    │
│              YOLO Object Detection • Frame Processing           │
└───────┬────────────────────────────────────────────────────────┘
        │
┌───────▼────────────────────────────────────────────────────────┐
│                  Ingestion Service (Python)                     │
│         RTSP Stream Pulling • Frame Decoding • Buffering        │
└────────────────────────────────────────────────────────────────┘
        │
        └─────────────────────────────────────────┐
                                                  │
                                    ┌─────────────▼──────────┐
                                    │  RTSP Camera Streams   │
                                    │  (CCTV Sources)        │
                                    └────────────────────────┘
```

### Data Flow

1. **Ingestion:** RTSP streams → Frame extraction → Buffering
2. **Inference:** Buffered frames → YOLO detection → Detections with confidence
3. **Rules Engine:** Detections + Zones → Rule evaluation → Events
4. **Event Store:** Events → Database persistence → API queries
5. **Dashboard:** Real-time updates via WebSocket/polling → UI rendering

## Database Schema

### Core Tables

**cameras**
- id, name, location_tag, rtsp_url, site_id, status, fps, last_frame_time, created_at, updated_at

**sites**
- id, name, location, description, created_at, updated_at

**zones**
- id, camera_id, name, polygon_points (JSON), zone_type (intrusion/loitering), created_at

**events**
- id, camera_id, zone_id, timestamp, rule_type, object_type, confidence, bounding_box (JSON), snapshot_url, clip_url, created_at

**rules**
- id, zone_id, rule_type (intrusion/loitering), threshold_seconds, enabled, created_at

**users**
- id, openId, name, email, role (admin/operator/viewer), created_at, updated_at

## API Endpoints

### Cameras
- `GET /api/cameras` - List all cameras with status
- `POST /api/cameras` - Add new camera
- `GET /api/cameras/:id` - Get camera details
- `PUT /api/cameras/:id` - Update camera
- `DELETE /api/cameras/:id` - Remove camera

### Events
- `GET /api/events` - List events with filters (camera_id, rule_type, from, to)
- `GET /api/events/:id` - Get event details with snapshot
- `DELETE /api/events/:id` - Delete event

### Zones
- `GET /api/zones?camera_id=:id` - List zones for camera
- `POST /api/zones` - Create zone
- `PUT /api/zones/:id` - Update zone
- `DELETE /api/zones/:id` - Delete zone

### Rules
- `GET /api/rules?zone_id=:id` - List rules for zone
- `POST /api/rules` - Create rule
- `PUT /api/rules/:id` - Update rule
- `DELETE /api/rules/:id` - Delete rule

### System
- `GET /api/health` - System health status
- `GET /api/metrics` - Performance metrics (FPS, latency, queue sizes)

## Key Features

### MVP Features
1. **Multi-camera RTSP ingestion** with auto-reconnect and status monitoring
2. **YOLO object detection** for people and vehicles
3. **Zone-based rules** (intrusion, loitering)
4. **Event persistence** with filtering
5. **Web dashboard** with camera list, live preview, event feed
6. **Zone editor** with visual and JSON support

### Advanced Features
1. **Multi-site organization** with hierarchical grouping
2. **Real-time alert view** with "Attention Required" filtering
3. **Timeline navigation** with event jump functionality
4. **Event clip recording** with pre/post seconds
5. **Heatmaps and trends** for research and analysis
6. **Role-based access control** (Admin/Operator/Viewer)
7. **MQTT event publishing** for integrations
8. **Audit trail** for compliance

## Deployment Strategy

### Docker Compose Services
1. **ingestion-service** - Python service pulling RTSP streams
2. **inference-service** - Python service running YOLO detection
3. **rules-engine** - Python service evaluating zone rules
4. **api-service** - Express/Node.js tRPC API server
5. **ui-service** - React web dashboard
6. **database** - MySQL for persistence
7. **redis** - In-memory queue for frame buffering
8. **mqtt** - Message broker for event publishing

### Scaling Considerations
- Horizontal scaling of inference service for multiple cameras
- Load balancing across API instances
- Database replication for high availability
- Redis clustering for distributed caching

## Performance & Optimization

### Latency Targets
- Frame ingestion to detection: <100ms
- Detection to event generation: <50ms
- Event to dashboard display: <500ms

### Optimization Strategies
- Frame resolution optimization per camera
- Batch processing for inference
- Efficient zone polygon intersection checks
- Event deduplication for loitering detection
- Snapshot compression and storage optimization

## Security & Privacy

### Data Minimization
- Store events and snapshots, not full video
- Configurable snapshot retention policies
- Automatic cleanup of old events

### Access Control
- Role-based permissions (Admin/Operator/Viewer)
- API authentication via JWT
- Audit logging for all operations

### Privacy Compliance
- GDPR-safe event storage with retention policies
- Data anonymization options for snapshots
- Configurable data residency

## Known Limitations & Future Work

### Current Limitations
1. Single-model inference (YOLO only)
2. No multi-model ensemble detection
3. Basic zone polygon support (no complex shapes)
4. No persistent video recording (events only)
5. Limited historical trend analysis

### Future Enhancements (2+ weeks)
1. Multi-model detection ensemble for accuracy
2. Advanced zone shapes and mask support
3. Full video recording with event indexing
4. Advanced analytics (heatmaps, crowd counting, behavior analysis)
5. Distributed inference across GPU clusters
6. Advanced search with metadata and tagging
7. Mobile app for remote monitoring
8. Integration with external alert systems (SMS, email, Slack)
9. Performance optimization with hardware acceleration (OpenVINO, DeepStream)
10. Multi-tenant support for managed services

## Development Timeline

**Day 1:**
- Database schema and API design
- Backend service scaffolding
- RTSP ingestion and frame buffering
- Basic YOLO inference pipeline

**Day 2:**
- Zone-based rules engine
- Event persistence and querying
- Web dashboard UI
- Docker Compose configuration
- Testing and documentation

## Conclusion

SentinelSight combines proven patterns from industry-leading surveillance platforms with modern cloud-native architecture. The modular design enables independent scaling and evolution of each component, while the focus on local processing and privacy-first design aligns with modern security requirements.
