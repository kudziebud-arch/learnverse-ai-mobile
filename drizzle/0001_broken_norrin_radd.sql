CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorUserId` int,
	`organizationId` int,
	`action` varchar(160) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` varchar(120),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`position` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_modules_position_unique` UNIQUE(`courseId`,`position`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`createdByUserId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`subject` varchar(120),
	`level` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`visibility` enum('private','organization','public','unlisted') NOT NULL DEFAULT 'private',
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learner_states` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`state` json NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learner_states_id` PRIMARY KEY(`id`),
	CONSTRAINT `learner_states_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `learning_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventType` enum('VIDEO_STARTED','VIDEO_COMPLETED','CHAPTER_COMPLETED','QUESTION_ANSWERED','QUIZ_COMPLETED','FLASHCARD_REVIEWED') NOT NULL,
	`lessonId` int,
	`concept` varchar(160),
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`moduleId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`position` int NOT NULL,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moderation_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportedByUserId` int NOT NULL,
	`organizationId` int,
	`subjectType` enum('course','lesson','video','comment') NOT NULL,
	`subjectId` int NOT NULL,
	`reason` varchar(120) NOT NULL,
	`details` text,
	`status` enum('open','under_review','resolved','dismissed') NOT NULL DEFAULT 'open',
	`resolvedByUserId` int,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moderation_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organization_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('student','educator','creator','institution_admin') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organization_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `organization_members_org_user_unique` UNIQUE(`organizationId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `video_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`playbackUrl` varchar(2048),
	`captionsUrl` varchar(2048),
	`durationSeconds` int,
	`processingStatus` enum('uploaded','processing','ready','failed','rejected') NOT NULL DEFAULT 'uploaded',
	`rightsStatus` enum('pending','verified','restricted','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `video_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `audit_logs_org_created_idx` ON `audit_logs` (`organizationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `audit_logs_actor_created_idx` ON `audit_logs` (`actorUserId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `courses_org_status_idx` ON `courses` (`organizationId`,`status`);--> statement-breakpoint
CREATE INDEX `courses_creator_idx` ON `courses` (`createdByUserId`);--> statement-breakpoint
CREATE INDEX `learning_events_user_occurred_idx` ON `learning_events` (`userId`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `learning_events_lesson_idx` ON `learning_events` (`lessonId`);--> statement-breakpoint
CREATE INDEX `lessons_course_position_idx` ON `lessons` (`courseId`,`position`);--> statement-breakpoint
CREATE INDEX `lessons_module_idx` ON `lessons` (`moduleId`);--> statement-breakpoint
CREATE INDEX `moderation_reports_status_idx` ON `moderation_reports` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `moderation_reports_org_idx` ON `moderation_reports` (`organizationId`);--> statement-breakpoint
CREATE INDEX `organization_members_user_idx` ON `organization_members` (`userId`);--> statement-breakpoint
CREATE INDEX `organizations_creator_idx` ON `organizations` (`createdByUserId`);--> statement-breakpoint
CREATE INDEX `video_assets_lesson_idx` ON `video_assets` (`lessonId`);--> statement-breakpoint
CREATE INDEX `video_assets_processing_idx` ON `video_assets` (`processingStatus`);