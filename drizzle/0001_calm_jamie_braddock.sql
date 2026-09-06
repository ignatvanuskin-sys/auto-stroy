CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(96) NOT NULL,
	`brandingConfig` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `estimates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`rateTableVersion` int NOT NULL,
	`inputSnapshot` json,
	`lowAmount` int NOT NULL,
	`highAmount` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'KZT',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `estimates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `followups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`leadId` int NOT NULL,
	`type` varchar(40) NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`status` enum('pending','approved','sent','skipped','cancelled') NOT NULL DEFAULT 'pending',
	`channel` varchar(32) NOT NULL DEFAULT 'Telegram',
	`messageText` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `followups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leadActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`actorType` enum('system','ai','manager') NOT NULL,
	`type` varchar(64) NOT NULL,
	`payload` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leadActivities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`source` varchar(40) NOT NULL DEFAULT 'Website',
	`name` varchar(120) NOT NULL,
	`phone` varchar(48) NOT NULL,
	`preferredChannel` varchar(30) NOT NULL DEFAULT 'Звонок',
	`region` varchar(80) NOT NULL,
	`projectType` varchar(64) NOT NULL,
	`areaM2` int NOT NULL,
	`floors` int NOT NULL DEFAULT 1,
	`material` varchar(80) NOT NULL,
	`finishTier` enum('economy','standard','premium') NOT NULL,
	`foundation` varchar(80),
	`engineering` json,
	`budgetRange` varchar(80),
	`hasLand` boolean NOT NULL DEFAULT false,
	`desiredStart` varchar(80),
	`rawNotes` text,
	`aiSummary` text,
	`aiIntent` enum('genuine_buyer','researcher','competitor_or_spam','unclear'),
	`aiConfidence` int,
	`missingFields` json,
	`needsManualReview` boolean NOT NULL DEFAULT false,
	`score` int NOT NULL DEFAULT 0,
	`scoreBand` enum('cold','warm','hot','very_hot') NOT NULL DEFAULT 'cold',
	`status` enum('New','Qualified','Contacted','Site Visit','Estimate Sent','Proposal Sent','Negotiation','Won','Lost') NOT NULL DEFAULT 'New',
	`assignedManagerId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`recipientUserId` int,
	`channel` varchar(32) NOT NULL DEFAULT 'Telegram',
	`payload` json,
	`status` enum('queued','sent','failed') NOT NULL DEFAULT 'queued',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`estimateId` int,
	`pdfUrl` text,
	`status` enum('draft','sent','viewed') NOT NULL DEFAULT 'draft',
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rateTables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`version` int NOT NULL,
	`region` varchar(80) NOT NULL,
	`material` varchar(80) NOT NULL,
	`finishTier` enum('economy','standard','premium') NOT NULL,
	`baseRatePerM2` int NOT NULL,
	`effectiveFrom` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rateTables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`leadId` int,
	`assignedTo` int,
	`title` varchar(240) NOT NULL,
	`dueAt` timestamp,
	`status` enum('open','done') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `companyId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `crmRole` enum('owner','manager','analyst') DEFAULT 'manager' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `telegramChatId` varchar(96);--> statement-breakpoint
ALTER TABLE `estimates` ADD CONSTRAINT `estimates_leadId_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `followups` ADD CONSTRAINT `followups_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `followups` ADD CONSTRAINT `followups_leadId_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leadActivities` ADD CONSTRAINT `leadActivities_leadId_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leads` ADD CONSTRAINT `leads_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leads` ADD CONSTRAINT `leads_assignedManagerId_users_id_fk` FOREIGN KEY (`assignedManagerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipientUserId_users_id_fk` FOREIGN KEY (`recipientUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `proposals` ADD CONSTRAINT `proposals_leadId_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `proposals` ADD CONSTRAINT `proposals_estimateId_estimates_id_fk` FOREIGN KEY (`estimateId`) REFERENCES `estimates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rateTables` ADD CONSTRAINT `rateTables_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_leadId_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assignedTo_users_id_fk` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;