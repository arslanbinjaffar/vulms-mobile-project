import type {
  ActivitySession,
  Challan,
  CourseProgress,
  CourseSelection,
  EvaluationQuestion,
  GradeBookEntry,
  GradingSchemeRow,
  LectureSlot,
  Lesson,
  LoginHistory,
  MailMessage,
  MidtermRow,
  Note,
  StudentServiceLink,
  StudySchemeCourse,
  TodoItem,
} from "@vu-lms/shared";
import {
  contentBag,
  newId,
  trackActivity,
  type ContactInfo,
  type EvaluationResponse,
  type QuizAttemptRecord,
} from "./contentBag.js";

function upsertById<T extends { id: string }>(list: T[], row: T) {
  const idx = list.findIndex((x) => x.id === row.id);
  if (idx >= 0) list[idx] = row;
  else list.push(row);
  return row;
}

function removeById<T extends { id: string }>(list: T[], idKey: string) {
  const idx = list.findIndex((x) => x.id === idKey);
  if (idx < 0) return false;
  list.splice(idx, 1);
  return true;
}

/** Shared content + activity API mixed into memoryStore / dbStore. */
export const contentMethods = {
  getNoticeCount() {
    return contentBag().noticeBoardCount;
  },
  setNoticeCount(count: number) {
    contentBag().noticeBoardCount = count;
    return contentBag().noticeBoardCount;
  },

  getContact() {
    return contentBag().contact;
  },
  setContact(patch: Partial<ContactInfo>) {
    Object.assign(contentBag().contact, patch);
    return contentBag().contact;
  },

  listMails() {
    return contentBag().mails;
  },
  getMail(idKey: string) {
    return contentBag().mails.find((m) => m.id === idKey) ?? null;
  },
  upsertMail(row: MailMessage) {
    if (!row.id) row.id = newId("mail");
    return upsertById(contentBag().mails, row);
  },
  deleteMail(idKey: string) {
    return removeById(contentBag().mails, idKey);
  },
  markMailRead(idKey: string, studentId: string) {
    const item = contentBag().mails.find((m) => m.id === idKey);
    if (!item) return null;
    item.unread = false;
    trackActivity(studentId, "mail_read", `Read mail: ${item.subject}`, idKey);
    return item;
  },

  listChallans() {
    return contentBag().challans;
  },
  upsertChallan(row: Challan) {
    if (!row.id) row.id = newId("ch");
    return upsertById(contentBag().challans, row);
  },
  deleteChallan(idKey: string) {
    return removeById(contentBag().challans, idKey);
  },

  listLectures() {
    return contentBag().lectures;
  },
  upsertLecture(row: LectureSlot) {
    if (!row.id) row.id = newId("lec");
    return upsertById(contentBag().lectures, row);
  },
  deleteLecture(idKey: string) {
    return removeById(contentBag().lectures, idKey);
  },

  listTodos() {
    return contentBag().todos;
  },
  upsertTodo(row: TodoItem) {
    if (!row.id) row.id = newId("todo");
    return upsertById(contentBag().todos, row);
  },
  deleteTodo(idKey: string) {
    return removeById(contentBag().todos, idKey);
  },

  listProgress() {
    return contentBag().progress;
  },
  setProgress(items: CourseProgress[]) {
    contentBag().progress = items;
    return contentBag().progress;
  },
  upsertProgress(row: CourseProgress) {
    const list = contentBag().progress;
    const idx = list.findIndex((p) => p.courseId === row.courseId);
    if (idx >= 0) list[idx] = row;
    else list.push(row);
    return row;
  },

  listStudyScheme() {
    return contentBag().studyScheme;
  },
  upsertStudyScheme(row: StudySchemeCourse) {
    const list = contentBag().studyScheme;
    const idx = list.findIndex((x) => x.code === row.code && x.semester === row.semester);
    if (idx >= 0) list[idx] = row;
    else list.push(row);
    return row;
  },
  deleteStudyScheme(code: string) {
    const list = contentBag().studyScheme;
    const idx = list.findIndex((x) => x.code === code);
    if (idx < 0) return false;
    list.splice(idx, 1);
    return true;
  },

  listStudentServices() {
    return contentBag().studentServices;
  },
  upsertStudentService(row: StudentServiceLink) {
    if (!row.id) row.id = newId("svc");
    return upsertById(contentBag().studentServices, row);
  },
  deleteStudentService(idKey: string) {
    return removeById(contentBag().studentServices, idKey);
  },

  getCourseSelection() {
    return contentBag().courseSelection;
  },
  setCourseSelection(patch: Partial<CourseSelection>) {
    Object.assign(contentBag().courseSelection, patch);
    return contentBag().courseSelection;
  },

  listEvaluationQuestions() {
    return contentBag().evaluationQuestions;
  },
  upsertEvaluationQuestion(row: EvaluationQuestion) {
    if (!row.id) row.id = newId("eq");
    return upsertById(contentBag().evaluationQuestions, row);
  },
  deleteEvaluationQuestion(idKey: string) {
    return removeById(contentBag().evaluationQuestions, idKey);
  },
  listEvaluationResponses() {
    return contentBag().evaluationResponses;
  },
  submitEvaluation(
    studentId: string,
    input: {
      courseCode: string;
      answers: Record<string, string>;
      likedMost?: string;
      likedLeast?: string;
      other?: string;
    },
  ) {
    const row: EvaluationResponse = {
      id: newId("evr"),
      studentId,
      courseCode: input.courseCode,
      answers: input.answers,
      likedMost: input.likedMost,
      likedLeast: input.likedLeast,
      other: input.other,
      at: new Date().toISOString(),
    };
    contentBag().evaluationResponses.unshift(row);
    trackActivity(studentId, "evaluation", `Submitted evaluation for ${input.courseCode}`, row.id);
    return row;
  },

  listLoginHistory() {
    return contentBag().loginHistory;
  },
  recordLogin(studentId: string, entry: Omit<LoginHistory, "id"> & { id?: string }) {
    const row: LoginHistory = {
      id: entry.id ?? newId("lh"),
      at: entry.at,
      ip: entry.ip,
      device: entry.device,
      location: entry.location,
    };
    contentBag().loginHistory.unshift(row);
    trackActivity(studentId, "login", `Login from ${row.device} (${row.ip})`, row.id);
    return row;
  },

  listLessons(courseId?: string) {
    const items = contentBag().lessons;
    return courseId ? items.filter((l) => l.courseId === courseId) : items;
  },
  upsertLesson(row: Lesson) {
    if (!row.id) row.id = newId("les");
    return upsertById(contentBag().lessons, row);
  },
  deleteLesson(idKey: string) {
    return removeById(contentBag().lessons, idKey);
  },

  listActivities(courseId?: string) {
    const items = contentBag().activitySessions;
    return courseId ? items.filter((a) => a.courseId === courseId) : items;
  },
  upsertActivity(row: ActivitySession) {
    if (!row.id) row.id = newId("as");
    return upsertById(contentBag().activitySessions, row);
  },
  deleteActivity(idKey: string) {
    return removeById(contentBag().activitySessions, idKey);
  },

  listNotes() {
    return contentBag().notes;
  },
  createNote(input: { title: string; body: string }, studentId: string) {
    const now = new Date().toISOString();
    const note: Note = {
      id: newId("n"),
      title: input.title,
      body: input.body,
      createdAt: now,
      updatedAt: now,
    };
    contentBag().notes.unshift(note);
    trackActivity(studentId, "note_create", `Created note: ${note.title}`, note.id);
    return note;
  },
  deleteNote(idKey: string) {
    return removeById(contentBag().notes, idKey);
  },

  getGradebook() {
    const bag = contentBag();
    return {
      midterm: bag.midtermResults,
      studentGradeBook: bag.gradeBook,
      gradingScheme: bag.gradingScheme,
      projectedCgpa: bag.projectedCgpa,
      coumDac: bag.coumDac,
    };
  },
  setGradebook(patch: {
    midterm?: MidtermRow[];
    studentGradeBook?: GradeBookEntry[];
    gradingScheme?: GradingSchemeRow[];
    projectedCgpa?: { currentCgpa: number; effectiveCgpa: number; projected: number };
    coumDac?: { status: string; message: string };
  }) {
    const bag = contentBag();
    if (patch.midterm) bag.midtermResults = patch.midterm;
    if (patch.studentGradeBook) bag.gradeBook = patch.studentGradeBook;
    if (patch.gradingScheme) bag.gradingScheme = patch.gradingScheme;
    if (patch.projectedCgpa) bag.projectedCgpa = patch.projectedCgpa;
    if (patch.coumDac) bag.coumDac = patch.coumDac;
    return contentMethods.getGradebook();
  },
  upsertMidterm(row: MidtermRow) {
    const list = contentBag().midtermResults;
    const idx = list.findIndex((x) => x.courseCode === row.courseCode);
    if (idx >= 0) list[idx] = row;
    else list.push(row);
    return row;
  },
  upsertGradeBookEntry(row: GradeBookEntry) {
    const list = contentBag().gradeBook;
    const idx = list.findIndex((x) => x.courseCode === row.courseCode);
    if (idx >= 0) list[idx] = row;
    else list.push(row);
    return row;
  },

  listActivityEvents(studentId?: string) {
    const items = contentBag().activityEvents;
    return studentId ? items.filter((e) => e.studentId === studentId) : items;
  },
  listQuizAttempts(studentId?: string) {
    const items = contentBag().quizAttempts;
    return studentId ? items.filter((e) => e.studentId === studentId) : items;
  },
  recordQuizAttempt(row: Omit<QuizAttemptRecord, "id" | "at"> & { id?: string; at?: string }) {
    const full: QuizAttemptRecord = {
      id: row.id ?? newId("qa"),
      studentId: row.studentId,
      quizId: row.quizId,
      answers: row.answers,
      score: row.score,
      totalMarks: row.totalMarks,
      at: row.at ?? new Date().toISOString(),
    };
    contentBag().quizAttempts.unshift(full);
    trackActivity(
      row.studentId,
      "quiz_submit",
      `Quiz ${row.quizId} score ${row.score}/${row.totalMarks}`,
      row.quizId,
      { answers: row.answers },
    );
    return full;
  },
  trackActivity,
};
