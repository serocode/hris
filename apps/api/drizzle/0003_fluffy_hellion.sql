ALTER TABLE "user" RENAME COLUMN "employee_number" TO "name";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_employee_number_unique";--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "date_of_birth" date NOT NULL;