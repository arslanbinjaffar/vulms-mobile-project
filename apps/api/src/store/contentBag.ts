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
import * as seed from "../seed.js";

export type ActivityEvent = {
  id: string;
  studentId: string;
  type: string;
  refId?: string;
  summary: string;
  payload?: unknown;
  at: string;
};

export type QuizAttemptRecord = {
  id: string;
  studentId: string;
  quizId: string;
  answers: number[];
  score: number;
  totalMarks: number;
  at: string;
};

export type EvaluationResponse = {
  id: string;
  studentId: string;
  courseCode: string;
  answers: Record<string, string>;
  likedMost?: string;
  likedLeast?: string;
  other?: string;
  at: string;
};

export type ContactInfo = {
  phone: string;
  email: string;
  address: string;
  helpUrl: string;
};

export type GradebookBundle = {
  midterm: MidtermRow[];
  studentGradeBook: GradeBookEntry[];
  gradingScheme: GradingSchemeRow[];
  projectedCgpa: { currentCgpa: number; effectiveCgpa: number; projected: number };
  coumDac: { status: string; message: string };
};

type ContentBag = {
  mails: MailMessage[];
  challans: Challan[];
  lectures: LectureSlot[];
  todos: TodoItem[];
  progress: CourseProgress[];
  studyScheme: StudySchemeCourse[];
  studentServices: StudentServiceLink[];
  courseSelection: CourseSelection;
  evaluationQuestions: EvaluationQuestion[];
  loginHistory: LoginHistory[];
  lessons: Lesson[];
  activitySessions: ActivitySession[];
  notes: Note[];
  midtermResults: MidtermRow[];
  gradeBook: GradeBookEntry[];
  gradingScheme: GradingSchemeRow[];
  projectedCgpa: { currentCgpa: number; effectiveCgpa: number; projected: number };
  coumDac: { status: string; message: string };
  contact: ContactInfo;
  noticeBoardCount: number;
  activityEvents: ActivityEvent[];
  quizAttempts: QuizAttemptRecord[];
  evaluationResponses: EvaluationResponse[];
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

function fresh(): ContentBag {
  return {
    mails: clone(seed.mails),
    challans: clone(seed.challans),
    lectures: clone(seed.lectures),
    todos: clone(seed.todos),
    progress: clone(seed.progress),
    studyScheme: clone(seed.studyScheme),
    studentServices: clone(seed.studentServices),
    courseSelection: clone(seed.courseSelection),
    evaluationQuestions: clone(seed.evaluationQuestions),
    loginHistory: clone(seed.loginHistory),
    lessons: clone(seed.lessons),
    activitySessions: clone(seed.activitySessions),
    notes: clone(seed.notes),
    midtermResults: clone(seed.midtermResults),
    gradeBook: clone(seed.gradeBook),
    gradingScheme: clone(seed.gradingScheme),
    projectedCgpa: {
      currentCgpa: seed.student.cgpa,
      effectiveCgpa: seed.student.effectiveCgpa,
      projected: 2.45,
    },
    coumDac: {
      status: "Clear",
      message: "No COUM/DAC record for current semester.",
    },
    contact: {
      phone: "+92-51-111-880-880",
      email: "support@vu.edu.pk",
      address: "Virtual University of Pakistan, Federal Government University",
      helpUrl: "https://www.vu.edu.pk",
    },
    noticeBoardCount: seed.noticeBoardCount,
    activityEvents: [],
    quizAttempts: [],
    evaluationResponses: [],
  };
}

export function contentBag(): ContentBag {
  const g = globalThis as unknown as { __vuLmsContent?: ContentBag };
  if (!g.__vuLmsContent) g.__vuLmsContent = fresh();
  return g.__vuLmsContent;
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function trackActivity(
  studentId: string,
  type: string,
  summary: string,
  refId?: string,
  payload?: unknown,
) {
  const bag = contentBag();
  const ev: ActivityEvent = {
    id: newId("act"),
    studentId,
    type,
    refId,
    summary,
    payload,
    at: new Date().toISOString(),
  };
  bag.activityEvents.unshift(ev);
  return ev;
}
