import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { LoginRequestSchema, CURRENT_SEMESTER } from "@vu-lms/shared";
import { z } from "zod";
import { getStudentSession, loginStudent, logout } from "./auth.js";
import adminRoutes from "./adminRoutes.js";
import { getStore, storeMode } from "./store/index.js";
import { getVulmsBridgeStatus, vulmsLogin } from "./vulmsBridge.js";

const app = new Hono();

const corsOrigins = [
  "https://vu-lms-admin.vercel.app",
  "http://localhost:3001",
  "http://localhost:3000",
];

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";
      if (corsOrigins.includes(origin)) return origin;
      // Preview / Expo web / local tunnels
      if (origin.endsWith(".vercel.app") || origin.startsWith("http://localhost")) {
        return origin;
      }
      return origin;
    },
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
  }),
);

app.get("/", async (c) =>
  c.json({
    ok: true,
    service: "vu-lms-api",
    health: "/health",
    store: storeMode(),
    demoLogin: { studentId: "bc230201247", password: "password123" },
    adminLogin: { username: "admin", password: "admin123" },
  }),
);

app.get("/health", (c) =>
  c.json({ ok: true, service: "vu-lms-api", store: storeMode() }),
);

app.route("/api/admin", adminRoutes);

app.get("/api/bridge/status", (c) => c.json(getVulmsBridgeStatus()));

app.post("/api/auth/login", zValidator("json", LoginRequestSchema), async (c) => {
  const body = c.req.valid("json");
  await vulmsLogin(body.studentId, body.password);
  const result = await loginStudent(body.studentId, body.password);
  if (!result) return c.json({ error: "Invalid student ID or password" }, 401);
  const store = getStore();
  await Promise.resolve(
    store.recordLogin(result.student.studentId, {
      at: new Date().toISOString(),
      ip: c.req.header("x-forwarded-for") ?? "0.0.0.0",
      device: c.req.header("user-agent")?.slice(0, 80) ?? "VU LMS Mobile",
      location: null,
    }),
  );
  return c.json(result);
});

app.get("/api/auth/me", async (c) => {
  const session = await getStudentSession(c.req.header("Authorization"));
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ student: session.student });
});

app.post("/api/auth/logout", (c) => {
  logout(c.req.header("Authorization"));
  return c.json({ ok: true });
});

app.get("/api/public/notice-count", async (c) =>
  c.json({ count: await Promise.resolve(getStore().getNoticeCount()) }),
);

async function requireAuth(c: {
  req: { header: (n: string) => string | undefined };
}) {
  return getStudentSession(c.req.header("Authorization"));
}

app.get("/api/courses", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  const courses = await Promise.resolve(getStore().listCourses());
  return c.json({ semester: CURRENT_SEMESTER, courses });
});

app.get("/api/courses/:id", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  const course = await Promise.resolve(getStore().getCourse(c.req.param("id")));
  if (!course) return c.json({ error: "Not found" }, 404);
  return c.json({ course });
});

app.get("/api/courses/:id/assignments", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  const items = (await Promise.resolve(getStore().listAssignments())).filter(
    (a) => a.courseId === c.req.param("id"),
  );
  return c.json({ items });
});

app.get("/api/assignments/:id", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  const item = (await Promise.resolve(getStore().listAssignments())).find(
    (a) => a.id === c.req.param("id"),
  );
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json({ item });
});

app.post("/api/assignments/:id/submit", async (c) => {
  const session = await requireAuth(c);
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  const store = getStore();
  const item = (await Promise.resolve(store.listAssignments())).find(
    (a) => a.id === c.req.param("id"),
  );
  if (!item) return c.json({ error: "Not found" }, 404);
  item.status = "submitted";
  await Promise.resolve(store.upsertAssignment(item));
  store.trackActivity(
    session.student.studentId,
    "assignment_submit",
    `Submitted assignment ${item.title}`,
    item.id,
  );
  return c.json({ item });
});

app.get("/api/courses/:id/quizzes", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  const items = (await Promise.resolve(getStore().listQuizzes()))
    .filter((q) => q.courseId === c.req.param("id"))
    .map(({ questions: _q, ...rest }) => rest);
  return c.json({ items });
});

