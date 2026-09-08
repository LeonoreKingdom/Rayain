CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`event_type` text NOT NULL,
	`thumbnail_url` text,
	`default_design` text DEFAULT '{}' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `templates_event_type_idx` ON `templates` (`event_type`);--> statement-breakpoint
CREATE INDEX `templates_active_idx` ON `templates` (`is_active`);--> statement-breakpoint
INSERT OR IGNORE INTO `templates` (`id`, `name`, `event_type`, `thumbnail_url`, `default_design`, `is_active`) VALUES
  ('garden', 'The Garden', 'wedding', NULL, '{"color":"floral","font":"playfair","layout":"centered","photo":"none"}', 1),
  ('sunday', 'Sunday Club', 'birthday', NULL, '{"color":"terracotta","font":"sans","layout":"editorial","photo":"none"}', 1),
  ('ever-after', 'Ever After', 'anniversary', NULL, '{"color":"sage","font":"playfair","layout":"centered","photo":"garden"}', 1),
  ('soft-promise', 'Soft Promise', 'engagement', NULL, '{"color":"lilac","font":"playfair","layout":"centered","photo":"none"}', 1);
