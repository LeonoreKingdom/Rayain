CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`invitation_id` text,
	`rsvp_id` text,
	`type` text DEFAULT 'system' NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`read_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notifications_user_id_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_invitation_id_idx` ON `notifications` (`invitation_id`);--> statement-breakpoint
CREATE INDEX `notifications_is_read_idx` ON `notifications` (`is_read`);--> statement-breakpoint
CREATE TABLE `rsvps` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation_id` text NOT NULL,
	`guest_id` text,
	`name` text NOT NULL,
	`phone` text,
	`status` text DEFAULT 'maybe' NOT NULL,
	`party_size` integer DEFAULT 1 NOT NULL,
	`message` text,
	`responded_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rsvps_invitation_id_idx` ON `rsvps` (`invitation_id`);--> statement-breakpoint
CREATE INDEX `rsvps_guest_id_idx` ON `rsvps` (`guest_id`);--> statement-breakpoint
CREATE INDEX `rsvps_status_idx` ON `rsvps` (`status`);