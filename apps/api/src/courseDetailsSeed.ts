import type { CourseDetails } from "@vu-lms/shared";

const MENU = [
  "Index / Lesson",
  "Course Information",
  "FAQs",
  "Glossary",
  "Books",
  "Download Files",
  "Internet Links",
  "Assessment Scheme",
];

function weeksFor(courseId: string, currentWeek = 16): CourseDetails["weeks"] {
  return Array.from({ length: 16 }, (_, i) => {
    const week = i + 1;
    const isCurrent = week === currentWeek;
    return {
      id: `${courseId}-w${week}`,
      week,
      label: isCurrent ? `Week ${String(week).padStart(2, "0")} (Current)` : `Week ${String(week).padStart(2, "0")}`,
      isCurrent,
      items: isCurrent
        ? [
            {
              id: `${courseId}-w${week}-i1`,
              number: week === 16 ? 46 : week,
              title: week === 16 ? "Pre-Assessment" : `Lecture ${week}`,
              forumStatus: "Open" as const,
              forumCount: 10,
              duration: "N/A",
              hasHandout: true,
            },
          ]
        : [
            {
              id: `${courseId}-w${week}-i1`,
              number: week,
              title: `Lecture ${week}`,
              forumStatus: "Closed" as const,
              forumCount: 20 + week,
              duration: "00:45:00",
              hasHandout: true,
            },
          ],
    };
  });
}

