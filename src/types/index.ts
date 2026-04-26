export type Theme = 'dark' | 'light';
export type NotificationLevel = 'subtle' | 'notorious';
export type CareerType = 'trimester' | 'semester';
export type Priority = 'low' | 'medium' | 'high';
export type SubjectStatus = 'aprobada' | 'en curso' | 'por ver';
export type Modality = 'virtual' | 'presencial';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  theme: Theme;
  notificationLevel: NotificationLevel;
  customQuotes?: string[];
}

export interface Career {
  id: string;
  name: string;
  type: CareerType;
  scheduleImageUrl?: string;
}

export interface Subject {
  id: string;
  name: string;
  period: number;
  grades: number[];
  finalGrade?: number;
  status: SubjectStatus;
  modality: Modality;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string
  priority: Priority;
  isExam: boolean;
  subjectId: string;
  careerId: string; // Helpful for master calendar
}
