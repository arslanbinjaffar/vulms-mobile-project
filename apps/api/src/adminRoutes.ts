import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getAdminSession, loginAdmin, logout } from "./auth.js";
import { getStore, storeMode } from "./store/index.js";

const admin = new Hono();

function requireAdmin(c: { req: { header: (n: string) => string | undefined } }) {
  return getAdminSession(c.req.header("Authorization"));
}

admin.post(
  "/login",
  zValidator(
    "json",
    z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json");
    const result = await loginAdmin(body.username, body.password);
    if (!result) return c.json({ error: "Invalid username or password" }, 401);
    return c.json(result);
  },
);

admin.get("/me", async (c) => {
  const session = requireAdmin(c);
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  const store = getStore();
  const adminUser = await Promise.resolve(store.getAdminByUsername("admin"));
  return c.json({
    admin: adminUser
      ? { id: adminUser.id, username: adminUser.username, name: adminUser.name }
      : { id: session.subjectId, username: "admin", name: "Admin" },
    mode: storeMode(),
  });
});

admin.post("/logout", (c) => {
  logout(c.req.header("Authorization"));
  return c.json({ ok: true });
});

admin.get("/stats", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json(await Promise.resolve(getStore().stats()));
});

admin.get("/students", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: await Promise.resolve(getStore().allStudents()) });
});

admin.post(
  "/students",
  zValidator(
    "json",
    z.object({
      studentId: z.string().min(3),
      password: z.string().min(4),
      name: z.string().min(1),
      program: z.string().min(1),
    }),
  ),
  async (c) => {
    if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
    const body = c.req.valid("json");
    const existing = await Promise.resolve(getStore().findStudentAuth(body.studentId));
    if (existing) return c.json({ error: "Student ID already exists" }, 409);
    const student = await Promise.resolve(getStore().createStudent(body));
    return c.json({ student }, 201);
  },
);

admin.patch(
  "/students/:id",
  zValidator(
    "json",
    z.object({
      name: z.string().optional(),
      program: z.string().optional(),
      password: z.string().optional(),
      cgpa: z.number().optional(),
      currentSemesterNo: z.number().optional(),
    }),
  ),
  async (c) => {
    if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
    const student = await Promise.resolve(
      getStore().updateStudent(c.req.param("id"), c.req.valid("json")),
    );
    if (!student) return c.json({ error: "Not found" }, 404);
    return c.json({ student });
  },
);

admin.delete("/students/:id", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  const ok = await Promise.resolve(getStore().deleteStudent(c.req.param("id")));
  if (!ok) return c.json({ error: "Cannot delete primary demo student or not found" }, 400);
  return c.json({ ok: true });
});

admin.get("/teachers", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: await Promise.resolve(getStore().listTeachers()) });
});

admin.post(
  "/teachers",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1),
      degree: z.string().optional(),
      department: z.string().optional(),
      photoUrl: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
    }),
  ),
  async (c) => {
    if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
    const item = await Promise.resolve(getStore().createTeacher(c.req.valid("json")));
    return c.json({ item }, 201);
  },
);

admin.patch("/teachers/:id", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json().catch(() => ({}));
  const item = await Promise.resolve(getStore().updateTeacher(c.req.param("id"), body));
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json({ item });
});

admin.delete("/teachers/:id", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  await Promise.resolve(getStore().deleteTeacher(c.req.param("id")));
  return c.json({ ok: true });
});

admin.get("/courses", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: await Promise.resolve(getStore().listCourses()) });
});

admin.post(
  "/courses",
  zValidator(
    "json",
    z.object({
      code: z.string().min(2),
      title: z.string().min(2),
      department: z.string().min(1),
      creditHours: z.number().int().positive(),
      instructorName: z.string().min(1),
      instructorDegree: z.string().default(""),
      instructorPhotoUrl: z.string().nullable().default(null),
      lectureCount: z.number().int().nonnegative().default(0),
      semester: z.string().min(1),
      announcementCount: z.number().int().nonnegative().default(0),
      assignmentCount: z.number().int().nonnegative().default(0),
      gdbCount: z.number().int().nonnegative().default(0),
      quizCount: z.number().int().nonnegative().default(0),
    }),
  ),
  async (c) => {
    if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
    const course = await Promise.resolve(getStore().createCourse(c.req.valid("json")));
    return c.json({ course }, 201);
  },
);