app.get("/api/quizzes/:id", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  const item = (await Promise.resolve(getStore().listQuizzes())).find(
    (q) => q.id === c.req.param("id"),
  );
  if (!item) return c.json({ error: "Not found" }, 404);
  const safeQuestions = item.questions?.map(({ correctIndex: _c, ...q }) => q);
  return c.json({ item: { ...item, questions: safeQuestions } });
});

app.post(
  "/api/quizzes/:id/submit",
  zValidator("json", z.object({ answers: z.array(z.number()) })),
  async (c) => {
    const session = await requireAuth(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const store = getStore();
    const item = (await Promise.resolve(store.listQuizzes())).find(
      (q) => q.id === c.req.param("id"),
    );
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
    await Promise.resolve(store.upsertQuiz(item));
    store.recordQuizAttempt({
      studentId: session.student.studentId,
      quizId: item.id,
      answers,
      score: obtained,
      totalMarks: item.totalMarks,
    });
    return c.json({ obtainedMarks: obtained, totalMarks: item.totalMarks, item });
  },
);

app.get("/api/courses/:id/gdbs", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  const course = await Promise.resolve(getStore().getCourse(c.req.param("id")));
  const allGdbs = await Promise.resolve(getStore().listGdbs());
  const items = allGdbs
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

app.get("/api/gdbs/:id", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  const item = (await Promise.resolve(getStore().listGdbs())).find(
    (g) => g.id === c.req.param("id"),
  );
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
  async (c) => {
    const session = await requireAuth(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const store = getStore();
    const item = (await Promise.resolve(store.listGdbs())).find(
      (g) => g.id === c.req.param("id"),
    );
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
          studentId: session.student.studentId.toUpperCase(),
          body,
          postedAt: new Date().toISOString(),
          feedback: null,
          isMine: true,
        },
        ...(item.posts ?? []),
      ];
      item.totalPosts = (item.totalPosts ?? 0) + 1;
    }
    await Promise.resolve(store.upsertGdb(item));
    store.trackActivity(
      session.student.studentId,
      "gdb_submit",
      `Submitted GDB ${item.title}`,
      item.id,
    );
    return c.json({ item });
  },
);

app.get("/api/courses/:id/announcements", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  const items = await Promise.resolve(
    getStore().listAnnouncements(c.req.param("id")),
  );
  return c.json({ items });
});

app.get("/api/courses/:id/activities", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const items = await Promise.resolve(getStore().listActivities(id));
  return c.json({
    items,
    available: items.length > 0,
    message: items.length === 0 ? "No Session found!" : null,
  });
});

app.get("/api/courses/:id/lessons", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const store = getStore();
  const course = await Promise.resolve(store.getCourse(id));
  if (!course) return c.json({ error: "Not found" }, 404);
  const details = await Promise.resolve(store.getCourseDetails(id));
  const courseLessons = await Promise.resolve(store.listLessons(id));
  return c.json({
    course,
    lessons: courseLessons,
    details,
    menu:
      (details as { menu?: string[] } | null)?.menu ?? [
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

app.get("/api/courses/:id/details", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const store = getStore();
  const course = await Promise.resolve(store.getCourse(id));
  if (!course) return c.json({ error: "Not found" }, 404);
  const details = await Promise.resolve(store.getCourseDetails(id));
  if (!details) return c.json({ error: "Course details not found" }, 404);
  return c.json({ course, details });
});

app.get("/api/profile", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: await Promise.resolve(getStore().getStudentProfile()) });
});

app.get("/api/profile/logins", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: await Promise.resolve(getStore().listLoginHistory()) });
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
  async (c) => {
    const session = await requireAuth(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const body = c.req.valid("json");
    const store = getStore();
    const auth = await Promise.resolve(
      store.findStudentAuth(session.student.studentId),
    );
    if (!auth || auth.password !== body.currentPassword) {
      return c.json({ error: "Current password is incorrect" }, 400);
    }
    await Promise.resolve(
      store.updateStudent(session.student.id, { password: body.newPassword }),
    );
    store.trackActivity(session.student.studentId, "password_change", "Password changed");
    return c.json({ ok: true, message: "Password changed successfully." });
  },
);

