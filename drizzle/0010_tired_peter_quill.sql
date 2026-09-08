CREATE TABLE `reset_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reset_tokens_token_hash_unique` ON `reset_tokens` (`token_hash`);--> statement-breakpoint
CREATE INDEX `reset_tokens_user_id_idx` ON `reset_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `reset_tokens_expires_at_idx` ON `reset_tokens` (`expires_at`);