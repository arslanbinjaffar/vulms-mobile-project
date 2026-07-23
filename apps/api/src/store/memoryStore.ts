import type {
  Announcement,
  Assignment,
  Course,
  Gdb,
  Quiz,
  Student,
  StudentProfile,
} from "@vu-lms/shared";
import { getCourseDetails } from "../courseDetailsSeed.js";
import * as seed from "../seed.js";
import { contentMethods } from "./contentMethods.js";

function clone<T>(value: T): T {
  return structuredClone(value);
}

type Admin = { id: string; username: string; password: string; name: string };

export type Teacher = {
  id: string;
  name: string;
  degree: string;
  department: string;
  photoUrl: string | null;
  email: string | null;
  courseCount: number;
};

function teachersFromCourses(courses: Course[]): Teacher[] {
  const map = new Map<string, Teacher>();
  for (const c of courses) {
    const key = c.instructorName.trim().toLowerCase();
    if (!key) continue;
    const existing = map.get(key);
    if (existing) {
      existing.courseCount += 1;
      if (!existing.degree && c.instructorDegree) existing.degree = c.instructorDegree;
      if (!existing.photoUrl && c.instructorPhotoUrl) existing.photoUrl = c.instructorPhotoUrl;
      if (!existing.department && c.department) existing.department = c.department;
    } else {
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

const state = {
  admin: {
    id: "admin-1",
    username: "admin",
    password: "admin123",
    name: "VU LMS Admin",
  } as Admin,
  student: clone(seed.student),
  studentPassword: seed.credentials.password,
  studentProfile: clone(seed.studentProfile),
  courses: clone(seed.courses),
  teachers: [] as Teacher[],
  announcements: clone(seed.announcements),
  assignments: clone(seed.assignments),
  quizzes: clone(seed.quizzes),
  gdbs: clone(seed.gdbs),
  courseDetails: new Map<string, unknown>(),
  noticeBoardCount: seed.noticeBoardCount,
};

state.teachers = teachersFromCourses(state.courses);

for (const c of state.courses) {
  try {
    state.courseDetails.set(c.id, clone(getCourseDetails(c.id)));
  } catch {
    /* some courses have no rich details */
  }
}

function id(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export const memoryStore = {
  mode: "memory" as const,

  getAdminByUsername(username: string) {
    return state.admin.username.toLowerCase() === username.trim().toLowerCase()
      ? state.admin
      : null;
  },

  getStudentByStudentId(studentId: string) {
    return state.student.studentId.toLowerCase() === studentId.trim().toLowerCase()
      ? {
          student: state.student,
          password: state.studentPassword,
          profile: state.studentProfile,
        }
      : null;
  },

  listStudents() {
    return [state.student];
  },

  createStudent(input: {
    studentId: string;
    password: string;
    name: string;
    program: string;
  }) {
    // MVP: single demo student; replace fields for updates, or create secondary in-memory list
    const existing = memoryStore.listStudentsExtra();
    const row: Student = {
      id: id("stu"),
      studentId: input.studentId,
      name: input.name,
      program: input.program,
      cgpa: 0,
      effectiveCgpa: 0,
      creditsEarned: 0,
      creditsExempted: 0,
      currentSemesterNo: 1,
      avatarUrl: null,
      email: `${input.studentId}@vu.edu.pk`,
    };
    existing.push({ student: row, password: input.password });
    return row;
  },

  listStudentsExtra(): { student: Student; password: string }[] {
    const g = globalThis as unknown as {
      __vuExtraStudents?: { student: Student; password: string }[];
    };
    if (!g.__vuExtraStudents) g.__vuExtraStudents = [];
    return g.__vuExtraStudents;
  },

  allStudents() {
    const extras = memoryStore.listStudentsExtra().map((x) => x.student);
    return [state.student, ...extras];
  },

  findStudentAuth(studentId: string) {
    const idNorm = studentId.trim().toLowerCase();
    if (state.student.studentId.toLowerCase() === idNorm) {
      return { student: state.student, password: state.studentPassword };
    }
    return (
      memoryStore.listStudentsExtra().find((x) => x.student.studentId.toLowerCase() === idNorm) ??
      null
    );
  },

  updateStudent(
    idKey: string,
    patch: Partial<Student> & { password?: string },
  ): Student | null {
    if (state.student.id === idKey || state.student.studentId === idKey) {
      Object.assign(state.student, patch);
      if (patch.password) state.studentPassword = patch.password;
      return state.student;
    }
    const extra = memoryStore
      .listStudentsExtra()
      .find((x) => x.student.id === idKey || x.student.studentId === idKey);
    if (!extra) return null;
    Object.assign(extra.student, patch);
    if (patch.password) extra.password = patch.password;
    return extra.student;
  },

  deleteStudent(idKey: string) {
    if (state.student.id === idKey || state.student.studentId === idKey) return false;
    const list = memoryStore.listStudentsExtra();
    const idx = list.findIndex((x) => x.student.id === idKey || x.student.studentId === idKey);
    if (idx < 0) return false;
    list.splice(idx, 1);
    return true;
  },

  getStudentProfile() {
    return state.studentProfile;
  },

  listCourses() {
    return state.courses;
  },

  getCourse(courseId: string) {
    return state.courses.find((c) => c.id === courseId) ?? null;
  },

  createCourse(input: Omit<Course, "id"> & { id?: string }) {
    const row: Course = { ...input, id: input.id ?? id("c") };
    state.courses.push(row);
    return row;
  },

  updateCourse(courseId: string, patch: Partial<Course>) {
    const row = state.courses.find((c) => c.id === courseId);
    if (!row) return null;
    Object.assign(row, patch);
    return row;
  },

  deleteCourse(courseId: string) {
    const idx = state.courses.findIndex((c) => c.id === courseId);
    if (idx < 0) return false;
    state.courses.splice(idx, 1);
    state.announcements = state.announcements.filter((a) => a.courseId !== courseId);
    return true;
  },

  getCourseDetails(courseId: string) {
    return state.courseDetails.get(courseId) ?? getCourseDetails(courseId);
  },

  listAnnouncements(courseId?: string) {
    return courseId
      ? state.announcements.filter((a) => a.courseId === courseId)
      : state.announcements;
  },

  createAnnouncement(input: Omit<Announcement, "id" | "createdAt" | "unread"> & {
    id?: string;
    createdAt?: string;
    unread?: boolean;
  }) {
    const row: Announcement = {
      id: input.id ?? id("an"),
      courseId: input.courseId,
      courseCode: input.courseCode,
      title: input.title,
      body: input.body,
      createdAt: input.createdAt ?? new Date().toISOString(),
      unread: input.unread ?? true,
    };
    state.announcements.unshift(row);
    const course = state.courses.find((c) => c.id === row.courseId);
    if (course) course.announcementCount = (course.announcementCount ?? 0) + 1;
    return row;
  },

  updateAnnouncement(announcementId: string, patch: Partial<Announcement>) {
    const row = state.announcements.find((a) => a.id === announcementId);
    if (!row) return null;
    Object.assign(row, patch);
    return row;
  },

  deleteAnnouncement(announcementId: string) {
    const idx = state.announcements.findIndex((a) => a.id === announcementId);
    if (idx < 0) return false;
    const [removed] = state.announcements.splice(idx, 1);
    const course = state.courses.find((c) => c.id === removed.courseId);
    if (course && course.announcementCount > 0) course.announcementCount -= 1;
    return true;
  },

  listAssignments() {
    return state.assignments as Assignment[];
  },
  listQuizzes() {
    return state.quizzes as Quiz[];
  },
  listGdbs() {
    return state.gdbs as Gdb[];
  },

  upsertAssignment(row: Assignment) {
    const idx = state.assignments.findIndex((a) => a.id === row.id);
    if (idx >= 0) state.assignments[idx] = row;
    else state.assignments.push(row);
    return row;
  },
  deleteAssignment(assignmentId: string) {
    const idx = state.assignments.findIndex((a) => a.id === assignmentId);
    if (idx < 0) return false;
    state.assignments.splice(idx, 1);
    return true;
  },
  upsertQuiz(row: Quiz) {
    const idx = state.quizzes.findIndex((q) => q.id === row.id);
    if (idx >= 0) state.quizzes[idx] = row;
    else state.quizzes.push(row);
    return row;
  },
  deleteQuiz(quizId: string) {
    const idx = state.quizzes.findIndex((q) => q.id === quizId);
    if (idx < 0) return false;
    state.quizzes.splice(idx, 1);
    return true;
  },
  upsertGdb(row: Gdb) {
    const idx = state.gdbs.findIndex((g) => g.id === row.id);
    if (idx >= 0) state.gdbs[idx] = row;
    else state.gdbs.push(row);
    return row;
  },
  deleteGdb(gdbId: string) {
    const idx = state.gdbs.findIndex((g) => g.id === gdbId);
    if (idx < 0) return false;
    state.gdbs.splice(idx, 1);
    return true;
  },

  listTeachers() {
    // Refresh course counts from current courses
    const counts = new Map<string, number>();
    for (const c of state.courses) {
      const key = c.instructorName.trim().toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return state.teachers.map((t) => ({
      ...t,
      courseCount: counts.get(t.name.trim().toLowerCase()) ?? 0,
    }));
  },

  createTeacher(input: {
    name: string;
    degree?: string;
    department?: string;
    photoUrl?: string | null;
    email?: string | null;
  }) {
    const row: Teacher = {
      id: id("tch"),
      name: input.name.trim(),
      degree: input.degree?.trim() ?? "",
      department: input.department?.trim() ?? "",
      photoUrl: input.photoUrl ?? null,
      email: input.email ?? null,
      courseCount: 0,
    };
    state.teachers.push(row);
    return row;
  },

  updateTeacher(
    teacherId: string,
    patch: Partial<Omit<Teacher, "id" | "courseCount">>,
  ): Teacher | null {
    const idx = state.teachers.findIndex((t) => t.id === teacherId);
    if (idx < 0) return null;
    const prev = state.teachers[idx]!;
    const next = {
      ...prev,
      ...patch,
      name: patch.name?.trim() ?? prev.name,
      degree: patch.degree ?? prev.degree,
      department: patch.department ?? prev.department,
    };
    state.teachers[idx] = next;
    // Keep course instructor fields in sync when renaming
    if (patch.name && patch.name !== prev.name) {
      for (const c of state.courses) {
        if (c.instructorName === prev.name) {
          c.instructorName = next.name;
          if (patch.degree !== undefined) c.instructorDegree = next.degree;
          if (patch.photoUrl !== undefined) c.instructorPhotoUrl = next.photoUrl;
        }
      }
    } else {
      for (const c of state.courses) {
        if (c.instructorName === next.name) {
          if (patch.degree !== undefined) c.instructorDegree = next.degree;
          if (patch.photoUrl !== undefined) c.instructorPhotoUrl = next.photoUrl;
        }
      }
    }
    return memoryStore.listTeachers().find((t) => t.id === teacherId) ?? next;
  },

  deleteTeacher(teacherId: string) {
    const idx = state.teachers.findIndex((t) => t.id === teacherId);
    if (idx < 0) return false;
    state.teachers.splice(idx, 1);
    return true;
  },

  setCourseDetails(courseId: string, details: unknown) {
    state.courseDetails.set(courseId, details);
    return details;
  },

  setStudentProfile(profile: StudentProfile) {
    state.studentProfile = profile;
    return state.studentProfile;
  },

  ...contentMethods,

  stats() {
    return {
      students: memoryStore.allStudents().length,
      teachers: memoryStore.listTeachers().length,
      courses: state.courses.length,
      announcements: state.announcements.length,
      assignments: state.assignments.length,
      quizzes: state.quizzes.length,
      gdbs: state.gdbs.length,
      mails: contentMethods.listMails().length,
      challans: contentMethods.listChallans().length,
      lectures: contentMethods.listLectures().length,
      todos: contentMethods.listTodos().length,
      notes: contentMethods.listNotes().length,
      activityEvents: contentMethods.listActivityEvents().length,
      quizAttempts: contentMethods.listQuizAttempts().length,
      mode: "memory" as const,
    };
  },

  seed,
};
