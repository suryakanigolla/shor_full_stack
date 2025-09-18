CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"table_name" text,
	"operation" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "actions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "artists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bio" text NOT NULL,
	"experience" integer NOT NULL,
	"specialization" text NOT NULL,
	"portfolio" text,
	"rate_per_hour" integer,
	"rate_per_class" integer,
	"availability" jsonb,
	"social_links" jsonb,
	"achievements" jsonb,
	"teaching_style" text,
	"languages" jsonb,
	"is_verified" boolean DEFAULT false NOT NULL,
	"rating" real DEFAULT 0,
	"total_ratings" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"target_user_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer,
	"old_values" jsonb,
	"new_values" jsonb,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"class_id" integer NOT NULL,
	"booking_date" timestamp DEFAULT now() NOT NULL,
	"price" integer NOT NULL,
	"original_price" integer NOT NULL,
	"discount_amount" integer DEFAULT 0,
	"final_price" integer NOT NULL,
	"gst_amount" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"status" text NOT NULL,
	"booking_code" text NOT NULL,
	"payment_method" text,
	"attended" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "class_bookings_booking_code_unique" UNIQUE("booking_code")
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"style" text NOT NULL,
	"level" text NOT NULL,
	"artist_id" integer NOT NULL,
	"studio_id" integer NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"early_bird_price" integer,
	"regular_price" integer NOT NULL,
	"group_price" integer,
	"max_participants" integer NOT NULL,
	"current_participants" integer DEFAULT 0 NOT NULL,
	"description" text NOT NULL,
	"requirements" jsonb,
	"image" text,
	"song_name" text,
	"choreography_video_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"studio_approval_status" text DEFAULT 'pending',
	"studio_rental_fee" integer DEFAULT 0,
	"studio_approved_at" timestamp,
	"studio_rejected_at" timestamp,
	"studio_rejection_reason" text,
	"class_completed_at" timestamp,
	"rental_payment_status" text DEFAULT 'pending',
	"rental_paid_at" timestamp,
	"latitude" real,
	"longitude" real,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gig_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"gig_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"status" text NOT NULL,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"message" text,
	"portfolio" text,
	"experience" text,
	"availability" jsonb,
	"expected_payment" integer,
	"additional_info" jsonb,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"review_notes" text
);
--> statement-breakpoint
CREATE TABLE "gigs" (
	"id" serial PRIMARY KEY NOT NULL,
	"host_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"requirements" text NOT NULL,
	"location" text NOT NULL,
	"address" text,
	"city" text NOT NULL,
	"area" text,
	"date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"payment" integer,
	"spots" integer NOT NULL,
	"filled_spots" integer DEFAULT 0,
	"status" text NOT NULL,
	"gig_type" text,
	"dance_form" text,
	"skill_level" text,
	"age_group" text,
	"equipment" jsonb,
	"additional_info" jsonb,
	"contact_info" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"action_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"dance_experience" text,
	"preferred_dance_forms" jsonb,
	"skill_level" text,
	"goals" text,
	"medical_conditions" text,
	"emergency_contact" jsonb,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"studio_id" integer NOT NULL,
	"booking_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"price" integer NOT NULL,
	"original_price" integer NOT NULL,
	"discount_amount" integer DEFAULT 0,
	"final_price" integer NOT NULL,
	"gst_amount" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"status" text NOT NULL,
	"booking_code" text NOT NULL,
	"additional_services" jsonb,
	"payment_method" text,
	"notes" text,
	"purpose" text,
	"equipment_needed" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "studio_bookings_booking_code_unique" UNIQUE("booking_code")
);
--> statement-breakpoint
CREATE TABLE "studio_rental_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"studio_booking_id" integer NOT NULL,
	"studio_id" integer NOT NULL,
	"renter_id" text NOT NULL,
	"rental_fee" integer NOT NULL,
	"platform_fee" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"status" text DEFAULT 'pending',
	"payment_date" timestamp,
	"transaction_id" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studios" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"area" text NOT NULL,
	"pincode" text,
	"capacity" integer NOT NULL,
	"amenities" jsonb,
	"images" jsonb,
	"price_per_hour" integer NOT NULL,
	"rental_fee_per_class" integer DEFAULT 20000,
	"rating" real DEFAULT 0,
	"total_ratings" integer DEFAULT 0,
	"description" text,
	"contact_phone" text NOT NULL,
	"contact_email" text NOT NULL,
	"latitude" real,
	"longitude" real,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"operating_hours" jsonb,
	"rules" jsonb,
	"equipment" jsonb
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role_id" integer NOT NULL,
	"assigned_by" text,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"profile_pic" text,
	"gender" text,
	"instagram" text,
	"height" text,
	"bio" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artists" ADD CONSTRAINT "artists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_bookings" ADD CONSTRAINT "class_bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_bookings" ADD CONSTRAINT "class_bookings_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gig_applications" ADD CONSTRAINT "gig_applications_gig_id_gigs_id_fk" FOREIGN KEY ("gig_id") REFERENCES "public"."gigs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gig_applications" ADD CONSTRAINT "gig_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gig_applications" ADD CONSTRAINT "gig_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gigs" ADD CONSTRAINT "gigs_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_bookings" ADD CONSTRAINT "studio_bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_bookings" ADD CONSTRAINT "studio_bookings_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_rental_transactions" ADD CONSTRAINT "studio_rental_transactions_studio_booking_id_studio_bookings_id_fk" FOREIGN KEY ("studio_booking_id") REFERENCES "public"."studio_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_rental_transactions" ADD CONSTRAINT "studio_rental_transactions_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_rental_transactions" ADD CONSTRAINT "studio_rental_transactions_renter_id_users_id_fk" FOREIGN KEY ("renter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studios" ADD CONSTRAINT "studios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;