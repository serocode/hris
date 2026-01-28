CREATE TABLE "employees" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"employee_number" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"position" text NOT NULL,
	"hire_date" date NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "employees_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "employees_employee_number_unique" UNIQUE("employee_number")
);
--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "employees_userId_idx" ON "employees" USING btree ("user_id");