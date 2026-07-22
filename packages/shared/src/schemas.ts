import { z } from "zod";

export const StudentSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  name: z.string(),
  program: z.string(),
  cgpa: z.number(),
  effectiveCgpa: z.number(),
  creditsEarned: z.number(),
  creditsExempted: z.number(),
  currentSemesterNo: z.number(),
  avatarUrl: z.string().nullable(),
  validUpto: z.string().optional(),
  email: z.string().optional(),
  formNo: z.string().optional(),
  vuRegistrationNo: z.string().optional(),
  admissionDate: z.string().optional(),
  virtualCampusCode: z.string().optional(),
  fieldOfStudy: z.string().optional(),
});

export const StudentProfileSchema = z.object({
  summary: z.object({
    name: z.string(),
    studentId: z.string(),
    email: z.string(),
    fieldOfStudy: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  studentProfile: z.record(z.string()),
  personalInformation: z.record(z.string()),
  academicHistory: z.array(
    z.object({
      degree: z.string(),
      institute: z.string(),
      year: z.string(),
      marks: z.string(),
    }),
  ),
  correctionNote: z.string(),
});

export const LoginHistorySchema = z.object({
  id: z.string(),
  at: z.string(),
  ip: z.string(),
  device: z.string(),
  location: z.string().nullable(),
});

export const LessonSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  number: z.number(),
  title: z.string(),
  duration: z.string(),
  forumStatus: z.enum(["Open", "Closed"]),
  forumCount: z.number(),
  hasVideo: z.boolean(),
  hasPdf: z.boolean(),
});

export const WeekLessonItemSchema = z.object({
  id: z.string(),
  number: z.number(),
  title: z.string(),
  forumStatus: z.enum(["Open", "Closed", "N/A"]),
  forumCount: z.number().nullable(),
  duration: z.string().nullable(),
  hasHandout: z.boolean().default(true),
});

export const WeekIndexSchema = z.object({
  id: z.string(),
  week: z.number(),
  label: z.string(),
  isCurrent: z.boolean().default(false),
  items: z.array(WeekLessonItemSchema),
});

export const CourseBookSchema = z.object({
  id: z.string(),
  title: z.string(),
  citation: z.string().nullable(),
  author: z.string(),
  edition: z.string(),
  publisher: z.string(),
});

export const CourseDownloadSchema = z.object({
  id: z.string(),
  title: z.string(),
  fileType: z.enum(["PPT", "PDF", "DOC", "ZIP", "OTHER"]),
  fileSize: z.string(),
  lastUpdated: z.string(),
  url: z.string(),
});

export const CourseLinkSchema = z.object({
  id: z.string(),
  url: z.string(),
  description: z.string(),
});

export const CourseFaqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

export const GlossaryTermSchema = z.object({
  id: z.string(),
  term: z.string(),
  definition: z.string(),
});

export const AssessmentSliceSchema = z.object({
  label: z.string(),
  weight: z.number(),
  color: z.string(),
});

export const CourseInformationSchema = z.object({
  course: z.string(),
  category: z.string(),
  creditHours: z.number(),
  sectionIncharge: z.string(),
  sectionEmail: z.string().nullable(),
  sectionPhone: z.string().nullable(),
  synopsis: z.string(),
  learningOutcomes: z.array(z.string()),
  courseContents: z.array(z.string()),
});

export const CourseDetailsSchema = z.object({
  courseId: z.string(),
  menu: z.array(z.string()),
  weeks: z.array(WeekIndexSchema),
  information: CourseInformationSchema,
  faqs: z.array(CourseFaqSchema),
  glossary: z.array(GlossaryTermSchema),
  books: z.array(CourseBookSchema),
  downloads: z.array(CourseDownloadSchema),
  links: z.array(CourseLinkSchema),
  assessment: z.array(AssessmentSliceSchema),
});

export const ActivitySessionSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string(),
  scheduledAt: z.string(),
  status: z.enum(["upcoming", "live", "ended"]),
});

export const ClassicTodoSchema = z.object({
  assignments: z.array(z.object({ id: z.string(), title: z.string(), courseCode: z.string() })),
  quizzes: z.array(z.object({ id: z.string(), title: z.string(), courseCode: z.string() })),
  gdbs: z.array(z.object({ id: z.string(), title: z.string(), courseCode: z.string() })),
  practicals: z.array(z.object({ id: z.string(), title: z.string(), courseCode: z.string() })),
});

