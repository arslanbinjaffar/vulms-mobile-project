import { eq } from "drizzle-orm";
import type {
  Announcement,
  Assignment,
  Course,
  Gdb,
  Quiz,
  Student,
  StudentProfile,
} from "@vu-lms/shared";
import { getDb } from "../db/client.js";
import * as t from "../db/schema.js";
import { getCourseDetails as seedCourseDetails } from "../courseDetailsSeed.js";
import * as seed from "../seed.js";
import { contentMethods } from "./contentMethods.js";

function id(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function rowToStudent(r: typeof t.students.$inferSelect): Student {
  return {
    id: r.id,
    studentId: r.studentId,
    name: r.name,
    program: r.program,
    cgpa: r.cgpa,
    effectiveCgpa: r.effectiveCgpa,
    creditsEarned: r.creditsEarned,
    creditsExempted: r.creditsExempted,
    currentSemesterNo: r.currentSemesterNo,
    avatarUrl: r.avatarUrl,
    validUpto: r.validUpto ?? undefined,
    email: r.email ?? undefined,
    formNo: r.formNo ?? undefined,
    vuRegistrationNo: r.vuRegistrationNo ?? undefined,
    admissionDate: r.admissionDate ?? undefined,
    virtualCampusCode: r.virtualCampusCode ?? undefined,
    fieldOfStudy: r.fieldOfStudy ?? undefined,
  };
}

function rowToCourse(r: typeof t.courses.$inferSelect): Course {
  return {
    id: r.id,
    code: r.code,
    title: r.title,
    department: r.department,
    creditHours: r.creditHours,
    instructorName: r.instructorName,
    instructorDegree: r.instructorDegree,
    instructorPhotoUrl: r.instructorPhotoUrl,
    lectureCount: r.lectureCount,
    semester: r.semester,
    announcementCount: r.announcementCount,
    assignmentCount: r.assignmentCount,
    gdbCount: r.gdbCount,
    quizCount: r.quizCount,
  };
}

export const dbStore = {
  mode: "database" as const,

  async getAdminByUsername(username: string) {
    const db = getDb();
    const rows = await db.select().from(t.admins).where(eq(t.admins.username, username.trim()));
    return rows[0] ?? null;
  },

  async findStudentAuth(studentId: string) {
    const db = getDb();
    const rows = await db
      .select()
      .from(t.students)
      .where(eq(t.students.studentId, studentId.trim()));
    const r = rows[0];
    if (!r) return null;
    return { student: rowToStudent(r), password: r.password };
  },

  async allStudents() {
    const db = getDb();
    const rows = await db.select().from(t.students);
    return rows.map(rowToStudent);
  },

  async createStudent(input: {
    studentId: string;
    password: string;
    name: string;
    program: string;
  }) {
    const db = getDb();
    const row = {
      id: id("stu"),
      studentId: input.studentId,
      password: input.password,
      name: input.name,
      program: input.program,
      cgpa: 0,
      effectiveCgpa: 0,
      creditsEarned: 0,
      creditsExempted: 0,
      currentSemesterNo: 1,
      avatarUrl: null as string | null,
      email: `${input.studentId}@vu.edu.pk`,
      formNo: null as string | null,
      vuRegistrationNo: null as string | null,
      admissionDate: null as string | null,
      virtualCampusCode: null as string | null,
      fieldOfStudy: input.program,
      validUpto: null as string | null,
      profileJson: null as unknown,
    };
    await db.insert(t.students).values(row);
    return rowToStudent(row as typeof t.students.$inferSelect);
  },

  async updateStudent(idKey: string, patch: Partial<Student> & { password?: string }) {
    const db = getDb();
    const all = await db.select().from(t.students);
    const existing = all.find((r) => r.id === idKey || r.studentId === idKey);
    if (!existing) return null;
    const next = {
      ...existing,
      ...patch,
      password: patch.password ?? existing.password,
      avatarUrl: patch.avatarUrl === undefined ? existing.avatarUrl : patch.avatarUrl,
    };
    await db.update(t.students).set(next).where(eq(t.students.id, existing.id));
    return rowToStudent(next);
  },

  async deleteStudent(idKey: string) {
    const db = getDb();
    const all = await db.select().from(t.students);
    const existing = all.find((r) => r.id === idKey || r.studentId === idKey);
    if (!existing) return false;
    await db.delete(t.students).where(eq(t.students.id, existing.id));
    return true;
  },

  async getStudentProfile(): Promise<StudentProfile> {
    const db = getDb();
    const rows = await db.select().from(t.students).limit(1);
    const r = rows[0];
    if (r?.profileJson) return r.profileJson as StudentProfile;
    return seed.studentProfile;
  },

  async listCourses() {
    const db = getDb();
    return (await db.select().from(t.courses)).map(rowToCourse);
  },

  async getCourse(courseId: string) {
    const db = getDb();
    const rows = await db.select().from(t.courses).where(eq(t.courses.id, courseId));
    return rows[0] ? rowToCourse(rows[0]) : null;
  },

  async createCourse(input: Omit<Course, "id"> & { id?: string }) {
    const db = getDb();
    const row = {
      id: input.id ?? id("c"),
      code: input.code,
      title: input.title,
      department: input.department,
      creditHours: input.creditHours,
      instructorName: input.instructorName,
      instructorDegree: input.instructorDegree,
      instructorPhotoUrl: input.instructorPhotoUrl,
      lectureCount: input.lectureCount,
      semester: input.semester,
      announcementCount: input.announcementCount ?? 0,
      assignmentCount: input.assignmentCount ?? 0,
      gdbCount: input.gdbCount ?? 0,
      quizCount: input.quizCount ?? 0,
      detailsJson: null as unknown,
    };
    await db.insert(t.courses).values(row);
    return rowToCourse(row as typeof t.courses.$inferSelect);
  },

  async updateCourse(courseId: string, patch: Partial<Course>) {
    const db = getDb();
    const rows = await db.select().from(t.courses).where(eq(t.courses.id, courseId));
    const existing = rows[0];
    if (!existing) return null;
    const next = { ...existing, ...patch };
    await db.update(t.courses).set(next).where(eq(t.courses.id, courseId));
    return rowToCourse(next);
  },

  async deleteCourse(courseId: string) {
    const db = getDb();
    await db.delete(t.announcements).where(eq(t.announcements.courseId, courseId));
    await db.delete(t.courses).where(eq(t.courses.id, courseId));
    return true;
  },

  async getCourseDetails(courseId: string) {
    const db = getDb();
    const rows = await db.select().from(t.courses).where(eq(t.courses.id, courseId));
    if (rows[0]?.detailsJson) return rows[0].detailsJson;
    return seedCourseDetails(courseId);
  },

  async setCourseDetails(courseId: string, details: unknown) {
    const db = getDb();
    await db.update(t.courses).set({ detailsJson: details }).where(eq(t.courses.id, courseId));
    return details;
  },

  async setStudentProfile(profile: StudentProfile) {
    const db = getDb();
    const rows = await db.select().from(t.students).limit(1);
    const r = rows[0];
    if (!r) return profile;
    await db.update(t.students).set({ profileJson: profile }).where(eq(t.students.id, r.id));
    return profile;
  },

  async listAnnouncements(courseId?: string) {
    const db = getDb();
    const rows = await db.select().from(t.announcements);
    const mapped: Announcement[] = rows.map((r) => ({
      id: r.id,
      courseId: r.courseId,
      courseCode: r.courseCode,
      title: r.title,
      body: r.body,
      createdAt: r.createdAt,
      unread: r.unread,
    }));
    return courseId ? mapped.filter((a) => a.courseId === courseId) : mapped;
  },

  async createAnnouncement(input: {
    courseId: string;
    courseCode: string;
    title: string;
    body: string;
  }) {
    const db = getDb();
    const row = {
      id: id("an"),
      courseId: input.courseId,
      courseCode: input.courseCode,
      title: input.title,
      body: input.body,
      createdAt: new Date().toISOString(),
      unread: true,
    };
    await db.insert(t.announcements).values(row);
    const courses = await db.select().from(t.courses).where(eq(t.courses.id, input.courseId));
    if (courses[0]) {
      await db
        .update(t.courses)
        .set({ announcementCount: courses[0].announcementCount + 1 })
        .where(eq(t.courses.id, input.courseId));
    }
    return row;
  },

  async updateAnnouncement(announcementId: string, patch: Partial<Announcement>) {
    const db = getDb();
    const rows = await db
      .select()
      .from(t.announcements)
      .where(eq(t.announcements.id, announcementId));
    const existing = rows[0];
    if (!existing) return null;
    const next = { ...existing, ...patch };
    await db.update(t.announcements).set(next).where(eq(t.announcements.id, announcementId));
    return {
      id: next.id,
      courseId: next.courseId,
      courseCode: next.courseCode,
      title: next.title,
      body: next.body,
      createdAt: next.createdAt,
      unread: next.unread,
    } satisfies Announcement;
  },

  async deleteAnnouncement(announcementId: string) {
    const db = getDb();
    await db.delete(t.announcements).where(eq(t.announcements.id, announcementId));
    return true;
  },

  async listAssignments() {
    const db = getDb();
    return (await db.select().from(t.assignments)).map((r) => r.data as Assignment);
  },
  async listQuizzes() {
    const db = getDb();
    return (await db.select().from(t.quizzes)).map((r) => r.data as Quiz);
  },
  async listGdbs() {
    const db = getDb();
    return (await db.select().from(t.gdbs)).map((r) => r.data as Gdb);
  },

  async upsertAssignment(row: Assignment) {
    const db = getDb();
    await db
      .insert(t.assignments)
      .values({ id: row.id, data: row })
      .onConflictDoUpdate({ target: t.assignments.id, set: { data: row } });
    return row;
  },
  async deleteAssignment(assignmentId: string) {
    const db = getDb();
    await db.delete(t.assignments).where(eq(t.assignments.id, assignmentId));
    return true;
  },
  async upsertQuiz(row: Quiz) {
    const db = getDb();
    await db
      .insert(t.quizzes)
      .values({ id: row.id, data: row })
      .onConflictDoUpdate({ target: t.quizzes.id, set: { data: row } });
    return row;
  },
  async deleteQuiz(quizId: string) {
    const db = getDb();
    await db.delete(t.quizzes).where(eq(t.quizzes.id, quizId));
    return true;
  },
  async upsertGdb(row: Gdb) {
    const db = getDb();
    await db
      .insert(t.gdbs)
      .values({ id: row.id, data: row })
      .onConflictDoUpdate({ target: t.gdbs.id, set: { data: row } });
    return row;
  },
  async deleteGdb(gdbId: string) {
    const db = getDb();
    await db.delete(t.gdbs).where(eq(t.gdbs.id, gdbId));
    return true;
  },

  async listTeachers() {
    const db = getDb();
    const rows = await db.select().from(t.teachers);
    const courses = await dbStore.listCourses();
    if (rows.length === 0) {
      // Derive from course instructor fields until teachers are seeded/created
      const map = new Map<
        string,
        {
          id: string;
          name: string;
          degree: string;
          department: string;
          photoUrl: string | null;
          email: string | null;
          courseCount: number;
        }
      >();
      for (const c of courses) {
        const key = c.instructorName.trim().toLowerCase();
        if (!key) continue;
        const existing = map.get(key);
        if (existing) existing.courseCount += 1;
        else {
          map.set(key, {
            id: `tch-${Buffer.from(key).toString("base64url").slice(0, 16)}`,
            name: c.instructorName,
            degree: c.instructorDegree ?? "",
            department: c.department ?? "",
            photoUrl: c.instructorPhotoUrl ?? null,
            email: null,
            courseCount: 1,
          });
        }
      }
      return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    }
    return rows
      .map((r) => ({
        id: r.id,
        name: r.name,
        degree: r.degree,
        department: r.department,
        photoUrl: r.photoUrl,
        email: r.email,
        courseCount: courses.filter(
          (c) => c.instructorName.trim().toLowerCase() === r.name.trim().toLowerCase(),
        ).length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async createTeacher(input: {
    name: string;
    degree?: string;
    department?: string;
    photoUrl?: string | null;
    email?: string | null;
  }) {
    const db = getDb();
    const row = {
      id: id("tch"),
      name: input.name.trim(),
      degree: input.degree?.trim() ?? "",
      department: input.department?.trim() ?? "",
      photoUrl: input.photoUrl ?? null,
      email: input.email ?? null,
    };
    await db.insert(t.teachers).values(row);
    return { ...row, courseCount: 0 };
  },

  async updateTeacher(
    teacherId: string,
    patch: {
      name?: string;
      degree?: string;
      department?: string;
      photoUrl?: string | null;
      email?: string | null;
    },
  ) {
    const db = getDb();
    const [prev] = await db.select().from(t.teachers).where(eq(t.teachers.id, teacherId)).limit(1);
    if (!prev) return null;
    await db
      .update(t.teachers)
      .set({
        name: patch.name?.trim() ?? prev.name,
        degree: patch.degree ?? prev.degree,
        department: patch.department ?? prev.department,
        photoUrl: patch.photoUrl !== undefined ? patch.photoUrl : prev.photoUrl,
        email: patch.email !== undefined ? patch.email : prev.email,
      })
      .where(eq(t.teachers.id, teacherId));
    const nextName = patch.name?.trim() ?? prev.name;
    if (patch.name && patch.name !== prev.name) {
      await db
        .update(t.courses)
        .set({
          instructorName: nextName,
          ...(patch.degree !== undefined ? { instructorDegree: patch.degree } : {}),
          ...(patch.photoUrl !== undefined ? { instructorPhotoUrl: patch.photoUrl } : {}),
        })
        .where(eq(t.courses.instructorName, prev.name));
    }
    const items = await dbStore.listTeachers();
    return items.find((x) => x.id === teacherId) ?? null;
  },

  async deleteTeacher(teacherId: string) {
    const db = getDb();
    await db.delete(t.teachers).where(eq(t.teachers.id, teacherId));
    return true;
  },

  ...contentMethods,

  async stats() {
    const [students, teachers, courses, announcements, assignments, quizzes, gdbs] =
      await Promise.all([
        dbStore.allStudents(),
        dbStore.listTeachers(),
        dbStore.listCourses(),
        dbStore.listAnnouncements(),
        dbStore.listAssignments(),
        dbStore.listQuizzes(),
        dbStore.listGdbs(),
      ]);
    return {
      students: students.length,
      teachers: teachers.length,
      courses: courses.length,
      announcements: announcements.length,
      assignments: assignments.length,
      quizzes: quizzes.length,
      gdbs: gdbs.length,
      mails: contentMethods.listMails().length,
      challans: contentMethods.listChallans().length,
      lectures: contentMethods.listLectures().length,
      todos: contentMethods.listTodos().length,
      notes: contentMethods.listNotes().length,
      activityEvents: contentMethods.listActivityEvents().length,
      quizAttempts: contentMethods.listQuizAttempts().length,
      mode: "database" as const,
    };
  },

  seed,
};
