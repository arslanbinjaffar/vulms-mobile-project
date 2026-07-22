import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { LoginRequestSchema, CURRENT_SEMESTER } from "@vu-lms/shared";
import { z } from "zod";
import { getSession, login, logout } from "./auth.js";
import { getCourseDetails } from "./courseDetailsSeed.js";
import { getVulmsBridgeStatus, vulmsLogin } from "./vulmsBridge.js";
import {
  activitySessions,
  announcements,
  assignments,
  challans,
  courseSelection,
  courses,
  credentials,
  evaluationQuestions,
  gdbs,
  gradeBook,
  gradingScheme,
  lectures,
  lessons,
  loginHistory,
  mails,
  midtermResults,
  notes,
  noticeBoardCount,
  progress,
  quizAttempts,
  quizzes,
  student,
  studentProfile,
  studentServices,
  studyScheme,
  todos,
} from "./seed.js";

const app = new Hono();

app.use("*", cors());

app.get("/health", (c) => c.json({ ok: true, service: "vu-lms-api" }));

app.get("/api/bridge/status", (c) => c.json(getVulmsBridgeStatus()));

app.post("/api/auth/login", zValidator("json", LoginRequestSchema), async (c) => {
  const body = c.req.valid("json");
  await vulmsLogin(body.studentId, body.password);
  const result = login(body.studentId, body.password);
  if (!result) return c.json({ error: "Invalid student ID or password" }, 401);
  return c.json(result);
});

app.get("/api/auth/me", (c) => {
  const session = getSession(c.req.header("Authorization"));
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ student: session.student });
});

app.post("/api/auth/logout", (c) => {
  logout(c.req.header("Authorization"));
  return c.json({ ok: true });
});

app.get("/api/public/notice-count", (c) => c.json({ count: noticeBoardCount }));

function requireAuth(c: {
  req: { header: (n: string) => string | undefined };
  json: (b: unknown, s?: number) => Response;
}) {
  return getSession(c.req.header("Authorization"));
}

app.get("/api/courses", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ semester: CURRENT_SEMESTER, courses });
});

app.get("/api/courses/:id", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  const course = courses.find((x) => x.id === c.req.param("id"));
  if (!course) return c.json({ error: "Not found" }, 404);
  return c.json({ course });
});

app.get("/api/courses/:id/assignments", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: assignments.filter((a) => a.courseId === c.req.param("id")) });
});

app.get("/api/assignments/:id", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  const item = assignments.find((a) => a.id === c.req.param("id"));
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json({ item });
});

app.post("/api/assignments/:id/submit", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  const item = assignments.find((a) => a.id === c.req.param("id"));
  if (!item) return c.json({ error: "Not found" }, 404);
  item.status = "submitted";
  return c.json({ item });
});

app.get("/api/courses/:id/quizzes", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({
    items: quizzes
      .filter((q) => q.courseId === c.req.param("id"))
      .map(({ questions: _q, ...rest }) => rest),
  });
});

app.get("/api/quizzes/:id", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  const item = quizzes.find((q) => q.id === c.req.param("id"));
  if (!item) return c.json({ error: "Not found" }, 404);
  const safeQuestions = item.questions?.map(({ correctIndex: _c, ...q }) => q);
  return c.json({ item: { ...item, questions: safeQuestions } });
});

app.post(
  "/api/quizzes/:id/submit",
  zValidator("json", z.object({ answers: z.array(z.number()) })),
  (c) => {
    if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
    const item = quizzes.find((q) => q.id === c.req.param("id"));
    if (!item) return c.json({ error: "Not found" }, 404);
    const { answers } = c.req.valid("json");
    let score = 0;
    item.questions?.forEach((q, i) => {
      if (answers[i] === q.correctIndex) score += 1;
    });
    const total = item.questions?.length ?? 0;
    const obtained = total ? Math.round((score / total) * item.totalMarks) : 0;
    item.status = "attempted";
    item.obtainedMarks = obtained;
    quizAttempts.set(item.id, { answers, score: obtained });
    return c.json({ obtainedMarks: obtained, totalMarks: item.totalMarks, item });
  },
);

app.get("/api/courses/:id/gdbs", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  const course = courses.find((x) => x.id === c.req.param("id"));
  const items = gdbs
    .filter((g) => g.courseId === c.req.param("id"))
    .map(({ posts: _p, ...rest }) => ({
      ...rest,
      courseTitle: rest.courseTitle ?? course?.title,
    }));
  return c.json({
    course: course
      ? { id: course.id, code: course.code, title: course.title }
      : null,
    items,
  });
});

