CREATE TABLE `music` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`mood` text DEFAULT 'Romantic & warm' NOT NULL,
	`duration` text DEFAULT '00:00' NOT NULL,
	`audio_url` text,
	`preview_url` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `music_active_idx` ON `music` (`is_active`);--> statement-breakpoint
CREATE INDEX `music_title_idx` ON `music` (`title`);