CREATE TABLE `media_processing_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoAssetId` int NOT NULL,
	`jobType` enum('transcode','transcript','index','moderation_scan') NOT NULL,
	`status` enum('queued','running','succeeded','failed') NOT NULL DEFAULT 'queued',
	`attempt` int NOT NULL DEFAULT 0,
	`lockedAt` timestamp,
	`lockedBy` varchar(160),
	`errorMessage` text,
	`scheduledAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `media_processing_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `media_processing_jobs` ADD CONSTRAINT `media_processing_jobs_videoAssetId_video_assets_id_fk` FOREIGN KEY (`videoAssetId`) REFERENCES `video_assets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `media_jobs_status_scheduled_idx` ON `media_processing_jobs` (`status`,`scheduledAt`);--> statement-breakpoint
CREATE INDEX `media_jobs_asset_idx` ON `media_processing_jobs` (`videoAssetId`);