import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const admins = pgTable("admins", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

export const students = pgTable("students", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  program: text("program").notNull(),
  cgpa: real("cgpa").notNull(),
  effectiveCgpa: real("effective_cgpa").notNull(),
  creditsEarned: integer("credits_earned").notNull(),
  creditsExempted: integer("credits_exempted").notNull(),
  currentSemesterNo: integer("current_semester_no").notNull(),
  avatarUrl: text("avatar_url"),
  validUpto: text("valid_upto"),
  email: text("email"),
  formNo: text("form_no"),
  vuRegistrationNo: text("vu_registration_no"),
  admissionDate: text("admission_date"),
  virtualCampusCode: text("virtual_campus_code"),
  fieldOfStudy: text("field_of_study"),
  profileJson: jsonb("profile_json"),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  role: text("role").notNull(), // admin | student
  subjectId: text("subject_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  creditHours: integer("credit_hours").notNull(),
  instructorName: text("instructor_name").notNull(),
  instructorDegree: text("instructor_degree").notNull(),
  instructorPhotoUrl: text("instructor_photo_url"),
  lectureCount: integer("lecture_count").notNull().default(0),
  semester: text("semester").notNull(),
  announcementCount: integer("announcement_count").notNull().default(0),
  assignmentCount: integer("assignment_count").notNull().default(0),
  gdbCount: integer("gdb_count").notNull().default(0),
  quizCount: integer("quiz_count").notNull().default(0),
  detailsJson: jsonb("details_json"),
});

export const announcements = pgTable("announcements", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  courseCode: text("course_code").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
  unread: boolean("unread").notNull().default(true),
});

export const assignments = pgTable("assignments", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
});

export const gdbs = pgTable("gdbs", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
});

export const teachers = pgTable("teachers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  degree: text("degree").notNull().default(""),
  department: text("department").notNull().default(""),
  photoUrl: text("photo_url"),
  email: text("email"),
});

export const meta = pgTable("meta", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});