export const CourseSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  department: z.string(),
  creditHours: z.number(),
  instructorName: z.string(),
  instructorDegree: z.string(),
  instructorPhotoUrl: z.string().nullable(),
  lectureCount: z.number(),
  semester: z.string(),
  announcementCount: z.number().default(0),
  assignmentCount: z.number().default(0),
  gdbCount: z.number().default(0),
  quizCount: z.number().default(0),
});

export const AssignmentStatusSchema = z.enum([
  "not_submitted",
  "submitted",
  "graded",
  "closed",
  "expired",
]);

export const AssignmentSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  courseCode: z.string(),
  title: z.string(),
  openAt: z.string(),
  closeAt: z.string(),
  status: AssignmentStatusSchema,
  marks: z.number().nullable(),
  totalMarks: z.number(),
  instructions: z.string(),
  assignmentFileUrl: z.string().nullable().optional(),
  solutionFileUrl: z.string().nullable().optional(),
  submittedFileSize: z.string().nullable().optional(),
  submittedAt: z.string().nullable().optional(),
  comments: z.string().nullable().optional(),
  gradedFileUrl: z.string().nullable().optional(),
});

export const QuizStatusSchema = z.enum([
  "open",
  "attempted",
  "closed",
  "results",
  "submitted",
  "result_declared",
]);

export const QuizQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  options: z.array(z.string()),
  correctIndex: z.number().optional(),
});

export const QuizSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  courseCode: z.string(),
  title: z.string(),
  openAt: z.string(),
  closeAt: z.string(),
  status: QuizStatusSchema,
  durationMinutes: z.number(),
  totalMarks: z.number(),
  obtainedMarks: z.number().nullable(),
  questions: z.array(QuizQuestionSchema).optional(),
  openCloseLabel: z.enum(["Open", "Closed"]).optional(),
  submittedAt: z.string().nullable().optional(),
});

export const GdbFeedbackSchema = z.enum([
  "Very Good",
  "Good",
  "Satisfactory",
  "Poor",
  "",
]);

export const GdbPostSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  body: z.string(),
  postedAt: z.string(),
  feedback: z.string().nullable(),
  isMine: z.boolean().default(false),
});

export const GdbSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  courseCode: z.string(),
  courseTitle: z.string().optional(),
  title: z.string(),
  openAt: z.string(),
  closeAt: z.string(),
  gdbStatus: z.enum(["Open", "Closed"]),
  submitStatus: z.enum(["Not Submitted", "Submitted"]),
  totalMarks: z.number(),
  obtainedMarks: z.number().nullable().optional(),
  questionDescription: z.string(),
  instructions: z.array(z.string()).default([]),
  myPost: z.string().nullable(),
  /** @deprecated use questionDescription */
  prompt: z.string().optional(),
  /** @deprecated use gdbStatus/submitStatus */
  status: z.enum(["open", "submitted", "closed"]).optional(),
  posts: z.array(GdbPostSchema).optional(),
  totalPosts: z.number().optional(),
});

export const AnnouncementSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  courseCode: z.string(),
  title: z.string(),
  body: z.string(),
  createdAt: z.string(),
  unread: z.boolean(),
});

export const TodoTypeSchema = z.enum([
  "assignment",
  "gdb",
  "quiz",
  "pending_fee",
  "quiz_results",
  "datesheet",
]);

export const TodoItemSchema = z.object({
  id: z.string(),
  type: TodoTypeSchema,
  title: z.string(),
  courseCode: z.string().nullable(),
  startAt: z.string(),
  endAt: z.string(),
  refId: z.string().nullable(),
  courseId: z.string().nullable(),
});

export const MidtermRowSchema = z.object({
  courseCode: z.string(),
  courseTitle: z.string(),
  marks: z.number(),
  totalMarks: z.number(),
  percentage: z.number(),
  classAverage: z.number(),
  examAttendance: z.number(),
  remarks: z.string().nullable(),
});

export const GradeBookEntrySchema = z.object({
  courseCode: z.string(),
  courseTitle: z.string(),
  assignments: z.number().nullable(),
  gdbs: z.number().nullable(),
  quizzes: z.number().nullable(),
  midterm: z.number().nullable(),
  finalTerm: z.number().nullable(),
  total: z.number().nullable(),
  grade: z.string().nullable(),
});

export const GradingSchemeRowSchema = z.object({
  component: z.string(),
  weight: z.number(),
});

