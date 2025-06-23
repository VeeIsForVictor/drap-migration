import { drizzle } from "drizzle-orm/node-postgres";
import * as oldSchema from './old/schema'
import * as newSchema from './new'
import { and, eq } from 'drizzle-orm';
import { lab, facultyChoiceUser } from './old/app';

const OLD_DB_URI = "";
const NEW_DB_URI = "";

const oldDB = drizzle(OLD_DB_URI, { schema: oldSchema });
const newDB = drizzle(NEW_DB_URI, { schema: newSchema });

// handle labs
const oldLabs = await oldDB.select().from(oldSchema.labs);
for (const { labId, labName, quota } of oldLabs) {
    await newDB
        .insert(newSchema.lab)
        .values({
            id: labId,
            name: labName,
            quota: quota
        })
        .onConflictDoNothing();
}

// handle drafts
const oldDrafts = await oldDB.select().from(oldSchema.draftsInDrap);
for (const draft of oldDrafts) {
    await newDB
        .insert(newSchema.draft)
        .values({
            maxRounds: draft.maxRounds,
            currRound: draft.currRound,
            activePeriod: draft.activePeriod
        })
        .onConflictDoNothing();
}

// handle users
const oldUsers = await oldDB.select().from(oldSchema.users);
for (const { isAdmin, studentNumber, email, labId, givenName, familyName, avatar, userId } of oldUsers) {
    await newDB
        .insert(newSchema.user)
        .values({
            studentNumber,
            email,
            isAdmin,
            givenName,
            familyName,
            labId,
            avatarUrl: avatar,
            googleUserId: userId
        })
        .onConflictDoNothing();
}

// handle student rank
const oldStudentRanks = await oldDB.select().from(oldSchema.studentRanksInDrap);
for (const { draftId, createdAt, email, labs } of oldStudentRanks) {
    await newDB.transaction(async (txn) => {
        const [{ userId }] = await txn
            .select({ userId: newSchema.user.id })
            .from(newSchema.user)
            .where(eq(newSchema.user.email, email));
        await txn
            .insert(newSchema.studentRank)
            .values({
                createdAt,
                draftId,
                userId
            })
            .onConflictDoNothing();
        for (const [lab, index] of labs.entries()) {
            await txn
                .insert(newSchema.studentRankLab)
                .values({
                    draftId,
                    userId,
                    index: BigInt(index),
                    labId: `${lab}`,
                    remark: `Created at ${createdAt}`
                })
                .onConflictDoNothing();
        }
    })
}

// handle faculty choice
const oldFacultyChoice = await oldDB
    .select()
    .from(oldSchema.facultyChoices);
for (const { createdAt, round, labId, draftId, facultyEmail } of oldFacultyChoice) {
    if (facultyEmail == null) continue;
    await newDB.transaction(async (txn) => {
        const [{ userId: facultyUserId }] = await txn
            .select({ userId: newSchema.user.id })
            .from(newSchema.user)
            .where(eq(newSchema.user.email, facultyEmail))
        await txn
            .insert(newSchema.facultyChoice)
            .values({
                createdAt,
                round,
                labId,
                draftId: BigInt(draftId),
                userId: facultyUserId
            })
            .onConflictDoNothing();
        const studentEmailsList = await txn
            .select({ studentEmails: oldSchema.facultyChoicesEmailsInDrap.studentEmail })
            .from(oldSchema.facultyChoicesEmailsInDrap)
            .where(
                and(
                    eq(
                        oldSchema.facultyChoices.draftId,
                        oldSchema.facultyChoicesEmailsInDrap.draftId,
                    ),
                    eq(
                        oldSchema.facultyChoices.round,
                        oldSchema.facultyChoicesEmailsInDrap.round,
                    ),
                    eq(
                        oldSchema.facultyChoices.labId,
                        oldSchema.facultyChoicesEmailsInDrap.labId,
                    )
                )
            )
        for (const { studentEmails } of studentEmailsList) {
            const [{ studentId }] = await txn
                .select({ studentId: newSchema.user.id })
                .from(newSchema.user)
                .where(
                    eq(newSchema.user.email, studentEmails)
                )
            // You may need to fetch facultyUserId and studentId as required by your schema
            await txn
                .insert(newSchema.facultyChoiceUser)
                .values({
                    labId,
                    facultyUserId,
                    draftId: BigInt(draftId),
                    studentUserId: studentId
                })
                .onConflictDoNothing();
        }
    })
}

