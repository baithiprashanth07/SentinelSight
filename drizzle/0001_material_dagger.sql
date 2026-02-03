CREATE TABLE `alertSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cameraId` int,
	`ruleType` enum('intrusion','loitering','counting','custom','all') NOT NULL DEFAULT 'all',
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alertSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(255) NOT NULL,
	`resourceType` varchar(100) NOT NULL,
	`resourceId` int,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cameras` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`locationTag` varchar(255),
	`rtspUrl` varchar(512) NOT NULL,
	`status` enum('online','offline','error') NOT NULL DEFAULT 'offline',
	`fps` decimal(5,2) DEFAULT '30',
	`lastFrameTime` timestamp,
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cameras_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `detections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cameraId` int NOT NULL,
	`frameNumber` int NOT NULL,
	`timestamp` timestamp NOT NULL,
	`objectType` varchar(50) NOT NULL,
	`confidence` decimal(3,2) NOT NULL,
	`boundingBox` json NOT NULL,
	`trackId` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `detections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cameraId` int NOT NULL,
	`zoneId` int,
	`ruleId` int,
	`timestamp` timestamp NOT NULL,
	`ruleType` enum('intrusion','loitering','counting','custom') NOT NULL,
	`objectType` varchar(50) NOT NULL,
	`confidence` decimal(3,2) NOT NULL,
	`boundingBox` json,
	`snapshotUrl` varchar(512),
	`clipUrl` varchar(512),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`zoneId` int NOT NULL,
	`ruleType` enum('intrusion','loitering','counting','custom') NOT NULL,
	`objectType` enum('person','vehicle','any') NOT NULL DEFAULT 'any',
	`thresholdSeconds` int DEFAULT 0,
	`confidenceThreshold` decimal(3,2) DEFAULT '0.5',
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`location` varchar(255),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `zones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cameraId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`polygonPoints` json,
	`zoneType` enum('intrusion','loitering','counting','general') NOT NULL DEFAULT 'general',
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `zones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('viewer','operator','admin') NOT NULL DEFAULT 'viewer';