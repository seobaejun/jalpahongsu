// Firestore 데이터베이스 타입 정의

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  studentId?: string;
  university?: string;
  major?: string;
  year?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Experience {
  id: string;
  title: string;
  titleZh?: string;
  titleEn?: string;
  description: string;
  descriptionZh?: string;
  descriptionEn?: string;
  category: '配送型体验' | '访问型体验';
  tags: string[];
  tagsEn?: string[];
  participants: number;
  maxParticipants: number;
  daysLeft: number;
  image: string;
  images?: string[];
  isNew: boolean;
  status: 'recruiting' | 'ongoing' | 'completed';
  startDate?: Date;
  endDate?: Date;
  recruitmentStartDate?: string;
  recruitmentEndDate?: string;
  date?: string;
  time?: string;
  location?: string;
  locationZh?: string;
  locationEn?: string;
  requirements?: string[];
  requirementsZh?: string[];
  requirementsEn?: string[];
  benefits?: string[];
  benefitsZh?: string[];
  benefitsEn?: string[];
  rewards?: string[];
  contact?: string;
  activityType?: 'experience' | 'reporter';
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperienceApplication {
  id: string;
  userId: string;
  experienceId: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  appliedAt: Date;
  reviewedAt?: Date;
  completedAt?: Date;
  review?: string;
  rating?: number;
  feedback?: string;
}

export interface Review {
  id: string;
  userId: string;
  experienceId: string;
  applicationId: string;
  title: string;
  content: string;
  rating: number;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  helpful: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'application_approved' | 'application_rejected' | 'new_experience' | 'reminder' | 'reward';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface Reward {
  id: string;
  userId: string;
  experienceId: string;
  type: 'points' | 'cash' | 'product';
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'sent';
  createdAt: Date;
  processedAt?: Date;
}
