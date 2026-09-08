CREATE TABLE `guests` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation_id` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`group_name` text DEFAULT 'Lainnya' NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `guests_invitation_id_idx` ON `guests` (`invitation_id`);--> statement-breakpoint
CREATE INDEX `guests_phone_idx` ON `guests` (`phone`);