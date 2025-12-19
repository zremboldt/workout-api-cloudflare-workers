CREATE TABLE `sets` (
	`id` integer PRIMARY KEY NOT NULL,
	`exerciseId` integer NOT NULL,
	`weight` integer,
	`reps` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`exerciseId`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