const cs610Details: CourseDetails = {
  courseId: "c-cs610",
  menu: MENU,
  weeks: weeksFor("c-cs610", 16),
  information: {
    course: "CS610 Computer Networks",
    category: "Computer Science/Information Technology",
    creditHours: 3,
    sectionIncharge: "Khaqan Khawer",
    sectionEmail: "khaqan.khawer@vu.edu.pk",
    sectionPhone: "042-111-880-880 Ext. 4828",
    synopsis:
      "This course focuses on the technology, architecture, and software used by systems of network-connected computers. Students learn how packets, routing, addressing, and internet applications work together to build modern networks.",
    learningOutcomes: [
      "Define Computer Networks and list basic components.",
      "Explain technical concepts of Computer Networks.",
      "Differentiate types of network configurations.",
      "Design networks using manual calculations.",
      "Analyze why networks need security.",
    ],
    courseContents: [
      "Introduction, Motivation and Tools",
      "Packets, Frames and Error Detection",
      "LAN Wiring, Fiber Modems, and Repeaters",
      "Bridges, Switches and LAN Hardware",
      "Routing Algorithms",
      "ATM and Network Performance",
      "Internetworking Concepts",
      "IP Addresses and Subnetting",
      "IP Routing (Part-1)",
      "IP Routing (Part-2)",
      "IP Routing (Part-3)",
      "IP Routing (Part-4)",
      "IP Routing (Part-5)",
      "IP Routing (Part-6)",
      "UDP and TCP",
      "DNS, Email and WWW",
      "Network Security Basics",
    ],
  },
  faqs: [
    {
      id: "faq1",
      question: "What is a computer network?",
      answer:
        "A computer network is a set of computers connected to share resources and exchange data using communication links and protocols.",
    },
    {
      id: "faq2",
      question: "What is the difference between LAN and WAN?",
      answer:
        "LAN covers a small geographic area such as a campus, while WAN spans large distances and often connects multiple LANs.",
    },
    {
      id: "faq3",
      question: "What is an IP address?",
      answer:
        "An IP address is a numerical label assigned to each device on a network that uses the Internet Protocol for communication.",
    },
    {
      id: "faq4",
      question: "Why do we need subnetting?",
      answer:
        "Subnetting divides a large network into smaller networks for efficient routing, better security, and improved address management.",
    },
    {
      id: "faq5",
      question: "What is the role of a router?",
      answer:
        "A router forwards packets between different networks by choosing the best path based on routing information.",
    },
  ],
  glossary: [
    {
      id: "g1",
      term: "Access",
      definition: "The ability of a user or device to connect to and use network resources.",
    },
    {
      id: "g2",
      term: "ADC",
      definition: "Analog-to-Digital Converter; converts continuous analog signals into digital data.",
    },
    {
      id: "g3",
      term: "address mask",
      definition: "A bit mask used with an IP address to identify the network and host portions.",
    },
    {
      id: "g4",
      term: "ADSL",
      definition: "Asymmetric Digital Subscriber Line; a broadband technology over telephone lines.",
    },
    {
      id: "g5",
      term: "ALOHA",
      definition: "A pioneering random-access protocol for shared communication channels.",
    },
    {
      id: "g6",
      term: "Amplitude Modulation (AM)",
      definition: "A modulation technique where the amplitude of a carrier wave varies with the signal.",
    },
    {
      id: "g7",
      term: "Bandwidth",
      definition: "The capacity of a network link, usually measured in bits per second.",
    },
    {
      id: "g8",
      term: "Bridge",
      definition: "A device that connects and filters traffic between network segments at the data-link layer.",
    },
  ],
  books: [
    {
      id: "b1",
      title: "Computer Networks and Internets, with Internet Applications",
      citation: "Comer, D. (2008)",
      author: "Douglas E. Comer",
      edition: "5th",
      publisher: "Prentice Hall",
    },
    {
      id: "b2",
      title: "Computer Networks",
      citation: "Tanenbaum, A. (2010)",
      author: "Andrew S. Tanenbaum",
      edition: "5th",
      publisher: "Prentice Hall",
    },
    {
      id: "b3",
      title: "Networking: A Top-Down Approach Featuring the Internet",
      citation: null,
      author: "James F. Kurose and Keith W. Ross",
      edition: "sixth edition",
      publisher: "PEARSON",
    },
  ],
  downloads: [
    {
      id: "d1",
      title: "Lecture Presentations",
      fileType: "PPT",
      fileSize: "6.22 MB",
      lastUpdated: "2026-03-10T10:00:00.000Z",
      url: "#lecture-presentations",
    },
    {
      id: "d2",
      title: "CS610-LAB-1",
      fileType: "PDF",
      fileSize: "1.40 MB",
      lastUpdated: "2026-03-12T09:00:00.000Z",
      url: "#lab-1",
    },
    {
      id: "d3",
      title: "CS610 Handouts",
      fileType: "PDF",
      fileSize: "8.10 MB",
      lastUpdated: "2026-02-20T11:30:00.000Z",
      url: "#handouts",
    },
    {
      id: "d4",
      title: "Assignment Template",
      fileType: "DOC",
      fileSize: "220 KB",
      lastUpdated: "2026-04-01T08:00:00.000Z",
      url: "#assignment-template",
    },
    {
      id: "d5",
      title: "Lab Resources Pack",
      fileType: "ZIP",
      fileSize: "12.5 MB",
      lastUpdated: "2026-04-15T14:20:00.000Z",
      url: "#lab-pack",
    },
  ],
  links: [
    {
      id: "l1",
      url: "http://www.wikihow.com/Make-a-Network-Cable",
      description: "How to Make a Network Cable",
    },
    {
      id: "l2",
      url: "http://www.hackersdelight.org/crc.pdf",
      description: "CRC Details",
    },
    {
      id: "l3",
      url: "http://computernetworkingnotes.com/comptia-n-plus-study-guide/network-devices-hub-switch-router.html",
      description: "Networking Hardware Devices",
    },
    {
      id: "l4",
      url: "http://www.accesscomms.com.au/reference/lanwiringschemes.htm",
      description: "Wiring Schemes",
    },
    {
      id: "l5",
      url: "http://www.pcworld.com/article/224999/10_must_have_utilities_for_small_networks.html",
      description: "Networking Utilities",
    },
    {
      id: "l6",
      url: "http://www.asciitable.com/",
      description: "ASCII Table and Description",
    },
  ],
  assessment: [
    { label: "Assignments", weight: 10, color: "#E91E8C" },
    { label: "Discussion", weight: 5, color: "#F1C40F" },
    { label: "FinalTerm", weight: 60, color: "#E67E22" },
    { label: "MidTerm", weight: 20, color: "#3498DB" },
    { label: "Quizzes", weight: 5, color: "#1ABC9C" },
  ],
};