admin.patch("/courses/:id", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json().catch(() => ({}));
  const course = await Promise.resolve(getStore().updateCourse(c.req.param("id"), body));
  if (!course) return c.json({ error: "Not found" }, 404);
  return c.json({ course });
});

admin.delete("/courses/:id", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  await Promise.resolve(getStore().deleteCourse(c.req.param("id")));
  return c.json({ ok: true });
});

admin.get("/announcements", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  const courseId = c.req.query("courseId") ?? undefined;
  return c.json({ items: await Promise.resolve(getStore().listAnnouncements(courseId)) });
});

admin.post(
  "/announcements",
  zValidator(
    "json",
    z.object({
      courseId: z.string().min(1),
      courseCode: z.string().min(1),
      title: z.string().min(1),
      body: z.string().min(1),
    }),
  ),
  async (c) => {
    if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
    const item = await Promise.resolve(getStore().createAnnouncement(c.req.valid("json")));
    return c.json({ item }, 201);
  },
);

admin.patch("/announcements/:id", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json().catch(() => ({}));
  const item = await Promise.resolve(getStore().updateAnnouncement(c.req.param("id"), body));
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json({ item });
});

admin.delete("/announcements/:id", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  await Promise.resolve(getStore().deleteAnnouncement(c.req.param("id")));
  return c.json({ ok: true });
});

admin.get("/assignments", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: await Promise.resolve(getStore().listAssignments()) });
});

admin.post("/assignments", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  if (!body?.id) body.id = `a-${Date.now().toString(36)}`;
  const item = await Promise.resolve(getStore().upsertAssignment(body));
  return c.json({ item }, 201);
});

admin.delete("/assignments/:id", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  await Promise.resolve(getStore().deleteAssignment(c.req.param("id")));
  return c.json({ ok: true });
});

admin.get("/quizzes", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: await Promise.resolve(getStore().listQuizzes()) });
});

admin.post("/quizzes", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  if (!body?.id) body.id = `q-${Date.now().toString(36)}`;
  const item = await Promise.resolve(getStore().upsertQuiz(body));
  return c.json({ item }, 201);
});

admin.delete("/quizzes/:id", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  await Promise.resolve(getStore().deleteQuiz(c.req.param("id")));
  return c.json({ ok: true });
});

admin.get("/gdbs", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: await Promise.resolve(getStore().listGdbs()) });
});

admin.post("/gdbs", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  if (!body?.id) body.id = `g-${Date.now().toString(36)}`;
  const item = await Promise.resolve(getStore().upsertGdb(body));
  return c.json({ item }, 201);
});

admin.delete("/gdbs/:id", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);
  await Promise.resolve(getStore().deleteGdb(c.req.param("id")));
  return c.json({ ok: true });
});

function guard(c: { req: { header: (n: string) => string | undefined } }) {
  return requireAdmin(c);
}

admin.get("/mails", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: getStore().listMails() });
});
admin.post("/mails", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  return c.json({ item: getStore().upsertMail(body) }, 201);
});
admin.patch("/mails/:id", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  const prev = getStore().getMail(c.req.param("id"));
  if (!prev) return c.json({ error: "Not found" }, 404);
  const body = await c.req.json();
  return c.json({ item: getStore().upsertMail({ ...prev, ...body, id: prev.id }) });
});
admin.delete("/mails/:id", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  getStore().deleteMail(c.req.param("id"));
  return c.json({ ok: true });
});

admin.get("/challans", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: getStore().listChallans() });
});
admin.post("/challans", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: getStore().upsertChallan(await c.req.json()) }, 201);
});
admin.patch("/challans/:id", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  const items = getStore().listChallans();
  const prev = items.find((x) => x.id === c.req.param("id"));
  if (!prev) return c.json({ error: "Not found" }, 404);
  return c.json({
    item: getStore().upsertChallan({ ...prev, ...(await c.req.json()), id: prev.id }),
  });
});
admin.delete("/challans/:id", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  getStore().deleteChallan(c.req.param("id"));
  return c.json({ ok: true });
});