export const ChallanSchema = z.object({
  id: z.string(),
  challanNo: z.string(),
  challanType: z.string(),
  payable: z.number(),
  paid: z.number(),
  balance: z.number(),
  dueDate: z.string(),
  paidDate: z.string().nullable(),
  paymentMode: z.string().nullable(),
  status: z.enum(["paid", "unpaid", "partial"]),
});

export const ProgressSliceSchema = z.object({
  submitted: z.number(),
  notSubmitted: z.number(),
});

export const CourseProgressSchema = z.object({
  courseId: z.string(),
  courseCode: z.string(),
  courseTitle: z.string(),
  assignments: ProgressSliceSchema,
  gdb: ProgressSliceSchema.nullable(),
  quizzes: ProgressSliceSchema,
});

export const LectureSlotSchema = z.object({
  id: z.string(),
  courseCode: z.string(),
  title: z.string(),
  day: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export const MailMessageSchema = z.object({
  id: z.string(),
  from: z.string(),
  subject: z.string(),
  body: z.string(),
  createdAt: z.string(),
  unread: z.boolean(),
});

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const StudySchemeCourseSchema = z.object({
  code: z.string(),
  title: z.string(),
  type: z.string(),
  courseType: z.string(),
  creditHours: z.number(),
  group: z.string().nullable(),
  status: z.enum(["Studied", "Exempted", "Pending"]),
  semester: z.number(),
});

export const StudentServiceLinkSchema = z.object({
  id: z.string(),
  category: z.enum(["Academics", "Accounts", "Examinations", "Registrar"]),
  title: z.string(),
  external: z.boolean().default(false),
  highlight: z.boolean().default(false),
});

export const CourseSelectionSchema = z.object({
  studentId: z.string(),
  name: z.string(),
  studyProgram: z.string(),
  cgpa: z.number(),
  effectiveCgpa: z.number(),
  creditsEarned: z.number(),
  creditsExempted: z.number(),
  currentSemesterNo: z.number(),
  semesterLabel: z.string(),
  isOpen: z.boolean(),
  closedMessage: z.string().nullable(),
});

export const EvaluationQuestionSchema = z.object({
  id: z.string(),
  section: z.string(),
  text: z.string(),
});

export const LoginRequestSchema = z.object({
  studentId: z.string().min(3),
  password: z.string().min(4),
});

export type Student = z.infer<typeof StudentSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Assignment = z.infer<typeof AssignmentSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type Gdb = z.infer<typeof GdbSchema>;
export type GdbPost = z.infer<typeof GdbPostSchema>;
export type Announcement = z.infer<typeof AnnouncementSchema>;
export type TodoItem = z.infer<typeof TodoItemSchema>;
export type MidtermRow = z.infer<typeof MidtermRowSchema>;
export type GradeBookEntry = z.infer<typeof GradeBookEntrySchema>;
export type GradingSchemeRow = z.infer<typeof GradingSchemeRowSchema>;
export type Challan = z.infer<typeof ChallanSchema>;
export type CourseProgress = z.infer<typeof CourseProgressSchema>;
export type LectureSlot = z.infer<typeof LectureSlotSchema>;
export type MailMessage = z.infer<typeof MailMessageSchema>;
export type Note = z.infer<typeof NoteSchema>;
export type StudySchemeCourse = z.infer<typeof StudySchemeCourseSchema>;
export type StudentServiceLink = z.infer<typeof StudentServiceLinkSchema>;
export type CourseSelection = z.infer<typeof CourseSelectionSchema>;
export type EvaluationQuestion = z.infer<typeof EvaluationQuestionSchema>;
export type StudentProfile = z.infer<typeof StudentProfileSchema>;
export type LoginHistory = z.infer<typeof LoginHistorySchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type WeekIndex = z.infer<typeof WeekIndexSchema>;
export type CourseBook = z.infer<typeof CourseBookSchema>;
export type CourseDownload = z.infer<typeof CourseDownloadSchema>;
export type CourseLink = z.infer<typeof CourseLinkSchema>;
export type CourseFaq = z.infer<typeof CourseFaqSchema>;
export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;
export type AssessmentSlice = z.infer<typeof AssessmentSliceSchema>;
export type CourseInformation = z.infer<typeof CourseInformationSchema>;
export type CourseDetails = z.infer<typeof CourseDetailsSchema>;
export type ActivitySession = z.infer<typeof ActivitySessionSchema>;
export type ClassicTodo = z.infer<typeof ClassicTodoSchema>;
