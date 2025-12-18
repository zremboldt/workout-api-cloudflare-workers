CREATE TABLE `exercises` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
