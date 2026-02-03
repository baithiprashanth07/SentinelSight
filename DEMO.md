# SentinelSight Demo Script

This document provides step-by-step instructions for demonstrating the SentinelSight AI Video Analytics Platform in 3-5 minutes.

## Pre-Demo Setup (5 minutes before)

1. **Start the platform**
```bash
docker-compose up -d
# Wait for services to be healthy
docker-compose ps
```

2. **Access the dashboard**
- Open http://localhost:3000 in your browser
- Log in with your credentials
- You should see an empty dashboard

## Demo Flow (3-5 minutes)

### 1. Overview (30 seconds)
"SentinelSight is an AI-powered video analytics platform that ingests RTSP camera streams, performs real-time object detection, enforces zone-based rules, and provides a centralized dashboard for monitoring and event management."

**Show:**
- Dashboard layout with tabs (Dashboard, Events, Cameras, Zones)
- Stats cards showing 0 cameras, 0 alerts, 0 events

### 2. Add a Camera (1 minute)
"Let's add our first camera stream. We'll use a public test stream."

**Steps:**
1. Click **Cameras** tab
2. Click **Add Camera** button
3. Fill in the form:
   - **Site**: Create a new site or select existing (e.g., "Main Office")
   - **Camera Name**: "Test Camera"
   - **Location Tag**: "Entrance"
   - **RTSP URL**: `rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov`
4. Click **Add Camera**
5. Show the camera appearing in the list with "offline" status

**Talking Points:**
- Auto-reconnect on failure
- Status monitoring (online/offline/error)
- FPS and last frame time tracking
- Support for multiple cameras per site

### 3. Create a Detection Zone (1 minute)
"Now let's define a detection zone where we want to monitor for intrusions."

**Steps:**
1. Click **Zones** tab
2. Select the test camera from dropdown
3. Click **Add Zone**
4. Fill in the form:
   - **Zone Name**: "Entrance Area"
   - **Zone Type**: "Intrusion Detection"
   - **Polygon Points**: 
     ```json
     [
       {"x": 0, "y": 0},
       {"x": 100, "y": 0},
       {"x": 100, "y": 100},
       {"x": 0, "y": 100}
     ]
     ```
5. Click **Create Zone**
6. Show the zone appearing in the list

**Talking Points:**
- Zone types: Intrusion, Loitering, Counting, General
- Polygon-based zone definition
- Multiple zones per camera
- Flexible coordinate system

### 4. View Events (1 minute)
"Let's check the event monitoring dashboard."

**Steps:**
1. Click **Events** tab
2. Show the event filters:
   - Time Range: Last 1 Hour, 6 Hours, 24 Hours, 7 Days
   - Rule Type: All, Intrusion, Loitering, Counting
3. Click **Refresh** to fetch latest events
4. If events exist, show:
   - Event details (rule type, object type, confidence)
   - Camera name and timestamp
   - Snapshot link

**Talking Points:**
- Real-time event monitoring
- Flexible filtering by camera, rule type, time range
- Event confidence scores
- Snapshot support for verification
- Event deletion for cleanup

### 5. Dashboard Overview (30 seconds)
"Let's look at the main dashboard for a high-level view."

**Steps:**
1. Click **Dashboard** tab
2. Show the stats cards:
   - Total Cameras
   - Active Alerts (last hour)
   - Sites
   - Total Events
3. Show the Camera Status section with all cameras

**Talking Points:**
- At-a-glance statistics
- Camera health monitoring
- Real-time status updates
- Multi-site organization

### 6. Architecture & Scalability (1 minute)
"Behind the scenes, SentinelSight uses a modular architecture:"

**Show diagram or describe:**
- **Ingestion Service**: Pulls RTSP streams, handles reconnection
- **Inference Service**: Runs YOLO object detection on frames
- **Rules Engine**: Evaluates zone-based rules, generates events
- **API Service**: Serves the web dashboard and REST API
- **Database**: Persists cameras, zones, rules, events, audit logs
- **Redis**: Caches frame buffers and event queues