admin.get("/lectures", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: getStore().listLectures() });
});
admin.post("/lectures", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: getStore().upsertLecture(await c.req.json()) }, 201);
});
admin.delete("/lectures/:id", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  getStore().deleteLecture(c.req.param("id"));
  return c.json({ ok: true });
});

admin.get("/todos", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: getStore().listTodos() });
});
admin.post("/todos", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: getStore().upsertTodo(await c.req.json()) }, 201);
});
admin.delete("/todos/:id", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  getStore().deleteTodo(c.req.param("id"));
  return c.json({ ok: true });
});

admin.get("/progress", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: getStore().listProgress() });
});
admin.put("/progress", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  const items = Array.isArray(body) ? body : body.items;
  return c.json({ items: getStore().setProgress(items) });
});

admin.get("/gradebook", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json(getStore().getGradebook());
});
admin.put("/gradebook", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json(getStore().setGradebook(await c.req.json()));
});

admin.get("/study-scheme", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: getStore().listStudyScheme() });
});
admin.post("/study-scheme", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: getStore().upsertStudyScheme(await c.req.json()) }, 201);
});
admin.delete("/study-scheme/:code", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  getStore().deleteStudyScheme(c.req.param("code"));
  return c.json({ ok: true });
});

admin.get("/student-services", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: getStore().listStudentServices() });
});
admin.post("/student-services", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: getStore().upsertStudentService(await c.req.json()) }, 201);
});
admin.delete("/student-services/:id", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  getStore().deleteStudentService(c.req.param("id"));
  return c.json({ ok: true });
});

admin.get("/course-selection", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: getStore().getCourseSelection() });
});
admin.put("/course-selection", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: getStore().setCourseSelection(await c.req.json()) });
});

admin.get("/evaluation-questions", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: getStore().listEvaluationQuestions() });
});
admin.post("/evaluation-questions", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: getStore().upsertEvaluationQuestion(await c.req.json()) }, 201);
});
admin.delete("/evaluation-questions/:id", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  getStore().deleteEvaluationQuestion(c.req.param("id"));
  return c.json({ ok: true });
});
admin.get("/evaluation-responses", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: getStore().listEvaluationResponses() });
});

admin.get("/login-history", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: getStore().listLoginHistory() });
});

admin.get("/lessons", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: getStore().listLessons(c.req.query("courseId") ?? undefined) });
});
admin.post("/lessons", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: getStore().upsertLesson(await c.req.json()) }, 201);
});
admin.delete("/lessons/:id", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  getStore().deleteLesson(c.req.param("id"));
  return c.json({ ok: true });
});

admin.get("/activities", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: getStore().listActivities(c.req.query("courseId") ?? undefined) });
});
admin.post("/activities", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: getStore().upsertActivity(await c.req.json()) }, 201);
});
admin.delete("/activities/:id", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  getStore().deleteActivity(c.req.param("id"));
  return c.json({ ok: true });
});

admin.get("/notes", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ items: getStore().listNotes() });
});
admin.delete("/notes/:id", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  getStore().deleteNote(c.req.param("id"));
  return c.json({ ok: true });
});

admin.get("/contact", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: getStore().getContact() });
});
admin.put("/contact", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: getStore().setContact(await c.req.json()) });
});

admin.get("/notice-count", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ count: getStore().getNoticeCount() });
});
admin.put("/notice-count", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  return c.json({ count: getStore().setNoticeCount(Number(body.count ?? 0)) });
});

admin.get("/courses/:id/details", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  const details = await Promise.resolve(getStore().getCourseDetails(c.req.param("id")));
  return c.json({ details });
});
admin.put("/courses/:id/details", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  const details = await Promise.resolve(
    getStore().setCourseDetails(c.req.param("id"), body.details ?? body),
  );
  return c.json({ details });
});

admin.get("/activity", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({
    items: getStore().listActivityEvents(c.req.query("studentId") ?? undefined),
  });
});
admin.get("/quiz-attempts", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({
    items: getStore().listQuizAttempts(c.req.query("studentId") ?? undefined),
  });
});

admin.get("/students/:id/profile", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ item: await Promise.resolve(getStore().getStudentProfile()) });
});
admin.put("/students/:id/profile", async (c) => {
  if (!guard(c)) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  return c.json({ item: await Promise.resolve(getStore().setStudentProfile(body)) });
});

export default admin;
