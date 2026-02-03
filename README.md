# SentinelSight - AI Video Analytics Platform

A comprehensive, modular AI video analytics platform for real-time surveillance, object detection, and event management. Built with modern cloud-native architecture supporting multi-camera RTSP ingestion, YOLO-based object detection, zone-based rules, and a responsive web dashboard.

## Overview

SentinelSight combines proven patterns from industry-leading surveillance platforms (Milestone XProtect, BriefCam, Avigilon, Frigate) with modern web technologies. The platform is designed to be:

- **Modular**: Separate services for ingestion, inference, rules processing, and API
- **Scalable**: Horizontal scaling of inference services for multiple cameras
- **Privacy-First**: Local processing, event-based storage (not full video)
- **Extensible**: Support for multiple detection models and custom rules
- **User-Friendly**: Intuitive dashboard with role-based access control

## Features

### MVP Features (Implemented)
- ✅ Multi-camera RTSP stream ingestion with auto-reconnect
- ✅ Camera status monitoring (online/offline/error)
- ✅ Zone-based detection rules (intrusion, loitering, counting)
- ✅ Event persistence and querying with filters
- ✅ Web dashboard with camera list and event monitoring
- ✅ Zone editor with polygon support
- ✅ Role-based access control (Admin/Operator/Viewer)
- ✅ Audit logging for compliance

### Advanced Features (Roadmap)
- Multi-site camera grouping with hierarchical organization
- Real-time alert view with "Attention Required" filtering
- Timeline navigation and event jump functionality
- Event clip recording with pre/post seconds
- Heatmaps and trend visualization
- MQTT event publishing for integrations
- OpenAPI documentation and Postman collection

## Architecture

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

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 22+ (for local development)
- Python 3.9+ (for local development)
- MySQL 8.0+ (or use Docker)

### Setup with Docker Compose

1. **Clone the repository**
```bash
git clone https://github.com/baithiprashanth07/SentinelSight.git
cd sentinel-sight
```

2. **Create environment file**
```bash
cp .env
# Edit .env with your configuration
```

3. **Start services**
```bash
docker-compose up -d
```

4. **Access the dashboard**
- Open `http://localhost:3000` in your browser
- Log in with your credentials

### Local Development Setup

1. **Install dependencies**
```bash
pnpm install
```

2. **Setup database**
```bash
pnpm db:push
```

3. **Start development server**
```bash
pnpm dev
```

4. **Start backend services** (in separate terminals)
```bash
# Ingestion service
python3 services/ingestion_service.py

# Inference service
python3 services/inference_service.py

# Rules engine
python3 services/rules_engine.py
```

## Configuration

### Adding a Camera Stream

1. Navigate to **Cameras** tab in the dashboard
2. Click **Add Camera**
3. Fill in the form:
   - **Site**: Select the location
   - **Camera Name**: Descriptive name (e.g., "Front Door")
   - **Location Tag**: Optional location details
   - **RTSP URL**: Camera stream URL (e.g., `rtsp://user:pass@192.168.1.100:554/stream`)
4. Click **Add Camera**

The camera will appear in the dashboard with status "offline" until the stream connects.

### Creating Detection Zones

1. Navigate to **Zones** tab
2. Select a camera
3. Click **Add Zone**
4. Define the zone:
   - **Zone Name**: Descriptive name
   - **Zone Type**: Intrusion, Loitering, Counting, or General
   - **Polygon Points**: JSON array of coordinates
     ```json
     [
       {"x": 0, "y": 0},
       {"x": 100, "y": 0},
       {"x": 100, "y": 100},
       {"x": 0, "y": 100}
     ]
     ```

### Configuring Rules

Rules are created per zone and define detection logic:

- **Intrusion**: Person enters restricted zone
- **Loitering**: Person remains in zone > N seconds
- **Counting**: Count objects entering/exiting zone
- **Custom**: User-defined logic

Rules can be configured via API or future UI enhancements.

## API Endpoints

### Cameras
- `GET /api/trpc/cameras.list` - List all cameras
- `POST /api/trpc/cameras.create` - Add new camera
- `GET /api/trpc/cameras.getById` - Get camera details
- `PUT /api/trpc/cameras.update` - Update camera
- `DELETE /api/trpc/cameras.delete` - Remove camera

### Events
- `GET /api/trpc/events.list` - List events with filters
- `GET /api/trpc/events.getById` - Get event details
- `GET /api/trpc/events.count` - Get event count
- `DELETE /api/trpc/events.delete` - Delete event

### Zones
- `GET /api/trpc/zones.list` - List zones for camera
- `POST /api/trpc/zones.create` - Create zone
- `PUT /api/trpc/zones.update` - Update zone
- `DELETE /api/trpc/zones.delete` - Delete zone

