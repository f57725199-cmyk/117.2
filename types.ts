
export enum ClassLevel {
  CLASS_9 = '9',
  CLASS_10 = '10',
  CLASS_11 = '11',
  CLASS_12 = '12'
}

export type BoardType = 'CBSE' | 'BSEB';

export interface TopicDetail {
  name: string;
  hours: number;
  days: number;
}

export interface DayPlan {
  day: number;
  tasks: {
    topic: string;
    hours: number;
    subject: string;
  }[];
}

export interface SubjectContent {
  subjectName: string;
  icon: string;
  topics: TopicDetail[];
}

export interface MonthSyllabus {
  month: number;
  label: string;
  description: string;
  color: string;
  content: SubjectContent[];
  sundayMcqTopic?: string;
  isRevision?: boolean;
  status: 'locked' | 'active' | 'completed';
  dailyRevisionPlan?: string[];
  dailySchedule?: DayPlan[];
}

export interface ClassSyllabus {
  classLevel: ClassLevel;
  goal: string;
  rules: string[];
  months: MonthSyllabus[];
}

export interface McqResult {
  score: number;
  date: string;
  topicId: string;
}

export interface UserProgress {
  loginId: string;
  loginMethod: 'email' | 'phone' | 'id';
  board: BoardType;
  completedTopics: string[];
  testedTopics: string[];
  currentMonth: number;
  selectedClass: ClassLevel;
  mcqResults: McqResult[];
  weakTopics: string[];
  skippedDaysCount: Record<number, number>;
  dailyTasks: {
    lastReset: string;
    studyDone: boolean;
    revisionDone: boolean;
    saturdayRevisionDone: boolean;
    sundayMcqCount: number;
    mcqDone: boolean;
  };
}
