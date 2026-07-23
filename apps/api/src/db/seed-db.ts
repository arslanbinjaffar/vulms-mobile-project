/**
 * Run: DATABASE_URL=... pnpm --filter @vu-lms/api seed-db
 * Applies schema (via drizzle-kit push) then imports current seed data.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getCourseDetails } from "../courseDetailsSeed.js";
import * as seed from "../seed.js";
import * as t from "./schema.js";

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client);

  console.log("Clearing tables...");
  await db.delete(t.sessions);
  await db.delete(t.announcements);
  await db.delete(t.assignments);
  await db.delete(t.quizzes);
  await db.delete(t.gdbs);
  await db.delete(t.courses);
  await db.delete(t.teachers);
  await db.delete(t.students);
  await db.delete(t.admins);
  await db.delete(t.meta);

  console.log("Seeding admin...");
  await db.insert(t.admins).values({
    id: "admin-1",
    username: "admin",
    password: "admin123",
    name: "VU LMS Admin",
  });

  console.log("Seeding student...");
  await db.insert(t.students).values({
    id: seed.student.id,
    studentId: seed.student.studentId,
    password: seed.credentials.password,
    name: seed.student.name,
    program: seed.student.program,
    cgpa: seed.student.cgpa,
    effectiveCgpa: seed.student.effectiveCgpa,
    creditsEarned: seed.student.creditsEarned,
    creditsExempted: seed.student.creditsExempted,
    currentSemesterNo: seed.student.currentSemesterNo,
    avatarUrl: seed.student.avatarUrl,
    validUpto: seed.student.validUpto ?? null,
    email: seed.student.email ?? null,
    formNo: seed.student.formNo ?? null,
    vuRegistrationNo: seed.student.vuRegistrationNo ?? null,
    admissionDate: seed.student.admissionDate ?? null,
    virtualCampusCode: seed.student.virtualCampusCode ?? null,
    fieldOfStudy: seed.student.fieldOfStudy ?? null,
    profileJson: seed.studentProfile,
  });

  console.log("Seeding teachers from course instructors...");
  {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        degree: string;
        department: string;
        photoUrl: string | null;
        email: string | null;
      }
    >();
    for (const c of seed.courses) {
      const key = c.instructorName.trim().toLowerCase();
      if (!key || map.has(key)) continue;
      map.set(key, {
        id: `tch-${Buffer.from(key).toString("base64url").slice(0, 16)}`,
        name: c.instructorName,
        degree: c.instructorDegree ?? "",
        department: c.department ?? "",
        photoUrl: c.instructorPhotoUrl ?? null,
        email: null,
      });
    }
    const teachers = [...map.values()];
    if (teachers.length) await db.insert(t.teachers).values(teachers);
  }

  console.log("Seeding courses...");
  for (const c of seed.courses) {
    let detailsJson: unknown = null;
    try {
      detailsJson = getCourseDetails(c.id);
    } catch {
      detailsJson = null;
    }
    await db.insert(t.courses).values({
      id: c.id,
      code: c.code,
      title: c.title,
      department: c.department,
      creditHours: c.creditHours,
      instructorName: c.instructorName,
      instructorDegree: c.instructorDegree,
      instructorPhotoUrl: c.instructorPhotoUrl,
      lectureCount: c.lectureCount,
      semester: c.semester,
      announcementCount: c.announcementCount ?? 0,
      assignmentCount: c.assignmentCount ?? 0,
      gdbCount: c.gdbCount ?? 0,
      quizCount: c.quizCount ?? 0,
      detailsJson,
    });
  }

  console.log("Seeding announcements...");
  if (seed.announcements.length) {
    await db.insert(t.announcements).values(
      seed.announcements.map((a) => ({
        id: a.id,
        courseId: a.courseId,
        courseCode: a.courseCode,
        title: a.title,
        body: a.body,
        createdAt: a.createdAt,
        unread: a.unread,
      })),
    );
  }

  console.log("Seeding assignments/quizzes/gdbs...");
  if (seed.assignments.length) {
    await db
      .insert(t.assignments)
      .values(seed.assignments.map((a) => ({ id: a.id, data: a })));
  }
  if (seed.quizzes.length) {
    await db.insert(t.quizzes).values(seed.quizzes.map((q) => ({ id: q.id, data: q })));
  }
  if (seed.gdbs.length) {
    await db.insert(t.gdbs).values(seed.gdbs.map((g) => ({ id: g.id, data: g })));
  }

  console.log("Seeding content meta bags...");
  await db.insert(t.meta).values([
    { key: "seededAt", value: new Date().toISOString() },
    { key: "mails", value: seed.mails },
    { key: "challans", value: seed.challans },
    { key: "lectures", value: seed.lectures },
    { key: "todos", value: seed.todos },
    { key: "progress", value: seed.progress },
    { key: "studyScheme", value: seed.studyScheme },
    { key: "studentServices", value: seed.studentServices },
    { key: "courseSelection", value: seed.courseSelection },
    { key: "evaluationQuestions", value: seed.evaluationQuestions },
    { key: "loginHistory", value: seed.loginHistory },
    { key: "lessons", value: seed.lessons },
    { key: "activitySessions", value: seed.activitySessions },
    { key: "notes", value: seed.notes },
    { key: "midtermResults", value: seed.midtermResults },
    { key: "gradeBook", value: seed.gradeBook },
    { key: "gradingScheme", value: seed.gradingScheme },
    { key: "noticeBoardCount", value: seed.noticeBoardCount },
  ]);

  await client.end();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
