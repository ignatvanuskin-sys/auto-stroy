ALTER TABLE `estimates` ADD `companyId` int;
--> statement-breakpoint
ALTER TABLE `leadActivities` ADD `companyId` int;
--> statement-breakpoint
ALTER TABLE `proposals` ADD `companyId` int;
--> statement-breakpoint
UPDATE `estimates` AS e INNER JOIN `leads` AS l ON e.`leadId` = l.`id` SET e.`companyId` = l.`companyId`;
--> statement-breakpoint
UPDATE `leadActivities` AS a INNER JOIN `leads` AS l ON a.`leadId` = l.`id` SET a.`companyId` = l.`companyId`;
--> statement-breakpoint
UPDATE `proposals` AS p INNER JOIN `leads` AS l ON p.`leadId` = l.`id` SET p.`companyId` = l.`companyId`;
--> statement-breakpoint
ALTER TABLE `estimates` MODIFY `companyId` int NOT NULL;
--> statement-breakpoint
ALTER TABLE `leadActivities` MODIFY `companyId` int NOT NULL;
--> statement-breakpoint
ALTER TABLE `proposals` MODIFY `companyId` int NOT NULL;
--> statement-breakpoint
ALTER TABLE `estimates` ADD CONSTRAINT `estimates_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `leadActivities` ADD CONSTRAINT `leadActivities_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `proposals` ADD CONSTRAINT `proposals_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;