const cs201pDetails: CourseDetails = {
  courseId: "c-cs201p",
  menu: MENU,
  weeks: weeksFor("c-cs201p", 8),
  information: {
    course: "CS201P Introduction to Programming (Practical)",
    category: "Computer Science/Information Technology",
    creditHours: 1,
    sectionIncharge: "Lab Support Team",
    sectionEmail: "cs201p@vu.edu.pk",
    sectionPhone: "042-111-880-880",
    synopsis:
      "Practical labs reinforce programming fundamentals through hands-on exercises, debugging practice, and weekly assessments.",
    learningOutcomes: [
      "Write and compile basic programs.",
      "Use variables, loops, and functions correctly.",
      "Debug common compile-time and runtime errors.",
    ],
    courseContents: [
      "Lab setup and tools",
      "Variables and operators",
      "Control structures",
      "Functions and arrays",
      "File handling basics",
    ],
  },
  faqs: [
    {
      id: "f1",
      question: "What is computer programming?",
      answer: "Computer programming is the process of writing instructions that a computer can execute to solve a problem.",
    },
    {
      id: "f2",
      question: "What is software?",
      answer: "Software is a collection of programs and related data that tell a computer what to do.",
    },
    {
      id: "f3",
      question: "What is a compiler?",
      answer: "A compiler translates source code written in a high-level language into machine code.",
    },
    {
      id: "f4",
      question: "What is a source file?",
      answer: "A source file contains human-readable program code before compilation.",
    },
  ],
  glossary: [
    {
      id: "gg1",
      term: "Algorithm",
      definition: "A step-by-step procedure for solving a problem.",
    },
    {
      id: "gg2",
      term: "Bug",
      definition: "An error in a program that causes incorrect behavior.",
    },
    {
      id: "gg3",
      term: "Variable",
      definition: "A named storage location that holds a value during program execution.",
    },
  ],
  books: [
    {
      id: "bb1",
      title: "C++ How to Program",
      citation: "Deitel & Deitel",
      author: "Paul Deitel",
      edition: "10th",
      publisher: "Pearson",
    },
  ],
  downloads: [
    {
      id: "dd1",
      title: "Lab Manual",
      fileType: "PDF",
      fileSize: "2.1 MB",
      lastUpdated: "2026-03-01T10:00:00.000Z",
      url: "#lab-manual",
    },
  ],
  links: [
    {
      id: "ll1",
      url: "https://en.cppreference.com/",
      description: "C++ Reference",
    },
  ],
  assessment: [
    { label: "Assignments", weight: 20, color: "#E91E8C" },
    { label: "Discussion", weight: 0, color: "#F1C40F" },
    { label: "FinalTerm", weight: 50, color: "#E67E22" },
    { label: "MidTerm", weight: 20, color: "#3498DB" },
    { label: "Quizzes", weight: 10, color: "#1ABC9C" },
  ],
};

function cloneForCourse(
  base: CourseDetails,
  courseId: string,
  overrides?: Partial<CourseDetails>,
): CourseDetails {
  return {
    ...base,
    courseId,
    weeks: weeksFor(courseId, 12),
    ...overrides,
  };
}

export const courseDetailsById: Record<string, CourseDetails> = {
  "c-cs610": cs610Details,
  "c-cs201p": cs201pDetails,
  "c-cs304": cloneForCourse(cs610Details, "c-cs304", {
    information: {
      ...cs610Details.information,
      course: "CS304 Object Oriented Programming",
      synopsis:
        "This course covers object-oriented concepts including classes, objects, inheritance, polymorphism, and encapsulation.",
      courseContents: [
        "Introduction to OOP",
        "Classes and Objects",
        "Constructors and Destructors",
        "Inheritance",
        "Polymorphism",
        "Operator Overloading",
        "Templates",
      ],
    },
  }),
  "c-cs304p": cloneForCourse(cs201pDetails, "c-cs304p"),
  "c-cs604": cloneForCourse(cs610Details, "c-cs604", {
    information: {
      ...cs610Details.information,
      course: "CS604 Operating Systems",
      synopsis: "Study of process management, memory, file systems, and concurrency.",
      courseContents: [
        "OS Overview",
        "Processes and Threads",
        "CPU Scheduling",
        "Synchronization",
        "Deadlocks",
        "Memory Management",
        "File Systems",
      ],
    },
  }),
  "c-eng201": cloneForCourse(cs201pDetails, "c-eng201", {
    information: {
      ...cs201pDetails.information,
      course: "ENG201 Business and Technical English Writing",
      category: "English",
      creditHours: 3,
      synopsis: "Develop business and technical writing skills for professional communication.",
      courseContents: ["Technical reports", "Emails and memos", "Proposals", "Presentations"],
    },
    books: [
      {
        id: "eb1",
        title: "Technical Communication",
        citation: null,
        author: "Mike Markel",
        edition: "11th",
        publisher: "Bedford/St. Martin's",
      },
    ],
  }),
  "c-isl202": cloneForCourse(cs201pDetails, "c-isl202", {
    information: {
      ...cs201pDetails.information,
      course: "ISL202 Islamic Studies",
      category: "Islamic Studies",
      creditHours: 2,
      synopsis: "Core concepts of Islamic studies for undergraduate students.",
      courseContents: ["Aqeedah", "Ibadah", "Seerah overview", "Islamic ethics"],
    },
  }),
  "c-pak301": cloneForCourse(cs201pDetails, "c-pak301", {
    information: {
      ...cs201pDetails.information,
      course: "PAK301 Pakistan Studies",
      category: "Pakistan Studies",
      creditHours: 2,
      synopsis: "History, ideology, and contemporary issues of Pakistan.",
      courseContents: ["Ideology of Pakistan", "Constitutional development", "Foreign policy basics"],
    },
  }),
};

export function getCourseDetails(courseId: string): CourseDetails | null {
  return courseDetailsById[courseId] ?? null;
}