app.get("/api/todos/classic", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  const store = getStore();
  const [assignments, quizzes, gdbs] = await Promise.all([
    Promise.resolve(store.listAssignments()),
    Promise.resolve(store.listQuizzes()),
    Promise.resolve(store.listGdbs()),
  ]);
  return c.json({
    assignments: assignments
      .filter((a) => a.status === "not_submitted")
      .map((a) => ({ id: a.id, title: a.title, courseCode: a.courseCode })),
    quizzes: quizzes
      .filter((q) => q.status === "open")
      .map((q) => ({ id: q.id, title: q.title, courseCode: q.courseCode })),
    gdbs: gdbs
      .filter((g) => g.gdbStatus === "Open" && g.submitStatus === "Not Submitted")
      .map((g) => ({ id: g.id, title: g.title, courseCode: g.courseCode })),
    practicals: [] as { id: string; title: string; courseCode: string }[],
  });
});

app.get("/api/todos", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: await Promise.resolve(getStore().listTodos()) });
});

app.get("/api/gradebook", async (c) => {
  const session = await requireAuth(c);
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  const gb = await Promise.resolve(getStore().getGradebook());
  return c.json({
    semester: `${CURRENT_SEMESTER} - Regular`,
    studentGradeBook: gb.studentGradeBook,
    midterm: gb.midterm,
    gradingScheme: gb.gradingScheme,
    projectedCgpa: {
      ...gb.projectedCgpa,
      currentCgpa: session.student.cgpa,
      effectiveCgpa: session.student.effectiveCgpa,
    },
    coumDac: gb.coumDac,
  });
});

app.get("/api/progress", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: await Promise.resolve(getStore().listProgress()) });
});

app.get("/api/account-book", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  const challans = await Promise.resolve(getStore().listChallans());
  const totalPayable = challans
    .filter((x) => x.status !== "paid")
    .reduce((s, x) => s + x.balance, 0);
  return c.json({ items: challans, totalPayable, totalPayableUsd: 0 });
});

app.get("/api/lectures", async (c) => {
  const session = await requireAuth(c);
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  const lectures = await Promise.resolve(getStore().listLectures());
  return c.json({
    items: lectures,
    available: lectures.length > 0,
    message:
      lectures.length === 0
        ? `Weekly Lectures schedule for ${session.student.studentId} is not available.`
        : null,
  });
});

app.get("/api/mail", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: await Promise.resolve(getStore().listMails()) });
});

app.get("/api/mail/:id", async (c) => {
  const session = await requireAuth(c);
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  const item = getStore().markMailRead(c.req.param("id"), session.student.studentId);
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json({ item });
});

app.get("/api/notes", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  const q = c.req.query("q")?.toLowerCase();
  const notes = await Promise.resolve(getStore().listNotes());
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
  async (c) => {
    const session = await requireAuth(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const body = c.req.valid("json");
    const note = getStore().createNote(body, session.student.studentId);
    return c.json({ item: note }, 201);
  },
);

app.get("/api/study-scheme", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  return c.json({
    degree: "BS",
    program: "Information Technology",
    version: "Spring 2021",
    items: await Promise.resolve(getStore().listStudyScheme()),
  });
});

app.get("/api/studied-courses", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ courses: await Promise.resolve(getStore().listCourses()) });
});

app.get("/api/eid-card", async (c) => {
  const session = await requireAuth(c);
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  const student = session.student;
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

app.get("/api/student-services", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: await Promise.resolve(getStore().listStudentServices()) });
});

app.get("/api/course-selection", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: await Promise.resolve(getStore().getCourseSelection()) });
});

app.get("/api/teacher-evaluation", async (c) => {
  if (!(await requireAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  return c.json({
    courseCode: "CS507",
    courseTitle: "Introduction to Information Systems",
    questions: await Promise.resolve(getStore().listEvaluationQuestions()),
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
  async (c) => {
    const session = await requireAuth(c);
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    getStore().submitEvaluation(session.student.studentId, {
      courseCode: "CS507",
      ...c.req.valid("json"),
    });
    return c.json({ ok: true, message: "Evaluation submitted. Thank you." });
  },
);

app.get("/api/contact", async (c) => c.json(await Promise.resolve(getStore().getContact())));

app.notFound((c) => c.json({ error: "Not found", path: c.req.path }, 404));

export default app;
