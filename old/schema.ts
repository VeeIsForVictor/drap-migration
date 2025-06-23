import { pgSchema, foreignKey, unique, check, bigint, timestamp, smallint, text, boolean, uuid, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { tstzrange } from "./custom/tstzrange";

export const drap = pgSchema("drap");
export const draftnotificationtype = drap.enum("draftnotificationtype", ['DraftRoundStarted', 'DraftRoundSubmitted', 'LotteryIntervention', 'DraftConcluded'])


export const facultyChoices = drap.table("faculty_choices", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	choiceId: bigint("choice_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "drap.faculty_choices_choice_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	draftId: bigint("draft_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	round: smallint(),
	labId: text("lab_id").notNull(),
	facultyEmail: text("faculty_email"),
}, (table) => [
	foreignKey({
			columns: [table.draftId],
			foreignColumns: [draftsInDrap.draftId],
			name: "faculty_choices_draft_id_fkey"
		}),
	foreignKey({
			columns: [table.labId],
			foreignColumns: [labs.labId],
			name: "faculty_choices_lab_id_fkey"
		}),
	foreignKey({
			columns: [table.facultyEmail],
			foreignColumns: [users.email],
			name: "faculty_choices_faculty_email_fkey"
		}),
	unique("faculty_choices_draft_id_round_lab_id_key").on(table.draftId, table.round, table.labId),
	check("post_registration_round_only", sql`round > 0`),
]);

export const labs = drap.table("labs", {
	labId: text("lab_id").primaryKey().notNull(),
	labName: text("lab_name").notNull(),
	quota: smallint().default(0).notNull(),
}, (table) => [
	unique("labs_lab_name_key").on(table.labName),
	check("labs_quota_check", sql`quota >= 0`),
]);

export const users = drap.table("users", {
	isAdmin: boolean("is_admin").default(false).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	studentNumber: bigint("student_number", { mode: "bigint" }),
	userId: text('google_user_id').unique(),
	labId: text("lab_id"),
	email: text().primaryKey().notNull(),
	givenName: text("given_name").default('').notNull(),
	familyName: text("family_name").default('').notNull(),
	avatar: text().default('').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.labId],
			foreignColumns: [labs.labId],
			name: "users_lab_id_fkey"
		}),
	unique("users_student_number_key").on(table.studentNumber),
	unique("users_user_id_key").on(table.userId),
	check("student_number_within_bounds", sql`(student_number >= 100000000) AND (student_number <= 1000000000)`),
]);

export const sessionsInDrap = drap.table("sessions", {
	sessionId: uuid("session_id").primaryKey().notNull(),
	expiration: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	email: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.email],
			foreignColumns: [users.email],
			name: "sessions_email_fkey"
		}),
]);

export const draftsInDrap = drap.table("drafts", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	draftId: bigint("draft_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "drap.drafts_draft_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	currRound: smallint("curr_round").default(0),
	maxRounds: smallint("max_rounds").notNull(),
	activePeriod: tstzrange("active_period").notNull(),
}, (table) => [
	check("max_rounds_above_floor", sql`max_rounds > 0`),
	check("curr_round_within_bounds", sql`(curr_round >= 0) AND (curr_round <= max_rounds)`),
]);

export const facultyChoicesEmailsInDrap = drap.table("faculty_choices_emails", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	choiceEmailId: bigint("choice_email_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "drap.faculty_choices_emails_choice_email_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	draftId: bigint("draft_id", { mode: "number" }).notNull(),
	round: smallint(),
	labId: text("lab_id").notNull(),
	studentEmail: text("student_email").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.draftId],
			foreignColumns: [draftsInDrap.draftId],
			name: "faculty_choices_emails_draft_id_fkey"
		}),
	foreignKey({
			columns: [table.labId],
			foreignColumns: [labs.labId],
			name: "faculty_choices_emails_lab_id_fkey"
		}),
	foreignKey({
			columns: [table.studentEmail],
			foreignColumns: [users.email],
			name: "faculty_choices_emails_student_email_fkey"
		}),
	foreignKey({
			columns: [table.draftId, table.round, table.labId],
			foreignColumns: [facultyChoices.draftId, facultyChoices.labId, facultyChoices.round],
			name: "faculty_choices_emails_draft_id_round_lab_id_fkey"
		}),
	unique("faculty_choices_emails_draft_id_student_email_key").on(table.draftId, table.studentEmail),
]);

export const candidateSendersInDrap = drap.table("candidate_senders", {
	email: text().primaryKey().notNull(),
	accessToken: text("access_token").notNull(),
	refreshToken: text("refresh_token").notNull(),
	expiration: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.email],
			foreignColumns: [users.email],
			name: "candidate_senders_email_fkey"
		}),
	check("access_token_length", sql`length(access_token) <= 2048`),
	check("refresh_token_length", sql`length(refresh_token) <= 512`),
]);

export const draftNotificationsInDrap = drap.table("draft_notifications", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	notifId: bigint("notif_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "drap.draft_notifications_notif_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	draftId: bigint("draft_id", { mode: "number" }).notNull(),
	ty: draftnotificationtype().notNull(),
	round: smallint(),
	labId: text("lab_id"),
	email: text(),
}, (table) => [
	foreignKey({
			columns: [table.draftId],
			foreignColumns: [draftsInDrap.draftId],
			name: "draft_notifications_draft_id_fkey"
		}),
	foreignKey({
			columns: [table.labId],
			foreignColumns: [labs.labId],
			name: "draft_notifications_lab_id_fkey"
		}),
	foreignKey({
			columns: [table.email],
			foreignColumns: [users.email],
			name: "draft_notifications_email_fkey"
		}),
]);

export const designatedSenderInDrap = drap.table("designated_sender", {
	email: text().primaryKey().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.email],
			foreignColumns: [candidateSendersInDrap.email],
			name: "designated_sender_email_fkey"
		}).onDelete("cascade"),
]);

export const userNotificationsInDrap = drap.table("user_notifications", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	notifId: bigint("notif_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "drap.user_notifications_notif_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	labId: text("lab_id").notNull(),
	email: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.labId],
			foreignColumns: [labs.labId],
			name: "user_notifications_lab_id_fkey"
		}),
	foreignKey({
			columns: [table.email],
			foreignColumns: [users.email],
			name: "user_notifications_email_fkey"
		}),
]);

export const studentRanksInDrap = drap.table("student_ranks", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	draftId: bigint("draft_id", { mode: "bigint" }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	email: text().notNull(),
	labs: text().array().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.draftId],
			foreignColumns: [draftsInDrap.draftId],
			name: "student_ranks_draft_id_fkey"
		}),
	foreignKey({
			columns: [table.email],
			foreignColumns: [users.email],
			name: "student_ranks_email_fkey"
		}),
	primaryKey({ columns: [table.draftId, table.email], name: "student_ranks_pkey"}),
]);