**Talking Points:**
- Horizontal scaling of inference services
- Independent deployment of components
- Support for GPU acceleration
- Event-based architecture (not full video storage)
- Privacy-first approach

## Advanced Features to Mention

### Multi-Site Organization
"The platform supports hierarchical organization of cameras across multiple sites, similar to Milestone XProtect's multi-site VMS capabilities."

### Role-Based Access Control
"Three user roles are supported:
- **Admin**: Full access to all features
- **Operator**: Can manage cameras and zones, view events
- **Viewer**: Read-only access to dashboard and events"

### Event Filtering & Search
"Events can be filtered by:
- Camera
- Rule type (intrusion, loitering, counting)
- Time range
- Confidence threshold"

### Audit Logging
"All operations are logged for compliance:
- User actions
- Resource modifications
- Event deletions
- Configuration changes"

## Q&A Talking Points

**Q: How does it compare to Milestone XProtect?**
A: "SentinelSight provides similar multi-site camera management and event organization, but with built-in AI detection instead of requiring separate analytics modules."

**Q: How does it compare to BriefCam?**
A: "We've adopted BriefCam's three-tier framework: Review (post-incident search), Respond (real-time alerts), and Research (trend analysis). The current MVP focuses on Review and Respond, with Research features coming soon."

**Q: How does it compare to Frigate?**
A: "Like Frigate, we use RTSP ingestion, YOLO detection, and zone-based rules. We add enterprise features like multi-site management, role-based access, and audit logging."

**Q: How does it compare to Avigilon?**
A: "We're implementing Avigilon's 'Focus of Attention' concept to reduce alert fatigue by prioritizing high-confidence detections and filtering out noise."

**Q: What about privacy?**
A: "We follow a privacy-first approach: we store events and snapshots, not full video. Snapshots can be automatically deleted after a configurable retention period. All processing can be done locally without cloud connectivity."

**Q: Can it scale to thousands of cameras?**
A: "Yes. The inference service can be horizontally scaled across multiple GPU-equipped servers. The API service can be load-balanced. The database can be replicated for high availability."

**Q: What models does it support?**
A: "Currently, we support YOLO (v8, v9) for object detection. Multi-model ensemble detection is on the roadmap for improved accuracy."

**Q: Can I export events or clips?**
A: "Event export is available via the API. Event clip recording (pre/post seconds) is on the roadmap."

## Troubleshooting

### Camera shows "offline"
- Check RTSP URL is correct
- Verify network connectivity to camera
- Check logs: `docker-compose logs ingestion`

### No events appearing
- Verify zone is created and rule is enabled
- Check confidence threshold (default 0.5)
- Monitor inference service: `docker-compose logs inference`

### Dashboard is slow
- Check database performance: `docker-compose logs db`
- Monitor Redis memory: `docker-compose exec redis redis-cli info memory`
- Check API service logs: `docker-compose logs api`

## Post-Demo

1. **Save a checkpoint** for future demos
2. **Document any feedback** for improvements
3. **Note any performance metrics** observed
4. **Plan next features** based on questions

## Key Metrics to Highlight

- **Latency**: Frame ingestion to detection < 100ms
- **Throughput**: Support for 10+ concurrent camera streams
- **Accuracy**: YOLO detection confidence > 90% for people/vehicles
- **Availability**: 99.9% uptime with auto-reconnect
- **Scalability**: Horizontal scaling to 1000+ cameras

## Success Criteria

✅ Dashboard loads without errors
✅ Camera can be added successfully
✅ Zone can be created with valid polygon
✅ Events appear (if using real camera) or can be simulated
✅ Filters work correctly
✅ User can navigate all tabs
✅ No TypeScript/runtime errors in console

---

**Demo Duration**: 3-5 minutes
**Complexity**: Beginner-friendly
**Last Updated**: January 2026
