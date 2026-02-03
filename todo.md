# SentinelSight - Project TODO

## Phase 1: Architecture & Planning
- [x] Research global platforms (Milestone, BriefCam, Avigilon, Frigate)
- [x] Document architecture decisions and best practices
- [x] Create system architecture diagram

## Phase 2: Database Schema & API Design
- [x] Design database schema (cameras, events, zones, users, sites)
- [x] Define REST API endpoints
- [x] Create tRPC procedures for all operations

## Phase 3: Backend Services Implementation
- [ ] Implement RTSP ingestion service with auto-reconnect
- [ ] Implement YOLO-based object detection service
- [ ] Implement zone-based rules engine (intrusion, loitering)
- [x] Implement event store and persistence (database layer)
- [x] Create REST API endpoints for cameras and events
- [x] Implement event filtering (by camera, rule, time)

## Phase 4: Web Dashboard UI
- [x] Design dashboard layout and navigation
- [x] Implement camera list with status display
- [ ] Implement live preview component
- [x] Implement event feed with filtering
- [ ] Implement event details view with snapshots
- [x] Implement zone editor (JSON input)

## Phase 5: Advanced Features
- [ ] Multi-site camera grouping with location tags
- [ ] Real-time alert view with "Attention Required" filtering
- [ ] Timeline navigation and event jump functionality
- [ ] Event clip recording with pre/post seconds
- [ ] Heatmaps and trend visualization
- [x] Role-based access control (Admin/Operator/Viewer)

## Phase 6: Deployment & Containerization
- [x] Create Docker Compose configuration
- [ ] Containerize ingestion service
- [ ] Containerize inference service
- [ ] Containerize rules engine service
- [x] Containerize API service (via Dockerfile)
- [x] Containerize UI service (via Dockerfile)
- [x] Create deployment documentation

## Phase 7: Testing & Demo
- [ ] Create test RTSP stream simulator
- [ ] Test end-to-end workflow
- [x] Create demo script
- [ ] Create screen recording

## Phase 8: Documentation
- [x] Write comprehensive README
- [ ] Document API endpoints (OpenAPI/Postman)
- [x] Create research & best practices notes
- [x] Document known limitations and next steps
- [x] Create architecture documentation
- [x] Create configuration guide


## Phase 9: Real-Time Notification System
- [ ] Implement WebSocket support for live event notifications
- [ ] Create notification tRPC procedures (subscribe, unsubscribe, get history)
- [ ] Build NotificationCenter component for alert display
- [ ] Build NotificationBell component with unread count
- [ ] Create useNotifications hook for frontend integration
- [ ] Implement notification filtering by severity and camera
- [ ] Add notification preferences/settings
- [ ] Create notification history view
- [ ] Add sound and browser notifications for critical alerts
- [ ] Implement notification persistence in database