### Rules
- `GET /api/trpc/rules.list` - List rules for zone
- `POST /api/trpc/rules.create` - Create rule
- `PUT /api/trpc/rules.update` - Update rule
- `DELETE /api/trpc/rules.delete` - Delete rule

### Sites
- `GET /api/trpc/sites.list` - List all sites
- `POST /api/trpc/sites.create` - Create site
- `PUT /api/trpc/sites.update` - Update site
- `DELETE /api/trpc/sites.delete` - Delete site

## Testing

### Running Tests
```bash
pnpm test
```

### Manual Testing Workflow

1. **Add a test site**
   - Navigate to Dashboard
   - Create a new site via API or future UI

2. **Add a test camera**
   - Use a public RTSP stream or local test stream
   - Example: `rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov`

3. **Create a detection zone**
   - Define a zone with polygon coordinates
   - Set zone type to "intrusion"

4. **Create a detection rule**
   - Set threshold for intrusion detection
   - Set confidence threshold (e.g., 0.5)

5. **Monitor events**
   - Events should appear in the Event Monitor tab
   - Filter by camera, rule type, and time range

## Database Schema

### Core Tables

**cameras**
- id, name, location_tag, rtsp_url, site_id, status, fps, last_frame_time

**zones**
- id, camera_id, name, polygon_points (JSON), zone_type, enabled

**rules**
- id, zone_id, rule_type, object_type, threshold_seconds, confidence_threshold

**events**
- id, camera_id, zone_id, rule_id, timestamp, rule_type, object_type, confidence, bounding_box, snapshot_url, clip_url

**sites**
- id, name, location, description

**users**
- id, openId, name, email, role (viewer/operator/admin)

**detections** (for tracking)
- id, camera_id, frame_number, timestamp, object_type, confidence, bounding_box, track_id

**alert_subscriptions**
- id, user_id, camera_id, rule_type, enabled

**audit_logs**
- id, user_id, action, resource_type, resource_id, details

## Performance & Scaling

### Optimization Strategies

1. **Frame Ingestion**
   - Configurable frame rate per camera
   - Adaptive resolution based on available bandwidth
   - Frame buffering with configurable queue size

2. **Inference**
   - Batch processing for multiple detections
   - Model caching and optimization
   - GPU acceleration support (CUDA, OpenVINO)

3. **Event Processing**
   - Event deduplication for loitering detection
   - Efficient zone polygon intersection checks
   - Snapshot compression and cleanup

4. **Database**
   - Indexed queries on camera_id, timestamp, rule_type
   - Automatic event retention policies
   - Read replicas for scaling

### Scaling Considerations

- **Horizontal**: Deploy multiple inference service instances
- **Vertical**: Increase GPU memory and CPU cores
- **Database**: Use MySQL replication or managed services
- **Storage**: S3 for snapshots and clips

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

## Known Limitations

1. **Single Model**: Currently supports YOLO only (multi-model support in roadmap)
2. **Zone Shapes**: Basic polygon support (no complex shapes or masks)
3. **Video Recording**: Events only (full video recording in roadmap)
4. **Analytics**: Limited historical trend analysis
5. **Real-time**: WebSocket support for live updates (polling fallback)

## Future Enhancements (2+ weeks)

1. **Multi-Model Detection**: Ensemble detection for accuracy
2. **Advanced Zones**: Mask support, complex shapes, heat maps
3. **Full Video Recording**: Event-indexed video with fast search
4. **Advanced Analytics**: Crowd counting, behavior analysis, trends
5. **Distributed Inference**: GPU cluster support with load balancing
6. **Mobile App**: Native iOS/Android clients
7. **Integrations**: Slack, email, SMS alerts; webhook support
8. **Hardware Acceleration**: OpenVINO, DeepStream optimization
9. **Multi-Tenant**: Managed service support
10. **Advanced Search**: Metadata tagging, semantic search

## Deployment

### Docker Compose
```bash
docker-compose up -d
```

### Kubernetes
```bash
kubectl apply -f k8s/
```

### Cloud Platforms
- AWS: ECS, RDS, S3
- GCP: Cloud Run, Cloud SQL, Cloud Storage
- Azure: Container Instances, Azure Database, Blob Storage

## Support & Documentation

- **Issues**: Report bugs and feature requests on GitHub
- **Documentation**: See `/docs` directory
- **Architecture**: See `ARCHITECTURE.md`
- **API**: See OpenAPI spec (future)

## Final output
<img width="1280" height="720" alt="image" src="https://github.com/user-attachments/assets/004746e4-bf2f-4012-8dd8-f8ca9687daca" />

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Acknowledgments

This project was inspired by industry-leading surveillance platforms:
- **Milestone XProtect**: Multi-site architecture and VMS patterns
- **BriefCam**: Review/Respond/Research framework
- **Avigilon**: Focus of Attention and alert prioritization
- **Frigate**: Local-first architecture and MQTT integration

---

**Status**: MVP Complete • **Last Updated**: January 2026
