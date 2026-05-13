export type SessionType = "breathing" | "meditation" | "focus";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAdmin: boolean;
  onboardingComplete: boolean;
  onboardingDuration?: number; // minutes from signup to first session
  dailyGoal: number; // minutes per day
  interests: string[];
  createdAt: Date;
  cohortWeek: string; // "2024-W01" format
  abTestGroup: "A" | "B";
  sessionCount: number;
  lastActiveDate?: Date;
  streakDays: number;
}

export interface Session {
  id: string;
  userId: string;
  sessionType: SessionType;
  duration: number; // minutes
  completedAt: Date;
  onboardingDuration?: number; // minutes from signup to this first session
}

export interface AnalyticsSummary {
  totalUsers: number;
  totalSessions: number;
  avgSessionDuration: number;
  retention90Day: number;
  updatedAt: Date;
}

export interface CohortRow {
  cohortWeek: string;
  users: number;
  retention: number[]; // index = week number (0-12)
}

export interface FunnelStep {
  name: string;
  value: number;
  dropoffPct?: number;
}

export interface AbTestMetrics {
  group: "A" | "B";
  retentionRate: number;
  avgSessionsPerWeek: number;
  completionRate: number;
  userCount: number;
}

export interface DauDataPoint {
  date: string;
  dau: number;
}

export interface SessionTypeBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface RetentionCurvePoint {
  week: number;
  fastOnboarders: number;
  slowOnboarders: number;
}

// Synthetic user for seed script
export interface SyntheticUser {
  userId: string;
  email: string;
  displayName: string;
  signupDate: Date;
  onboardingDuration: number;
  sessionCount: number;
  lastActiveDate: Date;
  cohortWeek: string;
  abTestGroup: "A" | "B";
  isAdmin: boolean;
  onboardingComplete: boolean;
  dailyGoal: number;
  interests: string[];
  streakDays: number;
}