app.get("/api/gdbs/:id", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  const item = gdbs.find((g) => g.id === c.req.param("id"));
  if (!item) return c.json({ error: "Not found" }, 404);
  const page = Math.max(1, Number(c.req.query("page") ?? 1));
  const pageSize = Math.min(50, Math.max(5, Number(c.req.query("pageSize") ?? 10)));
  const mineOnly = c.req.query("mine") === "1";
  const sort = c.req.query("sort") === "asc" ? "asc" : "desc";
  let posts = [...(item.posts ?? [])].filter((p) => p.body.trim().length > 0);
  if (mineOnly) posts = posts.filter((p) => p.isMine);
  posts.sort((a, b) =>
    sort === "asc"
      ? +new Date(a.postedAt) - +new Date(b.postedAt)
      : +new Date(b.postedAt) - +new Date(a.postedAt),
  );
  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pagePosts = posts.slice(start, start + pageSize);
  const { posts: _all, ...rest } = item;
  return c.json({
    item: rest,
    posts: pagePosts,
    pagination: {
      page: safePage,
      pageSize,
      total,
      totalPages,
      totalReported: item.totalPosts ?? total,
    },
  });
});

app.post(
  "/api/gdbs/:id/submit",
  zValidator("json", z.object({ post: z.string().min(1) })),
  (c) => {
    if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
    const item = gdbs.find((g) => g.id === c.req.param("id"));
    if (!item) return c.json({ error: "Not found" }, 404);
    if (item.gdbStatus === "Closed") {
      return c.json({ error: "GDB is closed. Submission is not allowed." }, 400);
    }
    const body = c.req.valid("json").post;
    item.myPost = body;
    item.submitStatus = "Submitted";
    item.status = "submitted";
    const existing = item.posts?.find((p) => p.isMine);
    if (existing) {
      existing.body = body;
      existing.postedAt = new Date().toISOString();
    } else {
      item.posts = [
        {
          id: `gp-mine-${Date.now()}`,
          studentId: student.studentId.toUpperCase(),
          body,
          postedAt: new Date().toISOString(),
          feedback: null,
          isMine: true,
        },
        ...(item.posts ?? []),
      ];
      item.totalPosts = (item.totalPosts ?? 0) + 1;
    }
    return c.json({ item });
  },
);

app.get("/api/courses/:id/announcements", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({
    items: announcements.filter((a) => a.courseId === c.req.param("id")),
  });
});

app.get("/api/courses/:id/activities", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const items = activitySessions.filter((s) => s.courseId === id);
  return c.json({
    items,
    available: items.length > 0,
    message: items.length === 0 ? "No Session found!" : null,
  });
});

app.get("/api/courses/:id/lessons", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const course = courses.find((x) => x.id === id);
  if (!course) return c.json({ error: "Not found" }, 404);
  const details = getCourseDetails(id);
  return c.json({
    course,
    lessons: lessons.filter((l) => l.courseId === id),
    details,
    menu: details?.menu ?? [
      "Index / Lesson",
      "Course Information",
      "FAQs",
      "Glossary",
      "Books",
      "Download Files",
      "Internet Links",
      "Assessment Scheme",
    ],
  });
});

app.get("/api/courses/:id/details", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const course = courses.find((x) => x.id === id);
  if (!course) return c.json({ error: "Not found" }, 404);
  const details = getCourseDetails(id);
  if (!details) return c.json({ error: "Course details not found" }, 404);
  return c.json({ course, details });
});

app.get("/api/profile", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: studentProfile });
});

app.get("/api/profile/logins", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: loginHistory });
});

app.post(
  "/api/profile/change-password",
  zValidator(
    "json",
    z.object({
      currentPassword: z.string().min(4),
      newPassword: z.string().min(4),
    }),
  ),
  (c) => {
    if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
    const body = c.req.valid("json");
    if (body.currentPassword !== credentials.password) {
      return c.json({ error: "Current password is incorrect" }, 400);
    }
    credentials.password = body.newPassword;
    return c.json({ ok: true, message: "Password changed successfully." });
  },
);

