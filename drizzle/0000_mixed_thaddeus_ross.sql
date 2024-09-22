CREATE TABLE `scraping_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text NOT NULL,
	`type` text NOT NULL,
	`data` text NOT NULL,
	`timestamp_created_at` integer NOT NULL,
	`timestamp_updated_at` integer NOT NULL
);
