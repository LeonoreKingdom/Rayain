CREATE TABLE `invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`event_type` text NOT NULL,
	`event_date` text NOT NULL,
	`event_time` text NOT NULL,
	`location` text NOT NULL,
	`message` text NOT NULL,
	`template` text DEFAULT 'soft-promise' NOT NULL,
	`color` text DEFAULT 'blush' NOT NULL,
	`font` text DEFAULT 'serif' NOT NULL,
	`photo` text DEFAULT 'none' NOT NULL,
	`layout` text DEFAULT 'classic' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`guest_count` integer DEFAULT 0 NOT NULL,
	`owner_id` text,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_slug_unique` ON `invitations` (`slug`);--> statement-breakpoint
CREATE INDEX `invitations_status_idx` ON `invitations` (`status`);--> statement-breakpoint
CREATE INDEX `invitations_event_date_idx` ON `invitations` (`event_date`);