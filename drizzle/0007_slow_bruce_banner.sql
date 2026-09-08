CREATE TABLE `blast_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`blast_id` text NOT NULL,
	`guest_id` text,
	`recipient_name` text NOT NULL,
	`recipient_phone` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`error_message` text,
	`sent_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `blast_logs_blast_id_idx` ON `blast_logs` (`blast_id`);--> statement-breakpoint
CREATE INDEX `blast_logs_guest_id_idx` ON `blast_logs` (`guest_id`);--> statement-breakpoint
CREATE INDEX `blast_logs_status_idx` ON `blast_logs` (`status`);--> statement-breakpoint
CREATE TABLE `blasts` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation_id` text NOT NULL,
	`channel` text DEFAULT 'whatsapp' NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`scheduled_at` integer,
	`started_at` integer,
	`completed_at` integer,
	`total_recipients` integer DEFAULT 0 NOT NULL,
	`sent_count` integer DEFAULT 0 NOT NULL,
	`failed_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `blasts_invitation_id_idx` ON `blasts` (`invitation_id`);--> statement-breakpoint
CREATE INDEX `blasts_status_idx` ON `blasts` (`status`);--> statement-breakpoint
CREATE INDEX `blasts_scheduled_at_idx` ON `blasts` (`scheduled_at`);