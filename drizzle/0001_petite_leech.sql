ALTER TABLE `invitations` RENAME COLUMN "owner_id" TO "user_id";--> statement-breakpoint
ALTER TABLE `invitations` ADD `template_id` text;--> statement-breakpoint
ALTER TABLE `invitations` ADD `music_id` text;--> statement-breakpoint
ALTER TABLE `invitations` ADD `content` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `invitations` ADD `design_data` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `invitations` ADD `rsvp_options` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
CREATE INDEX `invitations_user_id_idx` ON `invitations` (`user_id`);