app.get("/api/todos/classic", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  const pendingAssignments = assignments
    .filter((a) => a.status === "not_submitted")
    .map((a) => ({ id: a.id, title: a.title, courseCode: a.courseCode }));
  const pendingQuizzes = quizzes
    .filter((q) => q.status === "open")
    .map((q) => ({ id: q.id, title: q.title, courseCode: q.courseCode }));
  const pendingGdbs = gdbs
    .filter((g) => g.gdbStatus === "Open" && g.submitStatus === "Not Submitted")
    .map((g) => ({ id: g.id, title: g.title, courseCode: g.courseCode }));
  return c.json({
    assignments: pendingAssignments,
    quizzes: pendingQuizzes,
    gdbs: pendingGdbs,
    practicals: [] as { id: string; title: string; courseCode: string }[],
  });
});

app.get("/api/todos", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: todos });
});

app.get("/api/gradebook", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({
    semester: `${CURRENT_SEMESTER} - Regular`,
    studentGradeBook: gradeBook,
    midterm: midtermResults,
    gradingScheme,
    projectedCgpa: {
      currentCgpa: student.cgpa,
      effectiveCgpa: student.effectiveCgpa,
      projected: 2.45,
    },
    coumDac: {
      status: "Clear",
      message: "No COUM/DAC record for current semester.",
    },
  });
});

app.get("/api/progress", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: progress });
});

app.get("/api/account-book", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  const totalPayable = challans
    .filter((x) => x.status !== "paid")
    .reduce((s, x) => s + x.balance, 0);
  return c.json({ items: challans, totalPayable, totalPayableUsd: 0 });
});

app.get("/api/lectures", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({
    items: lectures,
    available: lectures.length > 0,
    message:
      lectures.length === 0
        ? `Weekly Lectures schedule for ${student.studentId} is not available.`
        : null,
  });
});

app.get("/api/mail", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: mails });
});

app.get("/api/mail/:id", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  const item = mails.find((m) => m.id === c.req.param("id"));
  if (!item) return c.json({ error: "Not found" }, 404);
  item.unread = false;
  return c.json({ item });
});

app.get("/api/notes", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  const q = c.req.query("q")?.toLowerCase();
  const items = q
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
      )
    : notes;
  return c.json({ items });
});

app.post(
  "/api/notes",
  zValidator(
    "json",
    z.object({ title: z.string().min(1), body: z.string().min(1) }),
  ),
  (c) => {
    if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
    const body = c.req.valid("json");
    const now = new Date().toISOString();
    const note = {
      id: `n-${Date.now()}`,
      title: body.title,
      body: body.body,
      createdAt: now,
      updatedAt: now,
    };
    notes.unshift(note);
    return c.json({ item: note }, 201);
  },
);

app.get("/api/study-scheme", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({
    degree: "BS",
    program: "Information Technology",
    version: "Spring 2021",
    items: studyScheme,
  });
});

app.get("/api/studied-courses", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ courses });
});

app.get("/api/eid-card", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({
    front: {
      name: student.name,
      studentId: student.studentId,
      program: student.program,
      photoUrl: student.avatarUrl,
    },
    back: {
      validUpto: student.validUpto ?? "May 2027",
      address: "Virtual University of Pakistan, Islamabad",
      phone: "+92-51-111-880-880",
      instructions: "This e-ID card is for VU student identification purposes.",
    },
  });
});

app.get("/api/student-services", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: studentServices });
});

app.get("/api/course-selection", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: courseSelection });
});

app.get("/api/teacher-evaluation", (c) => {
  if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({
    courseCode: "CS507",
    courseTitle: "Introduction to Information Systems",
    questions: evaluationQuestions,
  });
});

app.post(
  "/api/teacher-evaluation",
  zValidator(
    "json",
    z.object({
      answers: z.record(z.string()),
      likedMost: z.string().optional(),
      likedLeast: z.string().optional(),
      other: z.string().optional(),
    }),
  ),
  (c) => {
    if (!requireAuth(c)) return c.json({ error: "Unauthorized" }, 401);
    return c.json({ ok: true, message: "Evaluation submitted. Thank you." });
  },
);

app.get("/api/contact", (c) =>
  c.json({
    phone: "+92-51-111-880-880",
    email: "support@vu.edu.pk",
    address: "Virtual University of Pakistan, Federal Government University",
    helpUrl: "https://www.vu.edu.pk",
  }),
);

export default app;
