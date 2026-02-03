ALTER TABLE `cameras` MODIFY COLUMN `fps` decimal(5,2) DEFAULT 30;--> statement-breakpoint
ALTER TABLE `rules` MODIFY COLUMN `confidenceThreshold` decimal(3,2) DEFAULT 0.5;