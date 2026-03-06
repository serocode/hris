CREATE TABLE "user_provisioning" (
	"user_id" text PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'PENDING_INVITE' NOT NULL,
	"invited_by" text,
	"invite_sent_at" timestamp DEFAULT now() NOT NULL,
	"invite_expires_at" timestamp NOT NULL,
	"activated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_provisioning" ADD CONSTRAINT "user_provisioning_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_provisioning" ADD CONSTRAINT "user_provisioning_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_provisioning_status_idx" ON "user_provisioning" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_provisioning_invited_by_idx" ON "user_provisioning" USING btree ("invited_by");