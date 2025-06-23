import { relations } from "drizzle-orm/relations";
import { draftsInDrap, facultyChoicesInDrap, labsInDrap, usersInDrap, sessionsInDrap, facultyChoicesEmailsInDrap, candidateSendersInDrap, draftNotificationsInDrap, designatedSenderInDrap, userNotificationsInDrap, studentRanksInDrap } from "./schema";

export const facultyChoicesInDrapRelations = relations(facultyChoicesInDrap, ({one, many}) => ({
	draftsInDrap: one(draftsInDrap, {
		fields: [facultyChoicesInDrap.draftId],
		references: [draftsInDrap.draftId]
	}),
	labsInDrap: one(labsInDrap, {
		fields: [facultyChoicesInDrap.labId],
		references: [labsInDrap.labId]
	}),
	usersInDrap: one(usersInDrap, {
		fields: [facultyChoicesInDrap.facultyEmail],
		references: [usersInDrap.email]
	}),
	facultyChoicesEmailsInDraps: many(facultyChoicesEmailsInDrap),
}));

export const draftsInDrapRelations = relations(draftsInDrap, ({many}) => ({
	facultyChoicesInDraps: many(facultyChoicesInDrap),
	facultyChoicesEmailsInDraps: many(facultyChoicesEmailsInDrap),
	draftNotificationsInDraps: many(draftNotificationsInDrap),
	studentRanksInDraps: many(studentRanksInDrap),
}));

export const labsInDrapRelations = relations(labsInDrap, ({many}) => ({
	facultyChoicesInDraps: many(facultyChoicesInDrap),
	usersInDraps: many(usersInDrap),
	facultyChoicesEmailsInDraps: many(facultyChoicesEmailsInDrap),
	draftNotificationsInDraps: many(draftNotificationsInDrap),
	userNotificationsInDraps: many(userNotificationsInDrap),
}));

export const usersInDrapRelations = relations(usersInDrap, ({one, many}) => ({
	facultyChoicesInDraps: many(facultyChoicesInDrap),
	labsInDrap: one(labsInDrap, {
		fields: [usersInDrap.labId],
		references: [labsInDrap.labId]
	}),
	sessionsInDraps: many(sessionsInDrap),
	facultyChoicesEmailsInDraps: many(facultyChoicesEmailsInDrap),
	candidateSendersInDraps: many(candidateSendersInDrap),
	draftNotificationsInDraps: many(draftNotificationsInDrap),
	userNotificationsInDraps: many(userNotificationsInDrap),
	studentRanksInDraps: many(studentRanksInDrap),
}));

export const sessionsInDrapRelations = relations(sessionsInDrap, ({one}) => ({
	usersInDrap: one(usersInDrap, {
		fields: [sessionsInDrap.email],
		references: [usersInDrap.email]
	}),
}));

export const facultyChoicesEmailsInDrapRelations = relations(facultyChoicesEmailsInDrap, ({one}) => ({
	draftsInDrap: one(draftsInDrap, {
		fields: [facultyChoicesEmailsInDrap.draftId],
		references: [draftsInDrap.draftId]
	}),
	labsInDrap: one(labsInDrap, {
		fields: [facultyChoicesEmailsInDrap.labId],
		references: [labsInDrap.labId]
	}),
	usersInDrap: one(usersInDrap, {
		fields: [facultyChoicesEmailsInDrap.studentEmail],
		references: [usersInDrap.email]
	}),
	facultyChoicesInDrap: one(facultyChoicesInDrap, {
		fields: [facultyChoicesEmailsInDrap.draftId],
		references: [facultyChoicesInDrap.draftId]
	}),
}));

export const candidateSendersInDrapRelations = relations(candidateSendersInDrap, ({one, many}) => ({
	usersInDrap: one(usersInDrap, {
		fields: [candidateSendersInDrap.email],
		references: [usersInDrap.email]
	}),
	designatedSenderInDraps: many(designatedSenderInDrap),
}));

export const draftNotificationsInDrapRelations = relations(draftNotificationsInDrap, ({one}) => ({
	draftsInDrap: one(draftsInDrap, {
		fields: [draftNotificationsInDrap.draftId],
		references: [draftsInDrap.draftId]
	}),
	labsInDrap: one(labsInDrap, {
		fields: [draftNotificationsInDrap.labId],
		references: [labsInDrap.labId]
	}),
	usersInDrap: one(usersInDrap, {
		fields: [draftNotificationsInDrap.email],
		references: [usersInDrap.email]
	}),
}));

export const designatedSenderInDrapRelations = relations(designatedSenderInDrap, ({one}) => ({
	candidateSendersInDrap: one(candidateSendersInDrap, {
		fields: [designatedSenderInDrap.email],
		references: [candidateSendersInDrap.email]
	}),
}));

export const userNotificationsInDrapRelations = relations(userNotificationsInDrap, ({one}) => ({
	labsInDrap: one(labsInDrap, {
		fields: [userNotificationsInDrap.labId],
		references: [labsInDrap.labId]
	}),
	usersInDrap: one(usersInDrap, {
		fields: [userNotificationsInDrap.email],
		references: [usersInDrap.email]
	}),
}));

export const studentRanksInDrapRelations = relations(studentRanksInDrap, ({one}) => ({
	draftsInDrap: one(draftsInDrap, {
		fields: [studentRanksInDrap.draftId],
		references: [draftsInDrap.draftId]
	}),
	usersInDrap: one(usersInDrap, {
		fields: [studentRanksInDrap.email],
		references: [usersInDrap.email]
	}),
}));